import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartLine, MessageCircle, Shield, TrendingUp, Cpu, Globe, Lock, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Link } from "wouter";

export default function Landing() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [liveUsers, setLiveUsers] = useState(28);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const userInterval = setInterval(() => {
      setLiveUsers((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);

    return () => clearInterval(userInterval);
  }, []);

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 px-4">
        <div className="relative mb-8">
          <svg 
            className="w-16 h-16 md:w-24 md:h-24 animate-spin" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="40" stroke="hsl(217,100%,70%)" strokeWidth="3" fill="none" opacity="0.2" />
            <path 
              d="M 50 10 A 40 40 0 0 1 90 50" 
              stroke="hsl(217,100%,70%)" 
              strokeWidth="3" 
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        <div className="text-2xl md:text-4xl font-mono font-bold mb-4 glitch-text text-center" data-text={`LOADING - ${loadingProgress}%`}>
          LOADING - {loadingProgress}%
        </div>
        
        <div className="w-48 md:w-64 h-1 bg-zinc-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>

        <style>{`
          .glitch-text {
            color: hsl(217,100%,70%);
            position: relative;
            animation: glitch 1s infinite;
          }
          
          .glitch-text::before,
          .glitch-text::after {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
          }
          
          .glitch-text::before {
            left: 2px;
            text-shadow: -2px 0 hsl(180,100%,50%);
            clip: rect(24px, 550px, 90px, 0);
            animation: glitch-anim-1 2s infinite linear alternate-reverse;
          }
          
          .glitch-text::after {
            left: -2px;
            text-shadow: -2px 0 hsl(300,100%,50%);
            clip: rect(85px, 550px, 140px, 0);
            animation: glitch-anim-2 2s infinite linear alternate-reverse;
          }
          
          @keyframes glitch {
            0% { transform: translate(0) }
            20% { transform: translate(-2px, 2px) }
            40% { transform: translate(-2px, -2px) }
            60% { transform: translate(2px, 2px) }
            80% { transform: translate(2px, -2px) }
            100% { transform: translate(0) }
          }
          
          @keyframes glitch-anim-1 {
            0% { clip: rect(61px, 9999px, 91px, 0) }
            25% { clip: rect(12px, 9999px, 45px, 0) }
            50% { clip: rect(88px, 9999px, 13px, 0) }
            75% { clip: rect(35px, 9999px, 77px, 0) }
            100% { clip: rect(29px, 9999px, 66px, 0) }
          }
          
          @keyframes glitch-anim-2 {
            0% { clip: rect(35px, 9999px, 88px, 0) }
            25% { clip: rect(77px, 9999px, 23px, 0) }
            50% { clip: rect(19px, 9999px, 68px, 0) }
            75% { clip: rect(92px, 9999px, 41px, 0) }
            100% { clip: rect(53px, 9999px, 15px, 0) }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background grid */}
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

      {/* Contact Support Button */}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50">
        <a 
          href="https://wa.me/256726151699" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-black border-2 border-cyan-500 rounded-full px-4 py-2 md:px-6 md:py-3 hover:bg-cyan-500/10 transition-colors inline-block"
          data-testid="link-contact-support"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-cyan-500" />
            <span className="text-cyan-500 font-mono text-xs md:text-sm">Contact Support</span>
          </div>
        </a>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-cyan-500/30 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center space-x-2 md:space-x-4 cursor-pointer group" onClick={handleGetStarted} data-testid="logo-alva-capital">
              <span className="text-lg md:text-2xl font-mono font-bold text-cyan-400 glitch-text-subtle">ALVA CAPITAL</span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-8 font-mono text-sm">
              <button onClick={() => scrollToSection('brokers')} className="text-cyan-400 hover:text-cyan-300 transition-colors tracking-wider">BROKERS</button>
              <button onClick={() => scrollToSection('features')} className="text-cyan-400 hover:text-cyan-300 transition-colors tracking-wider">FEATURES</button>
              <button onClick={() => scrollToSection('stats')} className="text-cyan-400 hover:text-cyan-300 transition-colors tracking-wider">STATS</button>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <LanguageSelector />
                <ThemeToggle />
              </div>
              <Button 
                onClick={handleGetStarted}
                variant="outline"
                className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono font-bold tracking-wider px-3 py-2 md:px-6 text-xs md:text-sm"
                data-testid="button-sign-in-nav"
              >
                SIGN IN
              </Button>
              <Button 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold tracking-wider px-3 py-2 md:px-6 text-xs md:text-sm"
                data-testid="button-create-account-nav"
              >
                CREATE ACCOUNT
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Live Status Bar */}
      <div className="fixed top-16 md:top-20 w-full bg-zinc-900/90 backdrop-blur-sm border-b border-cyan-500/30 z-30 py-2">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between font-mono text-xs overflow-x-auto">
            <div className="flex items-center gap-3 md:gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-green-400 whitespace-nowrap">{liveUsers} TRADERS</span>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span className="text-cyan-400">ENCRYPTED PROTOCOL</span>
              </div>
              <div className="text-zinc-500 hidden lg:block">
                VP22-{Math.floor(Math.random() * 90000000) + 10000000}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400">MAINNET</span>
            </div>
          </div>
        </div>
      </div>

      <main className="pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4 md:px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-9xl font-mono font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 glitch-text-hero" data-text="DISCOVER">
                  DISCOVER
                </span>
              </h1>
              <div className="text-2xl md:text-4xl font-mono text-cyan-400 tracking-widest">
                THE FUTURE OF TRADING
              </div>
            </div>
            
            <p className="text-base md:text-lg lg:text-xl text-zinc-400 max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed px-4">
              Multi-broker portfolio management with real-time copy trading, automated strategies, 
              and institutional-grade risk management. Welcome to the next generation of digital asset trading.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold text-base md:text-lg px-8 py-4 md:px-12 md:py-6 tracking-wider relative overflow-hidden group w-full sm:w-auto"
                data-testid="button-create-account-hero"
              >
                <span className="relative z-10">CREATE ACCOUNT</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              
              <button 
                onClick={handleGetStarted}
                className="border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 font-mono font-bold text-base md:text-lg px-8 py-4 md:px-12 md:py-6 tracking-wider transition-all w-full sm:w-auto"
                data-testid="button-sign-in-hero"
              >
                SIGN IN
              </button>
            </div>

            {/* Scroll indicator */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 animate-bounce">
              <div className="w-6 h-10 border-2 border-cyan-500 rounded-full flex items-start justify-center p-2">
                <div className="w-1 h-3 bg-cyan-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Brokers Section */}
        <section id="brokers" className="relative py-16 md:py-32 px-4 md:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
                BROKERS
              </h2>
              <div className="text-cyan-400 font-mono text-sm md:text-lg tracking-widest">MULTI-BROKER TRADING INFRASTRUCTURE</div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {[
                {
                  icon: Globe,
                  title: "BYBIT",
                  subtitle: "Crypto Trading",
                  description: "Real-time cryptocurrency trading with instant execution and deep liquidity across spot and perpetual futures",
                  stats: "24/7 Trading",
                  link: "https://partner.bybit.com/b/119776"
                },
                {
                  icon: TrendingUp,
                  title: "TRADEFI",
                  subtitle: "Forex, CFDs, Indices & Stocks",
                  description: "Professional multi-asset trading platform with institutional spreads across forex, commodities, indices and global equities",
                  stats: "150+ Markets",
                  link: "https://www.bybit.com/future-activity/en/tradfi"
                }
              ].map((broker, idx) => (
                <a 
                  key={idx} 
                  href={broker.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  data-testid={`link-broker-${broker.title.toLowerCase()}`}
                >
                  <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 hover:border-cyan-500 transition-all duration-300 group backdrop-blur-sm cursor-pointer h-full">
                    <CardContent className="p-6 md:p-8">
                      <div className="mb-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <broker.icon className="w-6 h-6 md:w-8 md:h-8 text-black" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-mono font-bold text-cyan-400 mb-1">{broker.title}</h3>
                        <div className="text-xs md:text-sm font-mono text-zinc-500 tracking-wider">{broker.subtitle}</div>
                      </div>
                      <p className="text-sm md:text-base text-zinc-400 mb-4 leading-relaxed">{broker.description}</p>
                      <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs md:text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {broker.stats}
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-16 md:py-32 px-4 md:px-6 bg-gradient-to-b from-black via-zinc-900 to-black">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 md:mb-20">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
                FEATURES
              </h2>
              <div className="text-cyan-400 font-mono text-sm md:text-lg tracking-widest">ADVANCED TRADING CAPABILITIES</div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[
                { icon: Cpu, title: "Copy Trading", description: "Mirror top traders with instant position replication and automated profit sharing" },
                { icon: Shield, title: "Risk Management", description: "Progressive risk limits with max drawdown protection from 0.2% to 50%" },
                { icon: TrendingUp, title: "Real-Time Analytics", description: "Live P&L tracking, performance metrics, and comprehensive reporting" },
                { icon: Zap, title: "Instant Execution", description: "Sub-second order execution across all connected brokers" },
                { icon: Lock, title: "Secure API", description: "Bank-level encryption for all API keys and trading credentials" },
                { icon: ChartLine, title: "Multi-Asset", description: "Trade crypto, forex, stocks, and commodities from one platform" }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className="border border-cyan-500/30 hover:border-cyan-500 bg-black/50 backdrop-blur-sm p-8 transition-all duration-300 hover:transform hover:scale-105 group"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                    <feature.icon className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-xl font-mono font-bold text-cyan-400 mb-3">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section id="stats" className="relative py-32 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-8">
              ENTERPRISE-GRADE PLATFORM
            </h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Built with institutional-grade security, real-time execution, and professional support. 
              Your trading operations are backed by cutting-edge technology and unwavering reliability.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-7xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-8">
              START TRADING
            </h2>
            <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
              Join thousands of traders who have already entered the protocol. 
              Your journey to automated trading excellence starts here.
            </p>
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:via-blue-400 hover:to-purple-400 text-black font-mono font-bold text-xl px-16 py-8 tracking-wider relative overflow-hidden group"
              data-testid="button-create-account-cta"
            >
              <span className="relative z-10">CREATE ACCOUNT NOW</span>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-cyan-500/30 bg-black/80 backdrop-blur-sm py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="font-mono text-cyan-400">© 2025 ALVA CAPITAL</span>
            </div>
            <div className="flex items-center gap-6 font-mono text-sm text-zinc-500">
              <Link href="/terms" className="hover:text-cyan-400 transition-colors" data-testid="link-terms">
                TERMS
              </Link>
              <Link href="/privacy" className="hover:text-cyan-400 transition-colors" data-testid="link-privacy">
                PRIVACY
              </Link>
              <a 
                href="https://wa.me/256726151699" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors"
                data-testid="link-support"
              >
                SUPPORT
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }

        .glitch-text-subtle {
          animation: glitch-subtle 3s infinite;
        }

        @keyframes glitch-subtle {
          0%, 100% { transform: translate(0) }
          25% { transform: translate(-1px, 1px) }
          50% { transform: translate(1px, -1px) }
          75% { transform: translate(1px, 1px) }
        }

        .glitch-text-hero {
          position: relative;
          display: inline-block;
        }

        .glitch-text-hero::before,
        .glitch-text-hero::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: inherit;
          -webkit-background-clip: text;
          background-clip: text;
        }

        .glitch-text-hero::before {
          left: 2px;
          text-shadow: -2px 0 hsl(180,100%,50%);
          animation: glitch-anim-1 2.5s infinite linear alternate-reverse;
        }

        .glitch-text-hero::after {
          left: -2px;
          text-shadow: 2px 0 hsl(300,100%,50%);
          animation: glitch-anim-2 2.5s infinite linear alternate-reverse;
        }
      `}</style>
    </div>
  );
}
