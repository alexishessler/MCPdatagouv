'use client';

import { useState } from 'react';

export default function LegalModal() {
  const [open, setOpen] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [tab, setTab] = useState<'mentions' | 'privacy'>('mentions');

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
      >
        Mentions l&eacute;gales
      </button>
    );
  }

  const SectionTitle = ({ num, children }: { num: string; children: React.ReactNode }) => (
    <h3 className="text-[var(--text)] font-semibold mb-1.5 flex items-center gap-2">
      <span className="text-[10px] font-bold text-[var(--french-blue)] bg-[rgba(0,35,149,0.08)] rounded px-1.5 py-0.5 tabular-nums">{num}</span>
      {children}
    </h3>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[85vh] overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-[var(--border)] px-6 py-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-[var(--text)]">
              Informations l&eacute;gales
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
          {/* Tabs */}
          <div className="flex gap-1 bg-[var(--bg)] rounded-lg p-0.5">
            <button
              onClick={() => setTab('mentions')}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${tab === 'mentions' ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
            >
              Mentions l&eacute;gales
            </button>
            <button
              onClick={() => setTab('privacy')}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${tab === 'privacy' ? 'bg-white text-[var(--text)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
            >
              Confidentialit&eacute;
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5 text-sm text-[var(--text-secondary)] leading-relaxed overflow-y-auto max-h-[60vh]">
          {tab === 'mentions' ? (
            <>
              {/* 01 — Éditeur */}
              <section>
                <SectionTitle num="01">&Eacute;diteur du site</SectionTitle>
                <p>
                  Ce site est &eacute;dit&eacute; par <span className="font-medium text-[var(--text)]">Alexis Hessler</span>, personne physique,
                  au sens de l&apos;article 6 de la loi n&deg; 2004-575 du 21 juin 2004 pour la confiance dans l&apos;&eacute;conomie num&eacute;rique (LCEN).
                </p>
                <p className="mt-1.5">
                  Directeur de la publication : <span className="font-medium text-[var(--text)]">Alexis Hessler</span>
                </p>
                <p className="mt-1.5">
                  Contact :{' '}
                  {showEmail ? (
                    <a href="mailto:alexis.hessler@protonmail.fr" className="text-[var(--french-blue)] hover:underline">
                      alexis.hessler@protonmail.fr
                    </a>
                  ) : (
                    <button onClick={() => setShowEmail(true)} className="text-[var(--french-blue)] hover:underline cursor-pointer">
                      Afficher l&apos;adresse e-mail
                    </button>
                  )}
                </p>
              </section>

              {/* 02 — Hébergement */}
              <section>
                <SectionTitle num="02">H&eacute;bergement</SectionTitle>
                <div className="bg-[var(--bg)] rounded-xl p-3 space-y-1 text-xs">
                  <p><span className="font-medium text-[var(--text)]">LWS</span> (Ligne Web Services)</p>
                  <p>10, rue de Penthi&egrave;vre &mdash; 75008 Paris, France</p>
                  <p>SAS au capital de 500 000 &euro; &mdash; RCS Paris B 851 993 683</p>
                  <p>Site : <a href="https://www.lws.fr" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline">lws.fr</a></p>
                  <p className="mt-1.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="font-medium text-[var(--text)]">Donn&eacute;es h&eacute;berg&eacute;es en France</span>
                  </p>
                </div>
              </section>

              {/* 03 — Transparence IA */}
              <section>
                <SectionTitle num="03">Transparence &mdash; Intelligence artificielle</SectionTitle>
                <p className="mb-2">
                  Conform&eacute;ment au <span className="font-medium text-[var(--text)]">R&egrave;glement europ&eacute;en sur l&apos;intelligence artificielle</span> (R&egrave;glement UE 2024/1689, dit &laquo;&nbsp;IA Act&nbsp;&raquo;), nous vous informons que :
                </p>
                <div className="bg-[rgba(0,35,149,0.04)] border border-[rgba(0,35,149,0.1)] rounded-xl p-3 space-y-2 text-xs">
                  <p className="flex items-start gap-2">
                    <span className="text-[var(--french-blue)] mt-0.5">&#9432;</span>
                    <span>Ce service int&egrave;gre un <span className="font-medium text-[var(--text)]">syst&egrave;me d&apos;IA &agrave; usage g&eacute;n&eacute;ral</span> (GPAI) au sens de l&apos;Art. 50 du R&egrave;glement.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[var(--french-blue)] mt-0.5">&#9432;</span>
                    <span>Le chatbot utilise le mod&egrave;le <span className="font-medium text-[var(--text)]">Mistral Small</span>, d&eacute;velopp&eacute; par <a href="https://mistral.ai" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline font-medium">Mistral AI</a> (soci&eacute;t&eacute; fran&ccedil;aise, Paris).</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[var(--french-blue)] mt-0.5">&#9432;</span>
                    <span>Les r&eacute;ponses sont <span className="font-medium text-[var(--text)]">g&eacute;n&eacute;r&eacute;es par intelligence artificielle</span> et peuvent contenir des erreurs. Elles ne constituent en aucun cas un avis officiel.</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="text-[var(--french-blue)] mt-0.5">&#9432;</span>
                    <span>Classification du risque : <span className="font-medium text-[var(--text)]">risque minimal</span> (recherche et synth&egrave;se de donn&eacute;es ouvertes). Aucune d&eacute;cision automatis&eacute;e au sens de l&apos;Art. 22 du RGPD.</span>
                  </p>
                </div>
              </section>

              {/* 04 — Services tiers */}
              <section>
                <SectionTitle num="04">Sous-traitants et services tiers</SectionTitle>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-[var(--french-blue)] mt-0.5">&bull;</span>
                    <span><span className="font-medium text-[var(--text)]">Mistral AI</span> (Paris, France) &mdash; Traitement des requ&ecirc;tes en langage naturel. <a href="https://mistral.ai/fr/terms/#privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline">Politique de confidentialit&eacute;</a></span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-[var(--french-blue)] mt-0.5">&bull;</span>
                    <span><span className="font-medium text-[var(--text)]">data.gouv.fr</span> (DINUM, France) &mdash; API de donn&eacute;es ouvertes de l&apos;&Eacute;tat fran&ccedil;ais. <a href="https://www.data.gouv.fr/fr/terms/" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline">Conditions d&apos;utilisation</a></span>
                  </div>
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-[var(--french-blue)] mt-0.5">&bull;</span>
                    <span><span className="font-medium text-[var(--text)]">LWS</span> (Paris, France) &mdash; H&eacute;bergement du serveur VPS</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-green-700 font-medium flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                  Tous les sous-traitants sont situ&eacute;s dans l&apos;Union europ&eacute;enne. Aucun transfert de donn&eacute;es hors UE.
                </p>
              </section>

              {/* 05 — Propriété intellectuelle */}
              <section>
                <SectionTitle num="05">Propri&eacute;t&eacute; intellectuelle</SectionTitle>
                <p>
                  Le code source de ce projet est distribu&eacute; sous <span className="font-medium text-[var(--text)]">licence open source</span> sur GitHub.
                  Les donn&eacute;es issues de data.gouv.fr sont soumises &agrave; la <a href="https://www.etalab.gouv.fr/licence-ouverte-open-licence/" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline">Licence Ouverte Etalab 2.0</a>.
                </p>
              </section>

              {/* 06 — Loi applicable */}
              <section>
                <SectionTitle num="06">Droit applicable</SectionTitle>
                <p>
                  Le pr&eacute;sent site est soumis au droit fran&ccedil;ais. Tout litige relatif &agrave; son utilisation sera soumis aux juridictions fran&ccedil;aises comp&eacute;tentes.
                </p>
              </section>
            </>
          ) : (
            /* ─── Onglet Confidentialité ─── */
            <>
              {/* 01 — Responsable */}
              <section>
                <SectionTitle num="01">Responsable du traitement</SectionTitle>
                <p>
                  Le responsable du traitement des donn&eacute;es est <span className="font-medium text-[var(--text)]">Alexis Hessler</span>, joignable &agrave; l&apos;adresse :{' '}
                  {showEmail ? (
                    <a href="mailto:alexis.hessler@protonmail.fr" className="text-[var(--french-blue)] hover:underline">alexis.hessler@protonmail.fr</a>
                  ) : (
                    <button onClick={() => setShowEmail(true)} className="text-[var(--french-blue)] hover:underline cursor-pointer">afficher l&apos;e-mail</button>
                  )}
                </p>
              </section>

              {/* 02 — Données collectées */}
              <section>
                <SectionTitle num="02">Donn&eacute;es collect&eacute;es et finalit&eacute;s</SectionTitle>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left py-1.5 pr-2 font-semibold text-[var(--text)]">Donn&eacute;e</th>
                        <th className="text-left py-1.5 pr-2 font-semibold text-[var(--text)]">Finalit&eacute;</th>
                        <th className="text-left py-1.5 font-semibold text-[var(--text)]">Conservation</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--text-secondary)]">
                      <tr className="border-b border-[var(--border)]/50">
                        <td className="py-1.5 pr-2 font-medium text-[var(--text)]">Adresse IP</td>
                        <td className="py-1.5 pr-2">Limitation du nombre de requ&ecirc;tes (quota)</td>
                        <td className="py-1.5">24 h glissantes</td>
                      </tr>
                      <tr className="border-b border-[var(--border)]/50">
                        <td className="py-1.5 pr-2 font-medium text-[var(--text)]">ID de session</td>
                        <td className="py-1.5 pr-2">Suivi de la conversation en cours</td>
                        <td className="py-1.5">Dur&eacute;e de la session</td>
                      </tr>
                      <tr>
                        <td className="py-1.5 pr-2 font-medium text-[var(--text)]">Messages envoy&eacute;s</td>
                        <td className="py-1.5 pr-2">Transmis &agrave; Mistral AI pour g&eacute;n&eacute;rer une r&eacute;ponse</td>
                        <td className="py-1.5">Non conserv&eacute;s c&ocirc;t&eacute; serveur</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 03 — Base juridique */}
              <section>
                <SectionTitle num="03">Base juridique</SectionTitle>
                <p>
                  Le traitement repose sur l&apos;<span className="font-medium text-[var(--text)]">int&eacute;r&ecirc;t l&eacute;gitime</span> du responsable de traitement (Art. 6.1.f du RGPD) : assurer le bon fonctionnement du service et pr&eacute;venir les abus.
                  Aucun consentement n&apos;est requis car aucun cookie ni traceur n&apos;est utilis&eacute;.
                </p>
              </section>

              {/* 04 — Ce que nous ne faisons pas */}
              <section>
                <SectionTitle num="04">Engagements</SectionTitle>
                <ul className="space-y-1 pl-1">
                  {[
                    'Aucun cookie de tracking, publicitaire ou analytique',
                    'Aucun pixel de suivi ni fingerprinting navigateur',
                    'Aucune collecte de donn\u00e9es personnelles (nom, e-mail, etc.)',
                    'Aucun partage ni revente de donn\u00e9es \u00e0 des tiers',
                    'Aucun stockage permanent des conversations',
                    'Aucun profilage ni d\u00e9cision automatis\u00e9e',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs">
                      <span className="text-green-600 mt-0.5">&check;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 05 — Droits des personnes */}
              <section>
                <SectionTitle num="05">Vos droits (RGPD Art. 15 &agrave; 22)</SectionTitle>
                <p className="mb-2">
                  Conform&eacute;ment au R&egrave;glement g&eacute;n&eacute;ral sur la protection des donn&eacute;es (UE 2016/679), vous disposez des droits suivants :
                </p>
                <ul className="space-y-1 pl-1 text-xs">
                  {[
                    { right: "Acc\u00e8s", art: "Art. 15" },
                    { right: "Rectification", art: "Art. 16" },
                    { right: "Effacement", art: "Art. 17" },
                    { right: "Limitation du traitement", art: "Art. 18" },
                    { right: "Portabilit\u00e9", art: "Art. 20" },
                    { right: "Opposition", art: "Art. 21" },
                  ].map((item) => (
                    <li key={item.right} className="flex items-start gap-2">
                      <span className="text-[var(--french-blue)] mt-0.5">&bull;</span>
                      <span>Droit d&apos;{item.right.toLowerCase()} <span className="text-[var(--text-tertiary)]">({item.art})</span></span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">
                  Pour exercer ces droits, contactez{' '}
                  {showEmail ? (
                    <a href="mailto:alexis.hessler@protonmail.fr" className="text-[var(--french-blue)] hover:underline">alexis.hessler@protonmail.fr</a>
                  ) : (
                    <button onClick={() => setShowEmail(true)} className="text-[var(--french-blue)] hover:underline cursor-pointer">l&apos;&eacute;diteur</button>
                  )}
                  . R&eacute;ponse sous 30 jours maximum.
                </p>
                <p className="mt-1.5 text-xs">
                  Vous pouvez &eacute;galement introduire une r&eacute;clamation aupr&egrave;s de la <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline font-medium">CNIL</a> (Commission nationale de l&apos;informatique et des libert&eacute;s).
                </p>
              </section>

              {/* 06 — Cookies */}
              <section>
                <SectionTitle num="06">Cookies et traceurs</SectionTitle>
                <p className="text-xs font-medium text-[var(--text)] bg-[var(--bg)] rounded-lg px-3 py-2">
                  Ce site n&apos;utilise aucun cookie, aucun traceur et aucun outil d&apos;analyse d&apos;audience.
                  L&apos;identifiant de session est stock&eacute; dans la m&eacute;moire du navigateur (sessionStorage) et dispara&icirc;t &agrave; la fermeture de l&apos;onglet.
                </p>
              </section>

              {/* 07 — Sécurité */}
              <section>
                <SectionTitle num="07">S&eacute;curit&eacute; des donn&eacute;es</SectionTitle>
                <ul className="space-y-1 pl-1 text-xs">
                  {[
                    'Chiffrement HTTPS (TLS 1.3) sur toutes les communications',
                    'Serveur h\u00e9berg\u00e9 en France avec acc\u00e8s restreint (SSH uniquement)',
                    'Aucune base de donn\u00e9es de donn\u00e9es personnelles',
                    'Purge automatique des donn\u00e9es temporaires toutes les 24 h',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">&check;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 08 — Mise à jour */}
              <section>
                <SectionTitle num="08">Mise &agrave; jour</SectionTitle>
                <p className="text-xs">
                  Derni&egrave;re mise &agrave; jour : <span className="font-medium text-[var(--text)]">10 mars 2026</span>.
                  Toute modification substantielle sera signal&eacute;e sur cette page.
                </p>
              </section>
            </>
          )}

          {/* Open source footer */}
          <section className="bg-[var(--bg)] rounded-xl p-4">
            <p className="text-xs text-[var(--text-secondary)]">
              Projets open source :{' '}
              <a href="https://github.com/alexishessler/MCPdatagouv" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline font-medium">MCPdatagouv</a>
              {' '}&middot;{' '}
              <a href="https://github.com/alexishessler/loi-de-benford" target="_blank" rel="noopener noreferrer" className="text-[var(--french-blue)] hover:underline font-medium">Loi de Benford</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
