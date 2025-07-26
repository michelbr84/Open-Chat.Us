import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HelpButton: React.FC = () => {
  return (
    <Link to="/docs">
      <Button 
        variant="ghost" 
        size="sm"
        className="text-muted-foreground hover:text-foreground"
        title="View documentation and help"
      >
        <HelpCircle className="w-4 h-4 mr-2" />
        Help
      </Button>
    </Link>
  );
};