import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteNavigation } from "@/components/SiteNavigation";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
                <p>
                  Welcome to OpenChat ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, process, and protect your information when you use our chat platform.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                
                <h3 className="text-xl font-medium mb-3">Account Information</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Email address (when you create an account)</li>
                  <li>Username and display name</li>
                  <li>Profile information you choose to provide</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Chat Data</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Messages you send in public chat rooms</li>
                  <li>Private messages (encrypted and only accessible to participants)</li>
                  <li>Reactions, mentions, and interactions with other users</li>
                  <li>Files and media you share (stored securely)</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Usage Information</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Browser information and IP address</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Error logs and performance data</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Guest Users</h3>
                <p>
                  Guest users can participate without creating an account. We only store:
                  - Temporary session data
                  - Messages during the session
                  - No persistent personal information
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                <ul className="list-disc pl-6">
                  <li>Provide and maintain our chat services</li>
                  <li>Enable real-time communication features</li>
                  <li>Prevent spam and abuse</li>
                  <li>Improve our platform and user experience</li>
                  <li>Send important service notifications</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
                
                <h3 className="text-xl font-medium mb-3">Supabase (Database & Authentication)</h3>
                <p className="mb-4">
                  We use Supabase for secure data storage and user authentication. Your data is stored in compliance with GDPR and other privacy regulations. Supabase provides enterprise-grade security and encryption.
                </p>

                <h3 className="text-xl font-medium mb-3">Google OAuth</h3>
                <p className="mb-4">
                  When you sign in with Google, we only receive basic profile information (email, name) that you explicitly authorize. We do not access your Google account data beyond what's necessary for authentication.
                </p>

                <h3 className="text-xl font-medium mb-3">Analytics</h3>
                <p>
                  We use privacy-focused analytics to understand how our platform is used. We do not track individual users or collect personally identifiable information for analytics purposes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                <ul className="list-disc pl-6">
                  <li>All data transmission is encrypted using HTTPS/TLS</li>
                  <li>Private messages are encrypted end-to-end</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Secure server infrastructure with monitoring</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                <p className="mb-4">You have the right to:</p>
                <ul className="list-disc pl-6">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Delete your account and associated data</li>
                  <li>Export your data</li>
                  <li>Opt out of non-essential communications</li>
                  <li>Object to data processing for marketing purposes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
                <p className="mb-4">
                  We retain your data only as long as necessary to provide our services:
                </p>
                <ul className="list-disc pl-6">
                  <li>Account data: Until you delete your account</li>
                  <li>Chat messages: Retained for service functionality</li>
                  <li>Guest sessions: Automatically cleared after inactivity</li>
                  <li>Logs and analytics: Typically 90 days or less</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
                <p>
                  Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
                <p>
                  Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
                <p>
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Continued use of our service after changes indicates acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                <p className="mb-4">
                  If you have any questions about this privacy policy or our data practices, please contact us:
                </p>
                <ul className="list-disc pl-6">
                  <li>Email: <a href="mailto:hello.openchat@gmail.com" className="text-primary hover:underline">hello.openchat@gmail.com</a></li>
                  <li>Contact form: <Link to="/contact" className="text-primary hover:underline">Contact Page</Link></li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;