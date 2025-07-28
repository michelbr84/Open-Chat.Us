import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, MessageCircle, Github, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim()
        }
      });

      if (error) {
        throw error;
      }

      // Success - show confirmation
      setIsSubmitted(true);
      
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

      toast({
        title: "Message sent successfully!",
        description: "Thanks! Your message has been sent.",
      });

      // Optional redirect to thank you page after a delay
      setTimeout(() => {
        window.location.href = '/thank-you';
      }, 2000);

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly at hello@open-chat.us",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-chat-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 neon-glow">Contact & Support</h1>
          <p className="text-lg text-muted-foreground">
            Get in touch with the OpenChat team for support, feedback, or collaboration
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="neon-border neon-bg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send us a Message
              </CardTitle>
              <CardDescription>
                Fill out the form below and we'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Thanks! Your message has been sent.</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We'll get back to you as soon as possible.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Redirecting to thank you page...
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Input
                        name="name"
                        placeholder="Full Name *"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        aria-label="Full Name"
                      />
                    </div>
                    <div>
                      <Input
                        name="email"
                        type="email"
                        placeholder="Email Address *"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        aria-label="Email Address"
                      />
                    </div>
                    <div>
                      <Textarea
                        name="message"
                        placeholder="Your message... *"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={isSubmitting}
                        rows={6}
                        aria-label="Your message"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="neon-border neon-bg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Quick Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Email Support</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    For technical issues, feature requests, or general inquiries
                  </p>
                  <a 
                    href="mailto:support@open-chat.us" 
                    className="text-primary hover:underline"
                    aria-label="Email support"
                  >
                    support@open-chat.us
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Community Chat</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Join the conversation and get help from the community
                  </p>
                  <a 
                    href="/" 
                    className="text-primary hover:underline"
                    aria-label="Join community chat"
                  >
                    Join the chat →
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="neon-border neon-bg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  Open Source
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">GitHub Repository</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Contribute to the project, report issues, or request features
                  </p>
                  <a 
                    href="https://github.com/michelbr84/neon-chat-pulse" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                    aria-label="View GitHub repository"
                  >
                    View on GitHub <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Documentation</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Setup guides, API docs, and contribution guidelines
                  </p>
                  <a 
                    href="https://github.com/michelbr84/neon-chat-pulse#readme" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                    aria-label="View documentation"
                  >
                    Read the docs <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="neon-border neon-bg">
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We typically respond to support emails within 24-48 hours. 
                  For urgent issues, please mention "URGENT" in your subject line.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 OpenChat. Open source and privacy-first.
            </div>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-primary hover:underline">
                Back to Chat
              </a>
              <a 
                href="https://github.com/michelbr84/neon-chat-pulse/blob/main/LICENSE" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                MIT License
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Contact;