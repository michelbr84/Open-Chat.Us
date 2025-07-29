import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SiteNavigation } from '@/components/SiteNavigation';

const ThankYou = () => {
  useEffect(() => {
    // Google Ads conversion tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        send_to: 'AW-17395476760/form_submission',
        event_callback: () => {
          console.log('Contact form conversion tracked');
        }
      });
    }

    // Google Tag Manager event
    if (typeof dataLayer !== 'undefined') {
      dataLayer.push({
        event: 'form_submission',
        form_type: 'contact',
        timestamp: new Date().toISOString()
      });
    }

    // Set page title
    document.title = 'Thank You - OpenChat';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation />
      <div className="max-w-2xl mx-auto p-4">
        <div className="text-center mb-8 pt-16">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Thank You!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your message has been successfully sent
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Message Received</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div>
              <p className="text-muted-foreground mb-4">
                Thanks for reaching out! We've received your message and will get back to you 
                as soon as possible. Typically, we respond within 24-48 hours.
              </p>
              <p className="text-sm text-muted-foreground">
                A confirmation has been logged with our team.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="default">
                <Link to="/chat" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Join the Chat
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link to="/contact" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Contact
                </Link>
              </Button>
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="font-semibold mb-2">Need immediate help?</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Join our community chat for real-time support and discussions
              </p>
              <Button asChild variant="link" className="p-0">
                <Link to="/chat">
                  Go to OpenChat →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <div className="text-sm text-muted-foreground">
            © 2025 OpenChat. Open source and privacy-first.
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ThankYou;