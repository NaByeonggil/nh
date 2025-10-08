'use client'

// React 18과 호환성 문제로 임시로 SimpleEditor로 대체
export { RichEditor } from './simple-editor'
export default null

/*
// 아래는 React-Quill 호환성 문제 해결 후 사용할 코드

import React, { useRef, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'

// React Quill을 동적 임포트하고 SSR 비활성화
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill')
    await import('react-quill/dist/quill.snow.css')
    return RQ
  },
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
        <p className="text-gray-500">에디터를 불러오는 중...</p>
      </div>
    )
  }
)

interface RichEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function RichEditor({ value, onChange, placeholder, className }: RichEditorProps) {
  const quillRef = useRef<any>(null)

  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback(async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload/content', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('이미지 업로드 실패')
      }

      const data = await response.json()
      return data.url || data.imageUrl
    } catch (error) {
      console.error('이미지 업로드 에러:', error)
      alert('이미지 업로드에 실패했습니다.')
      return null
    }
  }, [])

  // 이미지 선택 핸들러
  const selectLocalImage = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')

    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        const url = await handleImageUpload(file)
        if (url && quillRef.current) {
          const quill = quillRef.current.getEditor()
          const range = quill.getSelection(true)
          quill.insertEmbed(range.index, 'image', url)
          quill.setSelection(range.index + 1)
        }
      }
    }

    input.click()
  }, [handleImageUpload])

  // Quill 모듈 설정
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ color: [] }, { background: [] }],
          [{ script: 'sub' }, { script: 'super' }],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ direction: 'rtl' }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: {
          image: selectLocalImage,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [selectLocalImage]
  )

  // Quill 포맷 설정
  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'color',
    'background',
    'script',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'indent',
    'direction',
    'align',
    'link',
    'image',
    'video',
  ]

  return (
    <div className={`rich-editor-container ${className || ''}`}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || '내용을 입력하세요...'}
      />
      <style jsx global>{`
        .rich-editor-container {
          margin-bottom: 1rem;
        }
        
        .rich-editor-container .ql-container {
          min-height: 400px;
          font-size: 16px;
        }
        
        .rich-editor-container .ql-editor {
          min-height: 400px;
        }
        
        .rich-editor-container .ql-toolbar.ql-snow {
          border: 1px solid #ccc;
          border-radius: 4px 4px 0 0;
        }
        
        .rich-editor-container .ql-container.ql-snow {
          border: 1px solid #ccc;
          border-top: none;
          border-radius: 0 0 4px 4px;
        }
        
        .rich-editor-container .ql-editor img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1rem auto;
        }
        
        .rich-editor-container .ql-editor h1 {
          font-size: 2em;
          margin: 0.67em 0;
        }
        
        .rich-editor-container .ql-editor h2 {
          font-size: 1.5em;
          margin: 0.75em 0;
        }
        
        .rich-editor-container .ql-editor h3 {
          font-size: 1.17em;
          margin: 0.83em 0;
        }
        
        .rich-editor-container .ql-editor p {
          margin: 1em 0;
          line-height: 1.6;
        }
        
        .rich-editor-container .ql-editor blockquote {
          border-left: 4px solid #ccc;
          margin: 1.5em 10px;
          padding: 0.5em 10px;
          background-color: #f9f9f9;
        }
        
        .rich-editor-container .ql-editor pre {
          background-color: #f4f4f4;
          border: 1px solid #ddd;
          border-radius: 3px;
          padding: 10px;
          overflow: auto;
        }
        
        .rich-editor-container .ql-editor ul,
        .rich-editor-container .ql-editor ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        
        .rich-editor-container .ql-editor li {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  )
}
*/