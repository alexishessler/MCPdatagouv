'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

type ToolResult = {
  name: string;
  displayName: string;
  data: unknown;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolResults?: ToolResult[];
};

type RateLimitInfo = {
  sessionRemaining: number;
  dailyRemaining: number;
};

const SUGGESTIONS = [
  { icon: '🚆', text: 'Quels jeux de données existent sur les transports en commun ?' },
  { icon: '🌿', text: "Trouve-moi des données sur la qualité de l'air en France" },
  { icon: '🏛️', text: 'Données ouvertes sur les élections présidentielles' },
  { icon: '📊', text: 'Quelles APIs publiques sont disponibles sur data.gouv.fr ?' },
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    sessionRemaining: 5,
    dailyRemaining: 50,
  });
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined'
      ? crypto.randomUUID()
      : Math.random().toString(36)
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading, animatingId]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isLoading || !content.trim()) return;

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content: content.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setRateLimitError(null);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            sessionId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            setRateLimitError(data.error);
            if (data.rateLimitInfo) setRateLimitInfo(data.rateLimitInfo);
            return;
          }
          throw new Error(data.error || 'Erreur serveur');
        }

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.message,
          toolResults: data.toolResults,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setAnimatingId(assistantMessage.id);
        if (data.rateLimitInfo) setRateLimitInfo(data.rateLimitInfo);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : 'Une erreur est survenue';
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Une erreur est survenue : ${errMsg}`,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, sessionId]
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          /* ─── Welcome screen ─── */
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up px-4">
            <div className="mb-8">
              {/* Decorative tricolor dots */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-[var(--french-blue)]" />
                <div className="w-2 h-2 rounded-full bg-[var(--border)]" />
                <div className="w-2 h-2 rounded-full bg-[var(--french-red)]" />
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text)] mb-3">
                Explorez les données
                <br />
                <span className="gradient-text">ouvertes françaises</span>
              </h2>
              <p className="text-[var(--text-secondary)] max-w-md text-sm leading-relaxed mx-auto">
                Interrogez{' '}
                <span className="font-medium text-[var(--text)]">data.gouv.fr</span>{' '}
                en langage naturel. Recherche de datasets, exploration de
                ressources, analyse de données tabulaires.
              </p>
            </div>

            {/* Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="suggestion-card p-3.5 text-left"
                >
                  <span className="text-base mb-1.5 block">{s.icon}</span>
                  <span className="text-[13px] text-[var(--text-secondary)] leading-snug">
                    {s.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* ─── Messages list ─── */
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                shouldAnimate={msg.id === animatingId}
                onAnimationDone={() => setAnimatingId(null)}
              />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 animate-fade-in-up">
                <div className="w-7 h-7 rounded-full bg-[var(--bg-warm)] ring-1 ring-[var(--border)] flex items-center justify-center text-xs">
                  🇫🇷
                </div>
                <div className="msg-bot px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-[var(--french-blue)] rounded-full typing-dot" />
                      <div className="w-1.5 h-1.5 bg-[var(--text-tertiary)] rounded-full typing-dot" />
                      <div className="w-1.5 h-1.5 bg-[var(--french-red)] rounded-full typing-dot" />
                    </div>
                    <span className="text-[11px] text-[var(--text-tertiary)]">
                      Recherche en cours...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rate limit banner */}
      {rateLimitError && (
        <div className="mx-4 mb-2 rate-limit-banner p-4 animate-fade-in-up">
          <p className="text-[var(--french-red)] font-medium text-sm mb-1">
            {rateLimitError}
          </p>
          <p className="text-[var(--text-secondary)] text-xs">
            Clonez le projet sur{' '}
            <a
              href="https://github.com/alexishessler/MCPdatagouv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--french-blue)] hover:underline font-medium"
            >
              GitHub
            </a>{' '}
            et utilisez votre propre clé API Mistral.
          </p>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isLoading || !!rateLimitError}
        rateLimitInfo={rateLimitInfo}
      />
    </div>
  );
}
