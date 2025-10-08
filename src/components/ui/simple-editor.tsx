'use client'

import React from 'react'
import { Textarea } from './textarea'
import { Label } from './label'
import { Button } from './button'
import { Bold, Italic, List, Link2, Image, Code } from 'lucide-react'

interface SimpleEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SimpleEditor({ value, onChange, placeholder, className }: SimpleEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newText = 
      value.substring(0, start) + 
      prefix + selectedText + suffix +
      value.substring(end)
    
    onChange(newText)
    
    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus()
      const newPos = start + prefix.length + selectedText.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handleBold = () => insertMarkdown('**', '**')
  const handleItalic = () => insertMarkdown('*', '*')
  const handleList = () => insertMarkdown('\n- ')
  const handleLink = () => insertMarkdown('[', '](url)')
  const handleCode = () => insertMarkdown('```\n', '\n```')
  const handleImage = () => insertMarkdown('![', '](image-url)')

  return (
    <div className={`simple-editor-container border rounded-lg ${className || ''}`}>
      {/* 툴바 */}
      <div className="editor-toolbar flex items-center gap-2 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          title="굵게 (Bold)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          title="기울임 (Italic)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleList}
          title="목록 (List)"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleLink}
          title="링크 (Link)"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleImage}
          title="이미지 (Image)"
        >
          <Image className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCode}
          title="코드 블록 (Code)"
        >
          <Code className="h-4 w-4" />
        </Button>
      </div>

      {/* 에디터 영역 */}
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || '내용을 입력하세요... (마크다운 문법을 지원합니다)'}
        className="min-h-[400px] border-0 rounded-none focus:ring-0 resize-none"
      />

      {/* 도움말 */}
      <div className="editor-help p-2 border-t bg-gray-50 text-xs text-gray-600">
        <p>팁: **굵게**, *기울임*, [링크](url), ![이미지](url), - 목록</p>
      </div>
    </div>
  )
}

// RichEditor와 동일한 인터페이스를 제공하기 위한 export
export function RichEditor(props: SimpleEditorProps) {
  return <SimpleEditor {...props} />
}