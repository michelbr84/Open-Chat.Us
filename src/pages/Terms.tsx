import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button asChild variant="ghost" className="mb-4">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
                <p>
                  By accessing and using OpenChat ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Use License</h2>
                <p className="mb-4">
                  Permission is granted to temporarily use OpenChat for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose or for any public display</li>
                  <li>Attempt to reverse engineer any software contained on the website</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">User Accounts</h2>
                
                <h3 className="text-xl font-medium mb-3">Account Creation</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>You may use the service as a guest or create an account</li>
                  <li>Account information must be accurate and up to date</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>One person may not maintain multiple accounts</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Account Termination</h3>
                <p>
                  We reserve the right to terminate accounts that violate these terms or engage in harmful behavior. You may delete your account at any time through your profile settings.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Acceptable Use</h2>
                
                <h3 className="text-xl font-medium mb-3">Permitted Uses</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Respectful communication and community participation</li>
                  <li>Sharing appropriate content and files</li>
                  <li>Using features as intended</li>
                  <li>Reporting violations of these terms</li>
                </ul>

                <h3 className="text-xl font-medium mb-3">Prohibited Uses</h3>
                <ul className="list-disc pl-6">
                  <li>Harassment, hate speech, or discriminatory content</li>
                  <li>Spam, advertising, or commercial solicitation</li>
                  <li>Sharing illegal, harmful, or inappropriate content</li>
                  <li>Attempting to hack, exploit, or damage the service</li>
                  <li>Impersonating others or providing false information</li>
                  <li>Violating others' privacy or intellectual property rights</li>
                  <li>Distributing malware or malicious code</li>
                  <li>Using automated tools to access the service</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Content and Conduct</h2>
                
                <h3 className="text-xl font-medium mb-3">User-Generated Content</h3>
                <p className="mb-4">
                  You retain ownership of content you create, but grant us a license to use, display, and distribute it as necessary to provide the service. You are responsible for ensuring you have the right to share any content you post.
                </p>

                <h3 className="text-xl font-medium mb-3">Content Moderation</h3>
                <p className="mb-4">
                  We reserve the right to remove content that violates these terms. We use both automated systems and human moderation to maintain a safe environment. Repeated violations may result in account suspension or termination.
                </p>

                <h3 className="text-xl font-medium mb-3">Community Guidelines</h3>
                <ul className="list-disc pl-6">
                  <li>Be respectful and kind to other users</li>
                  <li>Keep conversations appropriate for all audiences</li>
                  <li>Respect different viewpoints and backgrounds</li>
                  <li>Help maintain a welcoming community atmosphere</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Privacy and Data</h2>
                <p>
                  Your privacy is important to us. Please review our <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> to understand how we collect, use, and protect your information. By using our service, you agree to our data practices as described in the Privacy Policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
                <p className="mb-4">
                  The service and its original content, features, and functionality are owned by OpenChat and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p>
                  Our source code is available under the MIT License, allowing for open-source use and modification according to the license terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
                <p className="mb-4">
                  We strive to maintain high service availability but cannot guarantee uninterrupted access. We may:
                </p>
                <ul className="list-disc pl-6">
                  <li>Perform maintenance that temporarily affects service</li>
                  <li>Update or modify features with reasonable notice</li>
                  <li>Suspend service for security or legal reasons</li>
                  <li>Discontinue the service with advance notice</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Disclaimers</h2>
                <p className="mb-4">
                  The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company:
                </p>
                <ul className="list-disc pl-6">
                  <li>Excludes all representations and warranties relating to this website and its contents</li>
                  <li>Excludes all liability for damages arising out of or in connection with your use of this website</li>
                  <li>Does not guarantee the accuracy, completeness, or timeliness of information</li>
                  <li>Cannot ensure complete security of communications</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
                <p>
                  In no event shall OpenChat or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the service, even if OpenChat or its authorized representative has been notified orally or in writing of the possibility of such damage.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Donations and Payments</h2>
                <p className="mb-4">
                  OpenChat is free to use. Optional cryptocurrency donations are accepted to support development and server costs. Donations are:
                </p>
                <ul className="list-disc pl-6">
                  <li>Voluntary and non-refundable</li>
                  <li>Not required for service access</li>
                  <li>Used solely for project maintenance and development</li>
                  <li>Subject to applicable tax laws in your jurisdiction</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of the United States and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
                <p>
                  We reserve the right to revise these terms of service at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Severability</h2>
                <p>
                  If any provision of these terms is found to be invalid or unenforceable, the remaining provisions will remain in full force and effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please contact us:
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

export default Terms;