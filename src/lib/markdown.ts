import DOMPurify from 'dompurify'
import { marked } from 'marked'

export function safeMarkdown(source: string): string {
  return DOMPurify.sanitize(marked.parse(source, { async: false, breaks: true }), {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'del', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
    ALLOWED_ATTR: ['href', 'title'],
  })
}
