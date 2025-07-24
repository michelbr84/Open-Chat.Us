import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AgeGateProps {
  onConfirm: () => void;
}

export const AgeGate = ({ onConfirm }: AgeGateProps) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleEnter = () => {
    if (confirmed) {
      localStorage.setItem('ageVerified', 'true');
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md neon-bg neon-border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold neon-glow">
            Age Verification
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Please confirm that you are 18 years of age or older to enter OpenChat.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="age-confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked as boolean)}
            />
            <label
              htmlFor="age-confirm"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I am 18 years or older
            </label>
          </div>
          <Button
            onClick={handleEnter}
            disabled={!confirmed}
            className="w-full"
            size="lg"
          >
            Enter Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};