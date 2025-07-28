import { Heart, Github, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand & Copyright */}
          <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-primary">OpenChat</span>
              <Heart className="w-4 h-4 text-red-500" aria-hidden="true" />
            </div>
            <span className="hidden md:inline">•</span>
            <span>© 2025 Open source and privacy-first</span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <Link 
              to="/about" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="About OpenChat"
            >
              About
            </Link>
            <Link 
              to="/privacy" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Privacy Policy"
            >
              Privacy
            </Link>
            <Link 
              to="/terms" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Terms of Service"
            >
              Terms
            </Link>
            <Link 
              to="/contact" 
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Contact and support"
            >
              Contact
            </Link>
            <a 
              href="https://github.com/michelbr84/neon-chat-pulse" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              aria-label="View source code on GitHub"
            >
              <Github className="w-4 h-4" aria-hidden="true" />
              GitHub
            </a>
            <a 
              href="mailto:hello.openchat@gmail.com" 
              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              aria-label="Email support"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              Support
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            Built with ❤️ using React, TypeScript, Tailwind CSS, and Supabase
            <span className="mx-2">•</span>
            <a 
              href="https://github.com/michelbr84/neon-chat-pulse/blob/main/LICENSE" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors"
              aria-label="View MIT license"
            >
              MIT License
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};