'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState, useEffect, useMemo } from 'react';

type ToolResult = {
  name: string;
  displayName: string;
  data: unknown;
};

type Props = {
  message: {
    role: 'user' | 'assistant';
    content: string;
    toolResults?: ToolResult[];
  };
  shouldAnimate?: boolean;
  onAnimationDone?: () => void;
};

export default function ChatMessage({
  message,
  shouldAnimate = false,
  onAnimationDone,
}: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start gap-3 animate-fade-in-up ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
          isUser
            ? 'bg-[var(--bg-user)] ring-1 ring-[var(--french-blue)]/10'
            : 'bg-[var(--bg-warm)] ring-1 ring-[var(--border)]'
        }`}
      >
        {isUser ? '👤' : '🇫🇷'}
      </div>

      {/* Content */}
      <div className={`max-w-[82%] min-w-0 ${isUser ? 'items-end' : ''}`}>
        {/* Tool results */}
        {message.toolResults && message.toolResults.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {message.toolResults.map((tool, i) => (
              <ToolResultCard key={i} tool={tool} />
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div className={`px-4 py-2.5 ${isUser ? 'msg-user' : 'msg-bot'}`}>
          {shouldAnimate ? (
            <StreamingText
              text={message.content}
              onDone={onAnimationDone}
            />
          ) : (
            <div className="prose-chat">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Progressive streaming: renders Markdown incrementally as words appear.
 */
function StreamingText({
  text,
  onDone,
}: {
  text: string;
  onDone?: () => void;
}) {
  const tokens = useMemo(() => text.match(/\S+|\s+/g) || [], [text]);
  const [tokenCount, setTokenCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    setTokenCount(0);
    setDone(false);

    const interval = setInterval(() => {
      idx++;
      if (idx >= tokens.length) {
        clearInterval(interval);
        setTokenCount(tokens.length);
        setDone(true);
        onDone?.();
      } else {
        setTokenCount(idx);
      }
    }, 20);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const visibleText = done ? text : tokens.slice(0, tokenCount).join('');

  return (
    <div className="prose-chat">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {done ? text : visibleText + '▎'}
      </ReactMarkdown>
    </div>
  );
}

function ToolResultCard({ tool }: { tool: ToolResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="tool-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left"
      >
        <span className="text-xs text-[var(--french-blue)] font-medium">
          {tool.displayName}
        </span>
        <svg
          className={`w-3 h-3 text-[var(--text-tertiary)] ml-auto transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="px-3 pb-2.5">
          <pre className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-code)] rounded-lg p-2.5 overflow-x-auto max-h-48 leading-relaxed">
            {JSON.stringify(tool.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
