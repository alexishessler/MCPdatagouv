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
  { icon: '📊', text: 'Quelles sont les APIs publiques disponibles sur data.gouv.fr ?' },
];

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    sessionRemaining: 5,
    dailyRemaining: 50,
  });
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [sessionId] = useState(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36)
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

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
        if (data.rateLimitInfo) setRateLimitInfo(data.rateLimitInfo);
      } catch (error: unknown) {
        const errMsg =
          error instanceof Error ? error.message : 'Une erreur est survenue';
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `Une erreur est survenue : ${errMsg}. Réessayez dans un instant.`,
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
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in-up">
            <div className="mb-6">
              <div className="text-5xl mb-4">🇫🇷</div>
              <h2 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                Bienvenue
              </h2>
              <p className="text-gray-500 max-w-md text-sm leading-relaxed">
                Interrogez les données ouvertes françaises en langage naturel.
                <br />
                Je recherche, analyse et présente les jeux de données de{' '}
                <span className="text-gray-400">data.gouv.fr</span> pour vous.
              </p>
            </div>

            {/* Suggestions grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-lg w-full">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s.text)}
                  className="suggestion-card p-3.5 text-left"
                >
                  <span className="text-lg mb-1 block">{s.icon}</span>
                  <span className="text-[13px] text-gray-400 leading-snug">
                    {s.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages list */
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-start gap-3 animate-fade-in-up">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-french-blue/20 to-french-red/10 ring-1 ring-white/5 flex items-center justify-center text-sm">
                  🤖
                </div>
                <div className="msg-bot rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-french-blue rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-french-red rounded-full typing-dot" />
                    </div>
                    <span className="text-[11px] text-gray-600 ml-1">
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
        <div className="mx-4 mb-2 rate-limit-banner rounded-xl p-4 animate-fade-in-up">
          <p className="text-french-red/90 font-medium text-sm mb-1">
            {rateLimitError}
          </p>
          <p className="text-gray-500 text-xs">
            Téléchargez le projet sur{' '}
            <a
              href="https://github.com/alexishessler/MCPdatagouv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-french-blue hover:underline"
            >
              GitHub
            </a>{' '}
            et utilisez votre propre clé API Mistral pour un usage illimité !
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
