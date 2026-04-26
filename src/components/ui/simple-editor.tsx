'use client'

import React from 'react'
import { Textarea } from './textarea'
import { Label } from './label'
import { Button } from './button'
import { Bold, Italic, List, Link2, Image, Code, Eye, EyeOff } from 'lucide-react'
import { markdownToHtml } from '@/lib/markdown'

interface SimpleEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

type SplitMode = 'period' | 'comma' | 'question' | 'all'

export function SimpleEditor({ value, onChange, placeholder, className }: SimpleEditorProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(true)
  const [splitMode, setSplitMode] = React.useState<SplitMode>('period')

  // 붙여넣기 시 자동 문단 구분
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault()

    const pastedText = e.clipboardData.getData('text')
    if (!pastedText) return

    // 문단 자동 구분 함수
    const formatParagraphs = (text: string): string => {
      // 기존 줄바꿈을 공백으로 변환 (단, 빈 줄은 유지)
      const normalizedText = text.replace(/\n{3,}/g, '\n\n').replace(/(?<!\n)\n(?!\n)/g, ' ')

      // 선택한 모드에 따라 분리 패턴 결정
      let splitPattern: RegExp
      switch (splitMode) {
        case 'period':
          splitPattern = /(\.)\s+/
          break
        case 'comma':
          splitPattern = /(,)\s+/
          break
        case 'question':
          splitPattern = /([?!])\s+/
          break
        case 'all':
          splitPattern = /([.!?,])\s+/
          break
      }

      // 문장 단위로 분리
      const sentences = normalizedText
        .split(splitPattern)
        .reduce((acc: string[], curr, idx, arr) => {
          if (idx % 2 === 0 && curr.trim()) {
            const sentence = curr + (arr[idx + 1] || '')
            acc.push(sentence.trim())
          }
          return acc
        }, [])

      if (sentences.length === 0) return text

      // 2개씩 묶어서 문단으로 만들기
      const paragraphs: string[] = []
      for (let i = 0; i < sentences.length; i += 2) {
        const paragraph = sentences.slice(i, i + 2).join(' ')
        paragraphs.push(paragraph)
      }

      // 문단 사이에 빈 줄 추가
      return paragraphs.join('\n\n')
    }

    const formattedText = formatParagraphs(pastedText)

    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    const newText =
      value.substring(0, start) +
      formattedText +
      value.substring(end)

    onChange(newText)

    // 커서 위치 조정
    setTimeout(() => {
      textarea.focus()
      const newPos = start + formattedText.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

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

  const handleImage = async () => {
    // 파일 선택 다이얼로그 열기
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsUploading(true)

      try {
        // 이미지 업로드
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload/content', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('이미지 업로드 실패')
        }

        const data = await response.json()
        const imageUrl = data.url || data.imageUrl

        // 마크다운 이미지 문법으로 삽입
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const altText = selectedText || file.name.split('.')[0]

        const imageMarkdown = `![${altText}](${imageUrl})`
        const newText =
          value.substring(0, start) +
          imageMarkdown +
          value.substring(end)

        onChange(newText)

        // 커서 위치 조정
        setTimeout(() => {
          textarea.focus()
          const newPos = start + imageMarkdown.length
          textarea.setSelectionRange(newPos, newPos)
        }, 0)

      } catch (error) {
        console.error('이미지 업로드 에러:', error)
        alert('이미지 업로드에 실패했습니다.')
      } finally {
        setIsUploading(false)
      }
    }

    input.click()
  }

  return (
    <div className={`simple-editor-container border rounded-lg ${className || ''}`}>
      {/* 툴바 */}
      <div className="editor-toolbar flex items-center justify-between gap-2 p-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
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
            title="이미지 업로드 (Image)"
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="h-4 w-4 animate-spin">⏳</span>
            ) : (
              <Image className="h-4 w-4" />
            )}
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

        {/* 문단 구분 모드 선택 */}
        <div className="flex items-center gap-1 px-2 border-l">
          <span className="text-xs text-gray-600 mr-1">붙여넣기:</span>
          <Button
            type="button"
            variant={splitMode === 'period' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSplitMode('period')}
            title="마침표(.)로 문단 구분"
            className="h-7 px-2"
          >
            <span className="text-xs">.</span>
          </Button>
          <Button
            type="button"
            variant={splitMode === 'comma' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSplitMode('comma')}
            title="쉼표(,)로 문단 구분"
            className="h-7 px-2"
          >
            <span className="text-xs">,</span>
          </Button>
          <Button
            type="button"
            variant={splitMode === 'question' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSplitMode('question')}
            title="물음표/느낌표(?!)로 문단 구분"
            className="h-7 px-2"
          >
            <span className="text-xs">?</span>
          </Button>
          <Button
            type="button"
            variant={splitMode === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSplitMode('all')}
            title="모든 기호로 문단 구분"
            className="h-7 px-2"
          >
            <span className="text-xs">전체</span>
          </Button>
        </div>

        {/* 미리보기 토글 버튼 */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          title={showPreview ? "미리보기 숨기기" : "미리보기 보기"}
        >
          {showPreview ? (
            <>
              <EyeOff className="h-4 w-4 mr-1" />
              <span className="text-xs">미리보기 숨기기</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-1" />
              <span className="text-xs">미리보기 보기</span>
            </>
          )}
        </Button>
      </div>

      {/* 에디터 및 미리보기 영역 */}
      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-0 items-stretch`}>
        {/* 에디터 */}
        <div className="relative flex flex-col">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={placeholder || '내용을 입력하세요... (마크다운 문법을 지원합니다)'}
            className="min-h-[400px] h-full flex-1 border-0 rounded-none focus:ring-0 resize-none"
          />
        </div>

        {/* 미리보기 */}
        {showPreview && (
          <div className="border-l flex flex-col">
            <div className="p-4 bg-gray-50 border-b text-xs font-medium text-gray-600">
              미리보기
            </div>
            <div
              className="prose prose-sm max-w-none p-4 flex-1 overflow-auto"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(value || '내용을 입력하면 여기에 미리보기가 표시됩니다.') }}
            />
          </div>
        )}
      </div>

      {/* 도움말 */}
      <div className="editor-help p-2 border-t bg-gray-50 text-xs text-gray-600">
        <p>팁: **굵게**, *기울임*, [링크](url), ![이미지](url), - 목록 | 붙여넣기 시 선택한 기호로 자동 문단 구분</p>
      </div>
    </div>
  )
}

// RichEditor와 동일한 인터페이스를 제공하기 위한 export
export function RichEditor(props: SimpleEditorProps) {
  return <SimpleEditor {...props} />
}