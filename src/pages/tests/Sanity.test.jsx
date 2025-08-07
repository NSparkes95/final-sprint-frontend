import { describe, it, expect } from 'vitest'

describe('Sanity Test', () => {
  it('can access document', () => {
    const div = document.createElement('div')
    div.textContent = 'hello'
    expect(div.textContent).toBe('hello')
  })
})
