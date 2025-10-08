import React from 'react'

interface ContentViewerProps {
  content: string
  className?: string
}

export function ContentViewer({ content, className = '' }: ContentViewerProps) {
  return (
    <div className={`content-viewer ${className}`}>
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <style jsx global>{`
        .content-viewer img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 2rem auto;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .content-viewer h1 {
          font-size: 2.5em;
          margin-top: 0;
          margin-bottom: 0.8em;
          line-height: 1.2;
        }
        
        .content-viewer h2 {
          font-size: 2em;
          margin-top: 1.5em;
          margin-bottom: 0.75em;
          line-height: 1.3;
        }
        
        .content-viewer h3 {
          font-size: 1.5em;
          margin-top: 1.2em;
          margin-bottom: 0.6em;
          line-height: 1.4;
        }
        
        .content-viewer h4 {
          font-size: 1.25em;
          margin-top: 1em;
          margin-bottom: 0.5em;
          line-height: 1.5;
        }
        
        .content-viewer p {
          margin-bottom: 1.5em;
          line-height: 1.8;
        }
        
        .content-viewer ul,
        .content-viewer ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .content-viewer li {
          margin: 0.5em 0;
          line-height: 1.7;
        }
        
        .content-viewer blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1.5em;
          margin: 1.5em 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .content-viewer pre {
          background-color: #f3f4f6;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        
        .content-viewer code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
        
        .content-viewer table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
        }
        
        .content-viewer th,
        .content-viewer td {
          border: 1px solid #e5e7eb;
          padding: 0.75em;
          text-align: left;
        }
        
        .content-viewer th {
          background-color: #f9fafb;
          font-weight: bold;
        }
        
        .content-viewer a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .content-viewer a:hover {
          color: #2563eb;
        }
        
        .content-viewer iframe {
          max-width: 100%;
          margin: 2rem auto;
          display: block;
        }
        
        @media (max-width: 768px) {
          .content-viewer h1 {
            font-size: 2em;
          }
          
          .content-viewer h2 {
            font-size: 1.5em;
          }
          
          .content-viewer h3 {
            font-size: 1.25em;
          }
          
          .content-viewer img {
            margin: 1rem auto;
          }
        }
      `}</style>
    </div>
  )
}