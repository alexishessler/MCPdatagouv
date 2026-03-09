'use client';

import { useState, useRef, type KeyboardEvent } from 'react';

type Props = {
  onSend: (message: string) => void;
  disabled: boolean;
  rateLimitInfo: {
    sessionRemaining: number;
    dailyRemaining: number;
  };
};

export default function ChatInput({ onSend, disabled, rateLimitInfo }: Props) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 140) + 'px';
    }
  };

  return (
    <div className="flex-shrink-0 border-t border-white/[0.04] glass-strong px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2.5">
          {/* Input field with gradient border */}
          <div className="flex-1 gradient-border rounded-xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question sur les données ouvertes françaises..."
              disabled={disabled}
              rows={1}
              className="w-full bg-bg-secondary/90 rounded-xl px-4 py-3 text-[0.9rem] text-white placeholder-gray-600 resize-none focus:outline-none disabled:opacity-40 transition-opacity"
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="flex-shrink-0 w-11 h-11 rounded-xl btn-send flex items-center justify-center"
            aria-label="Envoyer"
          >
            <svg
              className="w-[18px] h-[18px] text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>

        {/* Footer info */}
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-[10px] text-gray-600 tracking-wide">
            Propulsé par <span className="text-gray-500">Mistral AI</span> &{' '}
            <span className="text-gray-500">data.gouv.fr</span>
          </span>
          <span className="text-[10px] text-gray-600 tabular-nums">
            {rateLimitInfo.sessionRemaining}/5 session ·{' '}
            {rateLimitInfo.dailyRemaining}/50 jour
          </span>
        </div>
      </div>
    </div>
  );
}
