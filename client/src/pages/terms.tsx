import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSelector } from "@/components/LanguageSelector";
import alvaCapitalLogo from "@assets/image_1759129583507.png";

export default function Terms() {
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

      {/* Terms of Service Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>

        <Card className="bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm">
          <CardContent className="p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using AlvaCapital's platform and services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Description of Services</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                AlvaCapital provides a multi-account trading platform that offers:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Integration with multiple broker platforms (Exness, Bybit, Binance)</li>
                <li>AI-powered copy trading services</li>
                <li>Portfolio management and analytics</li>
                <li>Referral program and commission earning opportunities</li>
                <li>Real-time trading performance tracking</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                By using our platform, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide accurate and complete information during registration</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Use the platform only for lawful purposes</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not engage in any fraudulent or manipulative trading activities</li>
                <li>Be responsible for all trading decisions and their consequences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Trading Risks</h2>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
                <p className="text-destructive font-medium">⚠️ IMPORTANT RISK DISCLOSURE</p>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Trading financial instruments involves substantial risk and may not be suitable for all investors. You may lose some or all of your invested capital. Important considerations:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Past performance does not guarantee future results</li>
                <li>Copy trading involves additional risks beyond traditional trading</li>
                <li>Leverage can amplify both profits and losses</li>
                <li>Market volatility can result in rapid changes to account values</li>
                <li>Technical failures may affect trading execution</li>
                <li>You should only invest money you can afford to lose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Copy Trading Terms</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our copy trading service operates under the following terms:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Copy trading mirrors strategies but doesn't guarantee identical results</li>
                <li>Execution delays may occur due to technical or market conditions</li>
                <li>You can start or stop copy trading at any time</li>
                <li>Risk parameters and position sizing are your responsibility</li>
                <li>Master trader performance is for reference only</li>
                <li>We are not liable for master trader decisions or outcomes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Fees and Payments</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                AlvaCapital operates on a performance-based fee structure:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Performance fees are charged only on profitable trading periods</li>
                <li>Referral commissions are calculated based on referred user activity</li>
                <li>All fees are clearly disclosed before service activation</li>
                <li>Fee structures may change with 30 days notice</li>
                <li>Broker fees and spreads are separate from our charges</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Account Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You are responsible for maintaining account security:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Use strong, unique passwords for your account</li>
                <li>Enable two-factor authentication when available</li>
                <li>Do not share your login credentials with others</li>
                <li>Report any unauthorized access immediately</li>
                <li>Keep your API keys secure and monitor their usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>We are not liable for trading losses or missed opportunities</li>
                <li>Our liability is limited to the fees you have paid to us</li>
                <li>We disclaim warranties regarding trading outcomes</li>
                <li>Force majeure events may affect service availability</li>
                <li>Third-party broker issues are beyond our control</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                Either party may terminate this agreement at any time. Upon termination, you must disconnect all trading accounts and cease using our services. We reserve the right to suspend accounts for violations of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by applicable financial regulations and laws. Any disputes will be resolved through binding arbitration or appropriate legal proceedings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these terms at any time. Material changes will be communicated through our platform or via email. Continued use of our services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p>Email: legal@alvacapital.com</p>
                <p>WhatsApp: <a href="https://wa.link/jtjivz" target="_blank" className="text-primary hover:underline">Contact Support</a></p>
                <p>Telegram: <a href="https://t.me/profitmaxingsignals" target="_blank" className="text-primary hover:underline">Join Community</a></p>
              </div>
            </section>

            <div className="bg-muted/10 rounded-lg p-4 mt-8">
              <p className="text-sm text-muted-foreground text-center">
                By using AlvaCapital's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}