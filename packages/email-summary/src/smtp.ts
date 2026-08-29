/**
 * Minimal, dependency-free SMTP client over `node:net`/`node:tls`.
 * Supports implicit SSL (465), STARTTLS (587), and no-TLS (25), with
 * AUTH PLAIN authentication and UTF-8 (base64) message bodies. Outbound
 * connections honor an HTTP/SOCKS5 proxy from `HTTPS_PROXY`/`HTTP_PROXY`/
 * `ALL_PROXY` environment variables, falling back to the Windows system
 * proxy, so a local Clash/V2Ray tunnel can reach blocked SMTP hosts.
 * @module @jiobozi-dev-org/dsh-email-summary/src/smtp
 */

import { execFileSync } from 'node:child_process'
import { connect as netConnect } from 'node:net'
import type { Socket } from 'node:net'
import { connect as tlsConnect } from 'node:tls'
import type { TLSSocket } from 'node:tls'

type Conn = Socket | TLSSocket

/** One outbound email. */
export interface SmtpMail {
  host: string
  port: number
  secure: 'starttls' | 'ssl' | 'none'
  username: string
  password: string
  from: string
  to: string
  subject: string
  html: string
}

/** A pending command awaiting its SMTP reply code. */
interface PendingCommand {
  code: number
  resolve: (line: string) => void
  reject: (error: Error) => void
}

/** Connect-phase inactivity timeout (cleared once the SMTP greeting arrives). */
const CONNECT_TIMEOUT_MS = 20000

/** Per-command inactivity timeout: a server stall after the greeting still fails instead of hanging. */
const SMTP_IO_TIMEOUT_MS = 30000

/** One SMTP session: a command/response request-response layer over a socket. */
class SmtpSession {
  private buffer = ''
  private pending: PendingCommand | undefined
  private failed: Error | undefined

  constructor(private conn: Conn) {
    this.attach()
  }

  /** The underlying socket (used to upgrade STARTTLS in place). */
  get socket(): Conn { return this.conn }

  private onData = (chunk: string): void => { this.feed(chunk) }

  private onError = (error: Error): void => {
    this.settle(new Error(`SMTP socket error: ${error.message}`))
  }

  private onClose = (): void => {
    this.settle(new Error('SMTP connection closed unexpectedly'))
  }

  private attach(): void {
    this.conn.setEncoding('utf8')
    this.conn.on('data', this.onData)
    this.conn.on('error', this.onError)
    this.conn.on('close', this.onClose)
  }

  /** Remove this session's listeners (before wrapping the socket in TLS). */
  detach(): void {
    this.conn.off('data', this.onData)
    this.conn.off('error', this.onError)
    this.conn.off('close', this.onClose)
  }

  private settle(error: Error): void {
    if (this.failed === undefined) this.failed = error
    if (this.pending !== undefined) {
      const pending = this.pending
      this.pending = undefined
      pending.reject(error)
    }
  }

  /** Feed already-received bytes (e.g. leftover after a proxy tunnel handshake). */
  feed(chunk: string): void {
    this.buffer += chunk
    while (true) {
      const nl = this.buffer.indexOf('\n')
      if (nl === -1) return
      const line = this.buffer.slice(0, nl).replace(/\r$/, '')
      this.buffer = this.buffer.slice(nl + 1)
      if (this.pending === undefined) continue
      // A reply is final when its fourth character is a space (`250 `), not a
      // continuation dash (`250-`); multiline replies resolve on the final line.
      const isFinal = line.length >= 4
        && line[3] === ' '
        && line.slice(0, 3) === String(this.pending.code)
      if (!isFinal) continue
      const pending = this.pending
      this.pending = undefined
      pending.resolve(line)
    }
  }

  /** Send one command and await its expected reply code. */
  command(line: string, code: number): Promise<string> {
    if (this.failed !== undefined) return Promise.reject(this.failed)
    return new Promise<string>((resolve, reject) => {
      this.pending = { code, resolve, reject }
      this.conn.write(`${line}\r\n`)
    })
  }

  /** Await the next reply with a given code (no command written). */
  awaitReply(code: number): Promise<string> {
    if (this.failed !== undefined) return Promise.reject(this.failed)
    return new Promise<string>((resolve, reject) => {
      this.pending = { code, resolve, reject }
    })
  }

  end(): void {
    try { this.conn.end() } catch { /* already closed */ }
  }
}

/** One resolved outbound proxy. */
interface ProxyConfig {
  host: string
  port: number
  scheme: 'http' | 'socks5'
}

/** Parse a proxy URL / `host:port` string. */
function parseProxy(value: string): ProxyConfig | undefined {
  let s = value.trim()
  if (s === '') return undefined
  let scheme: ProxyConfig['scheme'] = 'http'
  if (/^socks5?:\/\//i.test(s)) { scheme = 'socks5'; s = s.replace(/^socks5?:\/\//i, '') }
  else if (/^https?:\/\//i.test(s)) { scheme = 'http'; s = s.replace(/^https?:\/\//i, '') }
  s = s.replace(/^[^@/]+@/, '') // strip user:pass@
  const colon = s.indexOf(':')
  const host = colon === -1 ? s : s.slice(0, colon)
  const port = Number(colon === -1 ? '80' : s.slice(colon + 1))
  if (host === '' || !Number.isFinite(port)) return undefined
  return { host, port, scheme }
}

/** Resolve an outbound proxy from env vars, then the Windows system proxy. */
function resolveProxy(): ProxyConfig | undefined {
  const envUrl = process.env.HTTPS_PROXY ?? process.env.https_proxy
    ?? process.env.HTTP_PROXY ?? process.env.http_proxy
    ?? process.env.ALL_PROXY ?? process.env.all_proxy
  if (envUrl !== undefined) return parseProxy(envUrl)

  if (process.platform === 'win32') {
    try {
      const out = execFileSync(
        'reg',
        ['query', 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings', '/v', 'ProxyServer'],
        { encoding: 'utf8', windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'] },
      )
      const match = out.match(/ProxyServer\s+REG_SZ\s+(.+?)\s*$/m)
      if (match !== null) {
        // Forms: `host:port`, `http=host:port;https=host:port`, `host:port;...`.
        const value = match[1]
        if (value === undefined) return undefined
        const first = (value.split(';')[0] ?? '').trim()
        const eq = first.indexOf('=')
        const hostPort = eq === -1 ? first : first.slice(eq + 1).trim()
        return parseProxy(hostPort)
      }
    } catch { /* no system proxy */ }
  }
  return undefined
}

/** HTTP CONNECT tunnel; resolves with bytes received after the handshake. */
function httpConnect(sock: Socket, host: string, port: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let buf = ''
    const onError = (error: Error): void => { cleanup(); reject(error) }
    const onData = (chunk: Buffer): void => {
      buf += chunk.toString('latin1')
      const idx = buf.indexOf('\r\n\r\n')
      if (idx === -1) return
      cleanup()
      const statusLine = buf.slice(0, buf.indexOf('\r\n'))
      const code = statusLine.split(' ')[1]
      if (code === '200') resolve(buf.slice(idx + 4))
      else reject(new Error(`代理 CONNECT 失败：${statusLine}`))
    }
    const cleanup = (): void => { sock.off('data', onData); sock.off('error', onError) }
    sock.on('data', onData)
    sock.on('error', onError)
    sock.write(`CONNECT ${host}:${port} HTTP/1.1\r\nHost: ${host}:${port}\r\n\r\n`)
  })
}

/** SOCKS5 (no-auth) tunnel; resolves with bytes received after the handshake. */
function socks5Connect(sock: Socket, host: string, port: number): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let buf = Buffer.alloc(0)
    let greetingDone = false
    const onError = (error: Error): void => { cleanup(); reject(error) }
    const onData = (chunk: Buffer): void => {
      buf = Buffer.concat([buf, chunk])
      if (!greetingDone && buf.length >= 2) {
        if (buf[0] !== 0x05 || buf[1] !== 0x00) {
          cleanup()
          reject(new Error('SOCKS5 代理不支持无认证'))
          return
        }
        buf = buf.slice(2)
        greetingDone = true
        const domain = Buffer.from(host, 'utf8')
        const head = Buffer.from([0x05, 0x01, 0x00, 0x03, domain.length])
        const portBuf = Buffer.alloc(2)
        portBuf.writeUInt16BE(port, 0)
        sock.write(Buffer.concat([head, domain, portBuf]))
      }
      if (greetingDone && buf.length >= 4) {
        const atyp = buf[3]
        let addrLen = 0
        if (atyp === 0x01) addrLen = 4
        else if (atyp === 0x04) addrLen = 16
        else if (atyp === 0x03) addrLen = buf[4] ?? 0
        const fullLen = 6 + addrLen
        if (buf.length < fullLen) return
        cleanup()
        const rep = buf[1]
        if (rep !== 0x00) {
          reject(new Error(`SOCKS5 连接失败，错误码 ${rep}`))
          return
        }
        resolve(buf.slice(fullLen).toString('latin1'))
      }
    }
    const cleanup = (): void => { sock.off('data', onData); sock.off('error', onError) }
    sock.on('data', onData)
    sock.on('error', onError)
    sock.write(Buffer.from([0x05, 0x01, 0x00]))
  })
}

/** Open a raw socket to the SMTP host, directly or through a proxy. */
async function openRawSocket(host: string, port: number): Promise<{ socket: Socket; leftover: string }> {
  const proxy = resolveProxy()
  if (proxy === undefined) {
    return { socket: netConnect({ host, port }), leftover: '' }
  }
  const sock = netConnect({ host: proxy.host, port: proxy.port })
  const leftover = proxy.scheme === 'socks5'
    ? await socks5Connect(sock, host, port)
    : await httpConnect(sock, host, port)
  return { socket: sock, leftover }
}

/** Encode text as base64 (Node Buffer, host-only). */
function b64(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64')
}

/** RFC 2047 encode a header value when it is not pure ASCII. */
function encodeHeader(value: string): string {
  // eslint-disable-next-line no-control-regex
  if (/^[\x20-\x7e]*$/.test(value)) return value
  return `=?utf-8?B?${b64(value)}?=`
}

/** Strip CR/LF from an address so a crafted setting cannot inject SMTP headers. */
function sanitizeAddr(value: string): string {
  return value.replace(/[\r\n]/g, '')
}

/** Build the raw message (headers + base64 body) handed to the DATA command. */
export function buildMessage(mail: SmtpMail): string {
  const headers = [
    `From: <${sanitizeAddr(mail.from)}>`,
    `To: <${sanitizeAddr(mail.to)}>`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@dsh-email-summary>`,
    `Subject: ${encodeHeader(mail.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64',
  ].join('\r\n')
  const body = b64(mail.html)
  const wrapped = body.replace(/(.{76})/g, '$1\r\n').replace(/\r\n$/, '')
  // The blank CRLF line separates the header block from the (base64) body.
  return `${headers}\r\n\r\n${wrapped}\r\n`
}

/** Send one email over SMTP. */
export async function sendSmtpMail(mail: SmtpMail): Promise<void> {
  const { socket: raw, leftover } = await openRawSocket(mail.host, mail.port)
  raw.setTimeout(CONNECT_TIMEOUT_MS, () => {
    raw.destroy(new Error(`连接 ${mail.host}:${mail.port} 超时（${CONNECT_TIMEOUT_MS / 1000}s），请检查网络/代理`))
  })

  let session = mail.secure === 'ssl'
    ? new SmtpSession(tlsConnect({ socket: raw, servername: mail.host }))
    : new SmtpSession(raw)

  try {
    // Register the greeting expectation before feeding tunnel leftover bytes:
    // `feed` resolves against the current pending command, so feeding first
    // would drop the greeting when the proxy already buffered it.
    const greeting = session.awaitReply(220)
    if (leftover !== '') session.feed(leftover)
    await greeting
    // Switch from the connect-phase timeout to a per-command inactivity timeout,
    // so a stalled server mid-conversation (AUTH/DATA/QUIT) fails instead of hanging.
    raw.setTimeout(SMTP_IO_TIMEOUT_MS, () => {
      raw.destroy(new Error(`SMTP 会话超时（${SMTP_IO_TIMEOUT_MS / 1000}s 无响应）`))
    })

    await session.command(`EHLO ${mail.host}`, 250)

    if (mail.secure === 'starttls') {
      await session.command('STARTTLS', 220)
      const plain = session.socket
      session.detach()
      const tls = tlsConnect({ socket: plain as Socket, servername: mail.host })
      session = new SmtpSession(tls)
      await session.command(`EHLO ${mail.host}`, 250)
    }

    if (mail.username !== '') {
      await session.command('AUTH PLAIN', 334)
      await session.command(b64(`\u0000${mail.username}\u0000${mail.password}`), 235)
    }

    await session.command(`MAIL FROM:<${mail.from}>`, 250)
    await session.command(`RCPT TO:<${mail.to}>`, 250)
    await session.command('DATA', 354)
    await session.command(`${buildMessage(mail)}.`, 250)
    await session.command('QUIT', 221)
  } finally {
    session.end()
  }
}
