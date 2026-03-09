'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useState } from 'react';

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
};

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start gap-3 animate-fade-in-up ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm ${
          isUser
            ? 'bg-french-blue/20 ring-1 ring-french-blue/20'
            : 'bg-gradient-to-br from-french-blue/20 to-french-red/10 ring-1 ring-white/5'
        }`}
      >
        {isUser ? '👤' : '🤖'}
      </div>

      {/* Message content */}
      <div className={`max-w-[82%] min-w-0 ${isUser ? 'items-end' : ''}`}>
        {/* Tool results (collapsible) */}
        {message.toolResults && message.toolResults.length > 0 && (
          <div className="mb-2 space-y-1.5">
            {message.toolResults.map((tool, i) => (
              <ToolResultCard key={i} tool={tool} />
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? 'msg-user rounded-tr-md'
              : 'msg-bot rounded-tl-md'
          }`}
        >
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
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
        <span className="text-xs">{tool.displayName}</span>
        <svg
          className={`w-3 h-3 text-gray-500 ml-auto transition-transform duration-200 ${
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
        <div className="px-3 pb-2">
          <pre className="text-[11px] text-gray-400 bg-black/30 rounded-lg p-2.5 overflow-x-auto max-h-48 leading-relaxed">
            {JSON.stringify(tool.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
