export default function Header() {
  return (
    <header className="relative flex-shrink-0">
      {/* Tricolor line */}
      <div className="tricolor-line" />

      <div className="glass-strong border-b border-white/5 px-4 sm:px-6 py-3.5">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          {/* Profile photo with glow */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full animate-pulse-glow" />
            <img
              src="https://github.com/alexishessler.png"
              alt="Alexis Hessler"
              width={48}
              height={48}
              className="relative w-12 h-12 rounded-full ring-2 ring-french-blue/40 object-cover"
            />
          </div>

          {/* Title */}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold gradient-text truncate">
              MCP DataGouv Explorer
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 truncate">
              Explorez les données ouvertes françaises par l&apos;IA
            </p>
          </div>

          {/* Badges + GitHub link */}
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-french-blue/15 text-blue-300 border border-french-blue/20">
                Mistral AI
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-french-red/10 text-red-300 border border-french-red/15">
                data.gouv.fr
              </span>
            </div>

            <a
              href="https://github.com/alexishessler/MCPdatagouv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors duration-200"
              title="Voir sur GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
