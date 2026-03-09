'use client';

import { useState } from 'react';

const STEPS = [
  {
    icon: '👤',
    label: 'Vous',
    color: 'var(--french-blue)',
    bg: 'rgba(0, 35, 149, 0.06)',
    border: 'rgba(0, 35, 149, 0.15)',
    tooltip: 'Vous posez une question en langage naturel, comme à un humain.',
  },
  {
    icon: '🧠',
    label: 'Mistral AI',
    color: '#6B21A8',
    bg: 'rgba(107, 33, 168, 0.06)',
    border: 'rgba(107, 33, 168, 0.15)',
    tooltip:
      'Le LLM analyse votre question, choisit les outils MCP à appeler et synthétise les résultats.',
  },
  {
    icon: '🔌',
    label: 'Protocole MCP',
    color: '#0F766E',
    bg: 'rgba(15, 118, 110, 0.06)',
    border: 'rgba(15, 118, 110, 0.15)',
    tooltip:
      'Model Context Protocol — le standard ouvert qui connecte les IA aux sources de données externes.',
  },
  {
    icon: '🇫🇷',
    label: 'data.gouv.fr',
    color: 'var(--french-red)',
    bg: 'rgba(237, 41, 57, 0.05)',
    border: 'rgba(237, 41, 57, 0.15)',
    tooltip:
      'La plateforme officielle des données ouvertes françaises — plus de 45 000 jeux de données.',
  },
];

function StepNode({
  step,
}: {
  step: (typeof STEPS)[number];
}) {
  return (
    <div className="relative group/node flex flex-col items-center">
      {/* Node */}
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl transition-transform duration-200 group-hover/node:scale-110 cursor-default"
        style={{
          background: step.bg,
          border: `1.5px solid ${step.border}`,
          boxShadow: `0 4px 12px ${step.border}`,
        }}
      >
        {step.icon}
      </div>

      {/* Label */}
      <span
        className="mt-2.5 text-[11px] sm:text-xs font-semibold tracking-wide"
        style={{ color: step.color }}
      >
        {step.label}
      </span>

      {/* Tooltip popover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 pb-2 opacity-0 invisible group-hover/node:opacity-100 group-hover/node:visible transition-all duration-200 z-50 pointer-events-none">
        <div
          className="w-52 p-2.5 bg-white rounded-xl border shadow-lg text-[11px] text-[var(--text-secondary)] leading-relaxed text-center"
          style={{ borderColor: step.border }}
        >
          {step.tooltip}
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center px-1 sm:px-2 -mt-4">
      <svg
        className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--text-tertiary)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
        />
      </svg>
    </div>
  );
}

export default function HowItWorksModal() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        Comment ça marche ?
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text)]">
            Comment ça marche ?
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg)] text-[var(--text-tertiary)] hover:text-[var(--text)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Architecture diagram */}
        <div className="px-6 py-8">
          <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
            Votre question traverse 4 étapes pour interroger les données ouvertes françaises.
            <br />
            <span className="text-[11px] text-[var(--text-tertiary)]">Survolez chaque étape pour en savoir plus.</span>
          </p>

          {/* Flow */}
          <div className="flex items-start justify-center">
            {STEPS.map((step, i) => (
              <div key={step.label} className="flex items-start">
                <StepNode step={step} />
                {i < STEPS.length - 1 && <Arrow />}
              </div>
            ))}
          </div>

          {/* Return arrow */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg)] border border-[var(--border-subtle)]">
              <svg
                className="w-4 h-4 text-[var(--text-tertiary)] rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
              <span className="text-[11px] text-[var(--text-tertiary)]">
                Réponse synthétisée avec les vrais datasets
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] px-6 py-4 bg-[var(--bg)]">
          <p className="text-[11px] text-[var(--text-tertiary)] text-center leading-relaxed">
            100% des réponses sont basées sur les{' '}
            <span className="font-medium text-[var(--text-secondary)]">vraies données</span>{' '}
            de data.gouv.fr — aucune hallucination possible sur les datasets.
            <br />
            Code source disponible sur{' '}
            <a
              href="https://github.com/alexishessler/MCPdatagouv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--french-blue)] hover:underline font-medium"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
