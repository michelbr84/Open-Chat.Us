import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowLeft, Github, Heart, Users, Shield, Code, Zap } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SiteNavigation } from "@/components/SiteNavigation";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                Open Source & Community Driven
              </Badge>
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                About OpenChat
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Building the future of community communication with transparency, privacy, and user empowerment at the core.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To create an open, inclusive, and secure platform where communities can thrive. We believe in transparent communication tools that respect user privacy while fostering meaningful connections.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Our Values</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  <li>• Privacy and security first</li>
                  <li>• Open source transparency</li>
                  <li>• Community-driven development</li>
                  <li>• Accessibility for everyone</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-6 w-6" />
                The Story Behind OpenChat
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                OpenChat was born from a simple idea: what if we could create a chat platform that truly belongs to its users? In an era where many communication platforms prioritize profit over privacy, we wanted to build something different.
              </p>
              <p>
                Our journey began with a commitment to open source development and user empowerment. Every line of code is transparent, every feature is built with community input, and every decision prioritizes user needs over corporate interests.
              </p>
              <p>
                We believe that great software should be accessible to everyone, which is why OpenChat is free to use with optional donations to support development. Our MIT license ensures that the code remains open and available for anyone to learn from, modify, or contribute to.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="text-center">
                <Zap className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle>Innovation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Cutting-edge features like real-time collaboration, smart moderation, and seamless user experience.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle>Security</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Enterprise-grade security with end-to-end encryption, secure authentication, and privacy-first design.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground">
                  Built by the community, for the community. Your feedback and contributions shape our roadmap.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-6 w-6" />
                Technology Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                OpenChat is built with modern, reliable technologies that ensure performance, security, and scalability:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Frontend</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• React with TypeScript</li>
                    <li>• Tailwind CSS for styling</li>
                    <li>• Real-time WebSocket connections</li>
                    <li>• Progressive Web App features</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Backend</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Supabase for database & auth</li>
                    <li>• PostgreSQL with RLS</li>
                    <li>• Edge functions for processing</li>
                    <li>• Comprehensive security measures</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-6 w-6" />
                Get Involved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                OpenChat thrives because of our amazing community. Here's how you can contribute:
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">For Developers</h4>
                  <p className="text-muted-foreground mb-2">
                    Contribute code, report bugs, or suggest features on our GitHub repository.
                  </p>
                  <Button asChild variant="outline">
                    <a href="https://github.com/openchat-us" target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      View on GitHub
                    </a>
                  </Button>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">For Users</h4>
                  <p className="text-muted-foreground mb-2">
                    Share feedback, report issues, or help moderate the community.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/contact">
                      Contact Us
                    </Link>
                  </Button>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Support the Project</h4>
                  <p className="text-muted-foreground mb-2">
                    Help cover server costs and development time with an optional donation.
                  </p>
                  <Button asChild>
                    <Link to="/chat">
                      <Heart className="mr-2 h-4 w-4" />
                      Join & Donate
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Experience OpenChat?</h2>
            <p className="text-muted-foreground mb-6">
              Join our growing community and see what makes OpenChat special.
            </p>
            <Button asChild size="lg">
              <Link to="/chat">
                Start Chatting Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default About;