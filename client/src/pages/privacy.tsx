import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import alvaCapitalLogo from "@assets/image_1759129583507.png";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-md border-b border-cyan-500/30 relative sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center space-x-2">
              <img 
                src={alvaCapitalLogo} 
                alt="AlvaCapital Logo" 
                className="w-10 h-10 object-contain"
                data-testid="logo-image"
              />
              <span className="text-xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">AlvaCapital</span>
            </a>
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <ThemeToggle />
              <a 
                href="/api/login"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-mono font-bold px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Privacy Policy Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                AlvaCapital ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our multi-account trading platform and related services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We collect personal information you provide directly to us, including:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Name, email address, and contact information</li>
                    <li>Trading account credentials and API keys</li>
                    <li>Financial information related to your trading activities</li>
                    <li>Identity verification documents</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Automatically Collected Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We automatically collect certain information when you use our platform:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                    <li>Device information and browser type</li>
                    <li>IP address and location data</li>
                    <li>Usage patterns and platform interactions</li>
                    <li>Trading performance and analytics data</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide and maintain our trading platform services</li>
                <li>Execute copy trading and portfolio management functions</li>
                <li>Process referral commissions and payments</li>
                <li>Communicate with you about your account and services</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Improve our platform and develop new features</li>
                <li>Prevent fraud and ensure platform security</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Information Sharing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell or rent your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>With connected broker platforms to execute trades</li>
                <li>With service providers who assist in platform operations</li>
                <li>When required by law or to protect our legal rights</li>
                <li>In connection with a business transfer or acquisition</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement bank-level security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                <li>Military-grade encryption for data transmission and storage</li>
                <li>Secure API connections with broker platforms</li>
                <li>Multi-factor authentication and access controls</li>
                <li>Regular security audits and monitoring</li>
                <li>Compliance with industry security standards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Access and review your personal information</li>
                <li>Request corrections to inaccurate information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to certain processing activities</li>
                <li>Withdraw consent for data processing</li>
                <li>Data portability and transfer rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences. Some features may not function properly if cookies are disabled.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">International Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your residence. We ensure appropriate safeguards are in place to protect your information during international transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of significant changes through our platform or via email. Your continued use of our services after changes constitute acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: privacy@alvacapital.com</p>
                <p>WhatsApp: <a href="https://wa.link/jtjivz" target="_blank" className="text-primary hover:underline">Contact Support</a></p>
                <p>Telegram: <a href="https://t.me/profitmaxingsignals" target="_blank" className="text-primary hover:underline">Join Community</a></p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}