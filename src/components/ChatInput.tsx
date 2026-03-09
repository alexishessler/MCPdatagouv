'use client';

import { useState, useRef, type KeyboardEvent } from 'react';
import LegalModal from './LegalModal';
import HowItWorksModal from './HowItWorksModal';

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
    <div className="flex-shrink-0 bg-white border-t border-[var(--border)] px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2.5">
          {/* Input with gradient focus border */}
          <div className="flex-1 gradient-border-light rounded-xl">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question sur les données ouvertes..."
              disabled={disabled}
              rows={1}
              className="w-full bg-[var(--bg)] rounded-xl px-4 py-2.5 text-[0.9rem] text-[var(--text)] placeholder-[var(--text-tertiary)] resize-none focus:outline-none disabled:opacity-40 transition-opacity border border-[var(--border)]"
              style={{ borderColor: 'transparent' }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSubmit}
            disabled={disabled || !input.trim()}
            className="flex-shrink-0 w-10 h-10 btn-send flex items-center justify-center"
            aria-label="Envoyer"
          >
            <svg
              className="w-4 h-4 text-white"
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

        {/* Footer */}
        <div className="flex justify-between items-center mt-1.5 px-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-tertiary)] tracking-wide">
              Propulsé par{' '}
              <span className="font-medium text-[var(--text-secondary)]">Mistral AI</span>
              {' '}&{' '}
              <span className="font-medium text-[var(--text-secondary)]">data.gouv.fr</span>
            </span>
            <span className="text-[var(--border)]">·</span>
            <HowItWorksModal />
            <span className="text-[var(--border)]">·</span>
            <LegalModal />
          </div>
          <div className="relative group/tip p-2 -m-2">
            <span className="text-[10px] text-[var(--text-tertiary)] tabular-nums cursor-default">
              {rateLimitInfo.sessionRemaining}/10
            </span>
            {/* Popover — pb-3 creates invisible bridge to trigger */}
            <div className="absolute bottom-full right-0 pb-3 opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all duration-200 z-50">
              <div className="w-64 p-3 bg-white rounded-xl border border-[var(--border)] shadow-lg">
                <p className="text-xs text-[var(--text)] font-medium mb-1">
                  Il vous reste {rateLimitInfo.sessionRemaining} prompt{rateLimitInfo.sessionRemaining !== 1 ? 's' : ''} pour cette session !
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  Sinon, téléchargez le projet sur{' '}
                  <a
                    href="https://github.com/alexishessler/MCPdatagouv"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--french-blue)] hover:underline font-medium"
                  >
                    GitHub
                  </a>{' '}
                  et procurez-vous une clef API de n&apos;importe quel LLM ;)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
