import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, Shield, Zap, Heart, Github } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            Open Source & Privacy First
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to OpenChat
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A modern, real-time community chat platform with private messaging, 
            multi-theme UI, and crypto donation support. Built for transparency and user privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/chat">
                <MessageCircle className="mr-2 h-5 w-5" />
                Start Chatting
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/docs">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose OpenChat?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the future of community communication with our feature-rich platform
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Real-Time Chat</CardTitle>
              <CardDescription>
                Instant messaging with real-time updates, emoji reactions, and threaded conversations
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Community Features</CardTitle>
              <CardDescription>
                User presence indicators, achievements system, leaderboards, and reputation tracking
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>
                End-to-end encryption, guest mode, content moderation, and transparent data practices
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Advanced Features</CardTitle>
              <CardDescription>
                File sharing, private messaging, slash commands, mentions, and message bookmarks
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Support the Project</CardTitle>
              <CardDescription>
                Optional crypto donations to support development and server costs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Github className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Open Source</CardTitle>
              <CardDescription>
                Fully transparent codebase, community-driven development, and MIT licensed
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Join the Community?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users already chatting on OpenChat. No registration required - 
            start as a guest or create an account for the full experience.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/chat">
              <MessageCircle className="mr-2 h-5 w-5" />
              Enter Chat Room
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;