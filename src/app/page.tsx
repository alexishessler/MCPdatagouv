import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-[var(--bg)]">
      <Header />
      <ChatBot />
    </main>
  );
}
