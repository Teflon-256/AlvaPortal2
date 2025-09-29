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
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <img 
                src={alvaCapitalLogo} 
                alt="AlvaCapital Logo" 
                className="w-10 h-10 object-contain"
                data-testid="logo-image"
              />
              <span className="text-xl font-serif font-bold gradient-text">AlvaCapital</span>
            </a>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
              <a 
                href="/api/login"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold gradient-text mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about AlvaCapital
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <Card key={index} className="premium-card">
              <CardContent className="p-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-muted/5 transition-colors"
                  data-testid={`faq-question-${index}`}
                >
                  <h3 className="font-semibold text-lg pr-4">{item.question}</h3>
                  {openItems.includes(index) ? (
                    <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <p className="text-muted-foreground leading-relaxed" data-testid={`faq-answer-${index}`}>
                      {item.answer}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-12 p-8 bg-muted/10 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Our support team is available 24/7 to help you with any questions or issues.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.link/jtjivz"
              target="_blank"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
              data-testid="contact-whatsapp"
            >
              Contact WhatsApp Support
            </a>
            <a
              href="https://t.me/profitmaxingsignals"
              target="_blank"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md font-medium transition-colors"
              data-testid="join-telegram"
            >
              Join Telegram Community
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}