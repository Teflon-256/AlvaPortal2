import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartLine, Link, Bot, Users, Shield, Headphones, TrendingUp, Zap, DollarSign, MessageCircle, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import { TradingAccountForm } from "@/components/TradingAccountForm";
import { MarketPrices } from "@/components/MarketPrices";
import alvaCapitalLogo from "@assets/image_1759129583507.png";
import laptopTrading from "@assets/Copilot_20251003_161134_1759498837182.png";
import tabletMarket from "@assets/1759495482418_100_1759499270310.png";
import mobileDerivatives from "@assets/1759495444187_100_1759499291943.png";
import iphoneTrading from "@assets/1759495512620_100_1759499304236.png";
import mobileBtcChart from "@assets/1759495369009_100_1759499337910.png";
import qrCode from "@assets/frame_1759515761162.png";

export default function Landing() {
  const { t } = useTranslation();
  const [multiBrokerOpen, setMultiBrokerOpen] = useState(false);
  const [copyTradingOpen, setCopyTradingOpen] = useState(false);
  
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  const handleLogoClick = () => {
    window.location.href = "/";
  };

  const handleMultiBrokerClick = () => {
    setMultiBrokerOpen(true);
  };

  const handleCopyTradingClick = () => {
    setCopyTradingOpen(true);
  };

  const handleRealTimeAnalyticsClick = () => {
    window.location.href = "/api/login";
  };

  const handleReferralProgramClick = () => {
    window.location.href = "/api/login";
  };

  // Copy trading links
  const copyTradingLinks = {
    exness: "https://my.exness.com/pa/socialtrading/",
    bybit: "https://finestel.com/app/copy-trading/U42AN0-S37396",
    binance: "https://finestel.com/app/copy-trading/SS98X3-S66396"
  };

  const handleStartTrading = (broker: string) => {
    const link = copyTradingLinks[broker as keyof typeof copyTradingLinks];
    if (link) {
      window.open(link, '_blank');
      setMultiBrokerOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={handleLogoClick}>
              <img 
                src={alvaCapitalLogo} 
                alt="AlvaCapital Logo" 
                className="w-10 h-10 object-contain"
                data-testid="logo-image"
              />
              <span className="text-xl font-serif font-bold gradient-text" data-testid="logo-text">AlvaCapital</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-features">Features</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-about">About</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors" data-testid="nav-contact">{t('contactUs')}</a>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
              <Button 
                variant="ghost" 
                onClick={handleGetStarted} 
                className="text-muted-foreground hover:text-primary"
                data-testid="nav-signin"
              >
                {t('signIn')}
              </Button>
              <Button 
                onClick={handleGetStarted} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="nav-get-started"
              >
                {t('getStarted')}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6 antialiased" data-testid="hero-title">
                {t('heroTitle')}
                <span className="gradient-text block">{t('heroSubtitle')}</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed antialiased" data-testid="hero-description">
                {t('heroDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  onClick={handleGetStarted} 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  data-testid="hero-start-trading"
                >
                  {t('startTrading')}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.open('http://www.youtube.com/@profitmaxing', '_blank')}
                  className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 px-8 py-4 text-lg font-semibold rounded-xl transition-all transform hover:scale-105"
                  data-testid="hero-learn-more"
                >
                  Learn More
                </Button>
              </div>
              <div className="mt-12 flex items-center justify-center lg:justify-start space-x-8">
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text" data-testid="stat-assets">$500M+</div>
                  <div className="text-sm text-muted-foreground">Assets Managed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text" data-testid="stat-traders">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Traders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text" data-testid="stat-uptime">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>
            </div>
            <div className="relative h-[600px] flex items-center justify-center" data-testid="hero-dashboard-preview">
              {/* Main Laptop Display - Center */}
              <div className="relative z-10 floating-animation">
                <div className="relative w-[500px] rounded-2xl shadow-2xl overflow-hidden border-4 border-gray-800">
                  <img 
                    src={laptopTrading} 
                    alt="Bybit Trading Platform on Laptop"
                    className="w-full h-auto"
                  />
                </div>
              </div>


              {/* Glow Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-3xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Image 1 - Above Live Quotes */}
      <section className="py-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="w-[500px] rounded-2xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform">
            <img 
              src={tabletMarket}
              alt="Bybit Market Sentiment and Data"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Market Prices Section */}
      <section className="py-16 bg-background border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Image 2 - Left side on same line as live quotes */}
            <div className="lg:col-span-3 flex justify-center">
              <div className="w-[280px] rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-transform">
                <img 
                  src={mobileDerivatives}
                  alt="Bybit Derivatives Trading"
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            {/* Market Prices */}
            <div className="lg:col-span-9">
              <MarketPrices />
            </div>
          </div>
        </div>
      </section>

      {/* Join on iPhone - Left Side */}
      <section className="py-12 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start items-center gap-6">
            <a 
              href="https://partner.bybit.com/b/119776"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer group"
              data-testid="join-iphone-link"
            >
              <div className="flex items-center gap-6 bg-black p-6 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform">
                <div className="w-[320px] rounded-3xl shadow-2xl overflow-hidden">
                  <img 
                    src={iphoneTrading}
                    alt="Bybit Mobile Trading on iPhone"
                    className="w-full h-auto"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Join on iPhone</h3>
                  <img 
                    src={qrCode}
                    alt="QR Code to join"
                    className="w-[150px] h-[150px] mx-auto"
                  />
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold gradient-text mb-4 antialiased" data-testid="features-title">{t('whyChooseUs')}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto antialiased" data-testid="features-description">
              {t('multiPlatformDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Link,
                title: "Bybit Integration",
                description: "Connect your Bybit account seamlessly for unified portfolio management, automated trading, and real-time analytics.",
                color: "text-primary",
                onClick: handleMultiBrokerClick
              },
              {
                icon: Bot,
                title: "AI Copy Trading",
                description: "Advanced copy trading system that mirrors our master traders' strategies on Bybit. Automated position replication with intelligent risk management.",
                color: "text-blue-400",
                onClick: handleCopyTradingClick
              },
              {
                icon: TrendingUp,
                title: "Real-time Analytics",
                description: "Get instant portfolio updates, performance metrics, and detailed analytics across all your trading accounts.",
                color: "text-blue-400",
                onClick: handleRealTimeAnalyticsClick
              },
              {
                icon: Users,
                title: "Referral Program",
                description: "Earn 10% commission on fees from investors you refer. Build your network and grow your passive income.",
                color: "text-purple-400",
                onClick: handleReferralProgramClick
              },
              {
                icon: Shield,
                title: "Bank-Level Security",
                description: "Military-grade encryption, secure API connections, and advanced authentication to protect your investments.",
                color: "text-orange-400",
                onClick: () => window.location.href = '/api/login'
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                description: "Premium support from our expert team, available around the clock to assist with your trading needs.",
                color: "text-red-400",
                onClick: () => window.open('https://wa.link/jtjivz', '_blank')
              }
            ].map((feature, index) => (
              <Card key={index} className="premium-card text-center cursor-pointer hover:scale-105 transition-transform" data-testid={`feature-${feature.title.toLowerCase().replace(/\s+/g, '-')}`} onClick={feature.onClick}>
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <feature.icon className={`${feature.color} h-8 w-8`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Join on Android - Right Side */}
      <section className="py-12 bg-muted/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-end items-center gap-6">
            <a 
              href="https://partner.bybit.com/b/119776"
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer group"
              data-testid="join-android-link"
            >
              <div className="flex items-center gap-6 bg-black p-6 rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Join on Android</h3>
                  <img 
                    src={qrCode}
                    alt="QR Code to join"
                    className="w-[150px] h-[150px] mx-auto"
                  />
                </div>
                <div className="w-[320px] rounded-3xl shadow-2xl overflow-hidden">
                  <img 
                    src={mobileBtcChart}
                    alt="Bybit Mobile Trading on Android"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-muted/10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold gradient-text mb-6 antialiased" data-testid="contact-title">
            {t('contactUs')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8 antialiased" data-testid="contact-description">
            {t('getInTouch')}
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => window.open('https://wa.link/jtjivz', '_blank')}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg font-semibold transition-all transform hover:scale-105"
              data-testid="whatsapp-contact"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              {t('whatsappSupport')}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold gradient-text mb-6 antialiased" data-testid="cta-title">
            Ready to Elevate Your Trading?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto antialiased" data-testid="cta-description">
            Join thousands of successful traders using our premium platform. Start earning today with our AI-powered copy trading system and lucrative referral program.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleGetStarted} 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold transition-all transform hover:scale-105"
              data-testid="cta-start-trading"
            >
              {t('startTrading')} Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-border hover:border-primary text-foreground px-8 py-4 text-lg font-semibold"
              data-testid="cta-book-demo"
            >
              Book a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/10 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4 cursor-pointer" onClick={handleLogoClick}>
                <img 
                  src={alvaCapitalLogo} 
                  alt="AlvaCapital Logo" 
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-serif font-bold gradient-text">AlvaCapital</span>
              </div>
              <p className="text-muted-foreground mb-4">Premium trading platform for professional investors and traders worldwide.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-twitter">
                  <i className="fab fa-twitter text-xl"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-linkedin">
                  <i className="fab fa-linkedin text-xl"></i>
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-telegram">
                  <i className="fab fa-telegram text-xl"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Trading</h4>
              <ul className="space-y-2">
                <li><a href="https://finestel.com/app/copy-trading/U42AN0-S37396" target="_blank" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-bybit">Bybit Trading</a></li>
                <li><a href="/api/login" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-copy-trading">Copy Trading</a></li>
                <li><a href="/api/login" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-portfolio">Portfolio Management</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/faq" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-help">Help Center</a></li>
                <li><a href="https://wa.link/jtjivz" target="_blank" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-contact">Contact</a></li>
                <li><a href="https://t.me/profitmaxingsignals" target="_blank" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-community">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-privacy">Privacy</a></li>
                <li><a href="/terms" className="text-muted-foreground hover:text-primary transition-colors" data-testid="footer-terms">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p data-testid="footer-copyright">&copy; 2025 AlvaCapital. All rights reserved. | Trading involves risk and may not be suitable for all investors.</p>
          </div>
        </div>
      </footer>

      {/* Bybit Integration Popup */}
      <Dialog open={multiBrokerOpen} onOpenChange={setMultiBrokerOpen}>
        <DialogContent className="max-w-md" data-testid="multi-broker-dialog">
          <DialogHeader>
            <DialogTitle>Bybit Integration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-6">
              Connect your Bybit trading account and start copy trading with our master strategies. Trade Forex, Indices, Commodities, Stocks, and Cryptocurrencies.
            </p>
            
            {/* Bybit */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div>
                <h4 className="font-semibold text-blue-600 dark:text-blue-400">Bybit</h4>
                <p className="text-sm text-muted-foreground">Forex, Indices, Commodities, Stocks, Crypto Spot & Futures</p>
              </div>
              <Button 
                onClick={() => handleStartTrading('bybit')}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="start-trading-bybit"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Start Trading
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Copy Trading Popup */}
      <Dialog open={copyTradingOpen} onOpenChange={setCopyTradingOpen}>
        <DialogContent data-testid="copy-trading-dialog">
          <DialogHeader>
            <DialogTitle>AI Copy Trading</DialogTitle>
          </DialogHeader>
          <TradingAccountForm onSuccess={() => setCopyTradingOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
