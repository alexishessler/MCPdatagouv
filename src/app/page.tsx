import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import HowItWorksModal from '@/components/HowItWorksModal';

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-[var(--bg)]">
      <Header />
      <HowItWorksModal />
      <ChatBot />
    </main>
  );
}
