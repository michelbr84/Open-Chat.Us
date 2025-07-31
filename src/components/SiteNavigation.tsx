import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, FileText, Mail, MessageCircle, Shield } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SiteNavigationProps {
  variant?: 'header' | 'compact';
}

export const SiteNavigation: React.FC<SiteNavigationProps> = ({ variant = 'header' }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/chat', label: 'Chat', icon: MessageCircle },
    { path: '/security-checker', label: 'Security Checker', icon: Shield },
    { path: '/docs', label: 'Documentation', icon: FileText },
    { path: '/contact', label: 'Contact', icon: Mail },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  if (variant === 'compact') {
    return (
      <nav className="flex flex-wrap gap-2 justify-center">
        {navItems.map((item) => (
          <Button
            key={item.path}
            asChild
            variant={isActive(item.path) ? 'default' : 'ghost'}
            size="sm"
          >
            <Link to={item.path} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          </Button>
        ))}
      </nav>
    );
  }

  return (
    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">OpenChat</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant={isActive(item.path) ? 'default' : 'ghost'}
                size="sm"
              >
                <Link to={item.path} className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          {/* Mobile navigation */}
          <nav className="flex md:hidden items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.path}
                asChild
                variant={isActive(item.path) ? 'default' : 'ghost'}
                size="sm"
              >
                <Link to={item.path} className="p-2">
                  <item.icon className="w-4 h-4" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};