import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import alvaCapitalLogo from "@assets/image_1759129583507.png";

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: "What is AlvaCapital?",
      answer: "AlvaCapital is a multi-account trading platform that allows you to connect and manage trading accounts from multiple brokers (Exness, Bybit, Binance) in one place. We offer copy trading, portfolio management, and referral earning opportunities."
    },
    {
      question: "Which brokers can I connect?",
      answer: "Currently, you can connect accounts from Exness (Forex, Indices, Commodities), Bybit (Forex, Indices, Commodities, Stocks, Crypto Spot/Futures), and Binance (Crypto Spot/Futures). More brokers will be added in the future."
    },
    {
      question: "How does copy trading work?",
      answer: "Our AI-powered copy trading system mirrors the strategies of our master traders across all your connected accounts. You can choose which strategies to follow and set your own risk parameters and position sizes."
    },
    {
      question: "What is the referral program?",
      answer: "Our referral program allows you to earn 10% commission on fees from investors you refer to the platform. You get a unique referral link and earn passive income from your network's trading activity."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we use bank-level security with military-grade encryption, secure API connections, and advanced authentication. We never store your broker passwords and only use read-only API access where possible."
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up for an account, connect your trading accounts from supported brokers, and start using our copy trading features. You can also generate your referral link to start earning commissions immediately."
    },
    {
      question: "Are there any fees?",
      answer: "AlvaCapital operates on a performance-based fee structure. We only earn when you earn. Specific fee details are provided during the account setup process and vary based on the services you use."
    },
    {
      question: "Can I disconnect my accounts?",
      answer: "Yes, you can disconnect any trading account at any time from your dashboard. This will stop all copy trading activities for that account immediately."
    },
    {
      question: "Do you offer customer support?",
      answer: "Yes, we provide 24/7 customer support through WhatsApp and our Telegram community. Our expert team is always available to assist with your trading needs and technical questions."
    },
    {
      question: "Is AlvaCapital available worldwide?",
      answer: "AlvaCapital is available in most countries. However, availability may be restricted in certain jurisdictions due to local regulations. Please check with our support team if you're unsure about availability in your region."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(217,100%,70%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217,100%,70%) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>
      
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-cyan-500/30 sticky top-0 z-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <img 
                src={alvaCapitalLogo} 
                alt="AlvaCapital Logo" 
                className="w-10 h-10 object-contain"
                data-testid="logo-image"
              />
              <span className="text-2xl font-mono font-bold text-cyan-400">ALVA CAPITAL</span>
            </a>
            <div className="flex items-center space-x-4">
              <a 
                href="/api/login"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black px-6 py-2 rounded-md font-mono font-bold transition-colors"
              >
                SIGN IN
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-5xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            FREQUENTLY ASKED QUESTIONS
          </h1>
          <p className="text-xl text-zinc-400 font-mono">
            FIND ANSWERS ABOUT ALVA CAPITAL
          </p>
        </div>

        <div className="space-y-4 relative z-10">
          {faqItems.map((item, index) => (
            <Card key={index} className="bg-zinc-900/50 border-2 border-cyan-500/30 hover:border-cyan-500 transition-all backdrop-blur-sm">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-cyan-500/5 transition-colors"
                  data-testid={`faq-question-${index}`}
                >
                  <h3 className="font-mono font-semibold text-lg pr-4 text-cyan-400">{item.question}</h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-cyan-400 flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <p className="text-zinc-400 leading-relaxed font-mono text-sm" data-testid={`faq-answer-${index}`}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12 p-8 bg-zinc-900/50 border-2 border-cyan-500/30 rounded-lg relative z-10">
          <h2 className="text-3xl font-mono font-bold text-cyan-400 mb-4">STILL HAVE QUESTIONS?</h2>
          <p className="text-zinc-400 mb-6 font-mono">
            OUR SUPPORT TEAM IS AVAILABLE 24/7
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.link/jtjivz"
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-mono font-bold transition-colors"
              data-testid="contact-whatsapp"
            >
              CONTACT WHATSAPP
            </a>
            <a
              href="https://t.me/profitmaxingsignals"
              target="_blank"
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black px-6 py-3 rounded-md font-mono font-bold transition-colors"
              data-testid="join-telegram"
            >
              JOIN TELEGRAM
            </a>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </div>
  );
}