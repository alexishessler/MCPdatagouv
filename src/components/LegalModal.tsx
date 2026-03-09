'use client';

import { useState } from 'react';

export default function LegalModal() {
  const [open, setOpen] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        Mentions légales
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
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-[var(--text)]">
            Mentions légales & Confidentialité
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

        {/* Content */}
        <div className="px-6 py-5 space-y-5 text-sm text-[var(--text-secondary)] leading-relaxed">
          {/* Éditeur */}
          <section>
            <h3 className="text-[var(--text)] font-semibold mb-1.5">Éditeur du site</h3>
            <p>
              Ce site est édité par <span className="font-medium text-[var(--text)]">Alexis Hessler</span>, personne physique.
            </p>
            <p className="mt-1.5">
              Contact :{' '}
              {showEmail ? (
                <a
                  href="mailto:alexis.hessler@protonmail.fr"
                  className="text-[var(--french-blue)] hover:underline"
                >
                  alexis.hessler@protonmail.fr
                </a>
              ) : (
                <button
                  onClick={() => setShowEmail(true)}
                  className="text-[var(--french-blue)] hover:underline cursor-pointer"
                >
                  Afficher l&apos;adresse e-mail
                </button>
              )}
            </p>
          </section>

          {/* Hébergement */}
          <section>
            <h3 className="text-[var(--text)] font-semibold mb-1.5">Hébergement</h3>
            <p>Ce site est hébergé par Vercel Inc. ou auto-hébergé sur VPS selon la configuration de déploiement.</p>
          </section>

          {/* Données collectées */}
          <section>
            <h3 className="text-[var(--text)] font-semibold mb-1.5">Données collectées</h3>
            <p className="mb-2">
              Ce site collecte uniquement les données strictement nécessaires à son fonctionnement :
            </p>
            <ul className="space-y-1.5 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-[var(--french-blue)] mt-1 text-xs">●</span>
                <span><span className="font-medium text-[var(--text)]">Adresse IP</span> — utilisée uniquement pour le contrôle du quota journalier (100 requêtes/jour). Non stockée de façon permanente.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--french-blue)] mt-1 text-xs">●</span>
                <span><span className="font-medium text-[var(--text)]">Identifiant de session</span> — généré aléatoirement dans votre navigateur pour limiter les requêtes par session (10/session). Aucun cookie n&apos;est utilisé.</span>
              </li>
            </ul>
          </section>

          {/* Ce qu'on ne fait pas */}
          <section>
            <h3 className="text-[var(--text)] font-semibold mb-1.5">Ce que nous ne faisons pas</h3>
            <ul className="space-y-1 pl-4">
              {[
                'Aucun cookie de tracking ou publicitaire',
                'Aucune collecte de données personnelles',
                'Aucun partage de données avec des tiers',
                'Aucun stockage permanent des conversations',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5 text-xs">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Services tiers */}
          <section>
            <h3 className="text-[var(--text)] font-semibold mb-1.5">Services tiers</h3>
            <ul className="space-y-1 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-[var(--french-blue)] mt-1 text-xs">●</span>
                <span><span className="font-medium text-[var(--text)]">Mistral AI</span> — vos messages sont envoyés à l&apos;API Mistral pour générer les réponses. Voir la <a href="https://mistral.ai/fr/terms/#privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline">politique de confidentialité de Mistral</a>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[var(--french-blue)] mt-1 text-xs">●</span>
                <span><span className="font-medium text-[var(--text)]">data.gouv.fr</span> — les recherches sont transmises au serveur MCP officiel de data.gouv.fr (données publiques).</span>
              </li>
            </ul>
          </section>

          {/* Code source */}
          <section className="bg-[var(--bg)] rounded-xl p-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Ce projet est open source :{' '}
              <a
                href="https://github.com/alexishessler/MCPdatagouv"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--french-blue)] hover:underline font-medium"
              >
                github.com/alexishessler/MCPdatagouv
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
