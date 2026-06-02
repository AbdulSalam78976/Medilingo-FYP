import ReactMarkdown from 'react-markdown';

interface DocMarkdownProps {
  children: string;
  dir?: 'ltr' | 'rtl';
}

export function DocMarkdown({ children, dir = 'ltr' }: DocMarkdownProps) {
  return (
    <div
      dir={dir}
      className={`text-[14px] leading-relaxed text-ink-2 ${dir === 'rtl' ? 'ur text-[16px] leading-[1.85]' : ''}`}
    >
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          em: ({ children }) => <em className="italic text-ink-3">{children}</em>,
          ul: ({ children }) => <ul className="mt-1 mb-3 pl-5 list-none space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="mt-1 mb-3 pl-5 list-decimal marker:text-ink-4 space-y-2">{children}</ol>,
          li: ({ children }) => (
            <li className="flex items-start gap-2.5 leading-relaxed [&>ul]:mt-1 [&>ol]:mt-1 list-none">
              <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mt-[2px]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7" /></svg>
              </span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          h1: ({ children }) => <h1 className="font-display text-[20px] font-semibold text-ink mt-6 mb-2.5 first:mt-0 tracking-tight">{children}</h1>,
          h2: ({ children }) => <h2 className="font-display text-[18px] font-semibold text-ink mt-5 mb-2 first:mt-0 tracking-tight">{children}</h2>,
          h3: ({ children }) => <h3 className="font-display text-[15px] font-medium text-ink-2 mt-4 mb-1.5 first:mt-0">{children}</h3>,
          code: ({ children }) => <code className="px-1.5 py-0.5 rounded-xs bg-paper-2 text-blue text-[12px] font-mono border border-line">{children}</code>,
          hr: () => <hr className="my-4 border-line" />,
          blockquote: ({ children }) => <blockquote className="my-3 pl-4 border-l-2 border-blue text-ink-3 italic">{children}</blockquote>,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
