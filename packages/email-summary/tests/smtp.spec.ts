import { describe, expect, it } from 'vitest'
import { buildMessage, type SmtpMail } from '../src/smtp.ts'

function mail(overrides: Partial<SmtpMail> = {}): SmtpMail {
  return {
    host: 'smtp.example.com',
    port: 587,
    secure: 'starttls',
    username: '',
    password: '',
    from: 'a@example.com',
    to: 'b@example.com',
    subject: 'subject',
    html: '<p>hi</p>',
    ...overrides,
  }
}

describe('buildMessage', () => {
  it('separates headers from the base64 body with a blank CRLF line', () => {
    const msg = buildMessage(mail())
    // Header block must be followed by an empty line before the base64 body.
    expect(msg).toContain('Content-Transfer-Encoding: base64\r\n\r\n')
    // The body is the base64 of <p>hi</p>, terminated by CRLF.
    expect(msg).toContain('PHA+aGk8L3A+\r\n')
  })

  it('RFC 2047-encodes a non-ASCII subject', () => {
    const msg = buildMessage(mail({ subject: '你好' }))
    expect(msg).toContain('Subject: =?utf-8?B?')
    expect(msg).not.toContain('Subject: 你好')
  })

  it('keeps a pure-ASCII subject untouched', () => {
    const msg = buildMessage(mail({ subject: 'daily report' }))
    expect(msg).toContain('Subject: daily report')
  })
})
