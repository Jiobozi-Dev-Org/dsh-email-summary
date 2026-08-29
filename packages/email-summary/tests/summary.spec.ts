import { describe, expect, it } from 'vitest'
import type { SessionEvent } from '@deepseek-ai/dsh-session/types'
import {
  buildTranscript,
  capTranscript,
  defaultSystemPrompt,
  markdownToHtml,
  buildEmailHtml,
} from '../src/summary.ts'

const userEvent = {
  type: 'user/message',
  seq: 1,
  time: 0,
  data: {
    role: 'user',
    content: [{ type: 'text', text: '帮我写一个函数' }],
    source: { kind: 'user' },
  },
} as unknown as SessionEvent

const assistantEvent = {
  type: 'assistant/message',
  seq: 2,
  time: 0,
  data: {
    turn: 1,
    step: 1,
    message: {
      role: 'assistant',
      content: [{ type: 'text', text: '好的，这是函数实现' }],
      source: { kind: 'model' },
    },
  },
} as unknown as SessionEvent

describe('buildTranscript', () => {
  it('folds user/assistant text into a readable transcript', () => {
    const transcript = buildTranscript([userEvent, assistantEvent])
    expect(transcript.text).toBe('User: 帮我写一个函数\n\nAssistant: 好的，这是函数实现')
  })

  it('skips non-human injected context', () => {
    const injected = {
      type: 'user/message',
      seq: 3,
      time: 0,
      data: {
        role: 'user',
        content: [{ type: 'text', text: '<skill>文件说明</skill>' }],
        source: { kind: 'plugin', plugin: 'dsh-skill' },
      },
    } as unknown as SessionEvent
    expect(buildTranscript([injected]).text).toBe('')
  })

  it('scopes to a time range when given', () => {
    const early = { ...userEvent, time: 1000 } as SessionEvent
    const late = {
      ...userEvent,
      seq: 3,
      time: 3000,
      data: { ...userEvent.data, content: [{ type: 'text', text: '窗口内的新消息' }] },
    } as SessionEvent
    expect(buildTranscript([early, late], { start: 2000, end: 4000 }).text).toBe('User: 窗口内的新消息')
  })
})

describe('capTranscript', () => {
  it('keeps short text intact', () => {
    expect(capTranscript('short', 100)).toBe('short')
  })

  it('truncates long text keeping head and tail', () => {
    const capped = capTranscript('a'.repeat(5000), 2000)
    expect(capped.length).toBeLessThan(5000)
    expect(capped).toContain('…[中间内容已省略]…')
  })
})

describe('defaultSystemPrompt', () => {
  it('returns a non-empty prompt that asks for a title and Markdown body', () => {
    const prompt = defaultSystemPrompt('detailed')
    expect(prompt).toContain('总结')
    expect(prompt).toContain('Markdown')
    expect(defaultSystemPrompt('brief')).not.toBe(defaultSystemPrompt('detailed'))
  })
})

describe('markdownToHtml', () => {
  it('converts headings, bold, and lists to inline-styled HTML', () => {
    const html = markdownToHtml('## 主题\n- **重点** 内容')
    expect(html).toContain('<h3')
    expect(html).toContain('<ul')
    expect(html).toContain('<strong>重点</strong>')
  })
})

describe('buildEmailHtml', () => {
  it('wraps title, date label, and body in a full HTML document', () => {
    const html = buildEmailHtml('标题', '26年8月26日', '<p>body</p>')
    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('标题')
    expect(html).toContain('26年8月26日')
    expect(html).toContain('<p>body</p>')
  })
})
