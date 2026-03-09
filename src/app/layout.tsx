import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MCP DataGouv Explorer',
  description:
    "Explorez les données ouvertes françaises par l'IA — Propulsé par Mistral AI & data.gouv.fr",
  openGraph: {
    title: 'MCP DataGouv Explorer',
    description:
      "Chatbot IA pour explorer les données ouvertes françaises via data.gouv.fr",
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-bg-primary text-white antialiased">{children}</body>
    </html>
  );
}
