// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { safeMarkdown } from '../src/lib/markdown'

describe('Apuntes seguros', () => {
  it('renderiza Markdown y HTML permitido', () => {
    const result = safeMarkdown('## Biología\n\n**Repaso**\n\n<ul><li>La célula</li></ul>')
    expect(result).toContain('<h2>Biología</h2>')
    expect(result).toContain('<strong>Repaso</strong>')
    expect(result).toContain('<li>La célula</li>')
  })
  it('elimina scripts, eventos, iframes, estilos y enlaces ejecutables', () => {
    const result = safeMarkdown('<script>alert(1)</script><iframe src="https://evil.example"></iframe><p onclick="alert(1)" style="position:fixed">Hola</p><a href="javascript:alert(1)">clic</a><img src=x onerror=alert(1)>')
    expect(result).not.toMatch(/<script|<iframe|onclick|style=|javascript:|<img|onerror/)
    expect(result).toContain('Hola')
  })
})
