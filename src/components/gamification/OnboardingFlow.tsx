import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Trophy, 
  Users, 
  Heart, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Gift
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  reward?: {
    type: 'reputation' | 'achievement';
    value: number;
    name?: string;
  };
}

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingFlow = ({ isOpen, onClose, onComplete }: OnboardingFlowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [totalPoints, setTotalPoints] = useState(0);

  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to OpenChat!',
      description: 'Your journey to becoming a valued community member starts here. Let\'s explore what makes our platform special.',
      icon: <Trophy className="w-6 h-6 text-primary" />,
      reward: { type: 'reputation', value: 10 }
    },
    {
      id: 'first_message',
      title: 'Send Your First Message',
      description: 'Join the conversation! Share your thoughts and connect with the community.',
      icon: <MessageCircle className="w-6 h-6 text-blue-600" />,
      action: 'Send a message in the main chat',
      reward: { type: 'achievement', value: 25, name: 'First Words' }
    },
    {
      id: 'react_message',
      title: 'React to a Message',
      description: 'Show appreciation for great content by adding reactions to messages you like.',
      icon: <Heart className="w-6 h-6 text-red-600" />,
      action: 'Add a reaction to any message',
      reward: { type: 'reputation', value: 5 }
    },
    {
      id: 'explore_users',
      title: 'Explore the Community',
      description: 'Check out who\'s online and consider following interesting conversations.',
      icon: <Users className="w-6 h-6 text-green-600" />,
      action: 'View the user list and online members',
      reward: { type: 'reputation', value: 5 }
    },
    {
      id: 'achievements',
      title: 'Discover Achievements',
      description: 'Explore the achievements system to see what goals you can work towards.',
      icon: <Star className="w-6 h-6 text-yellow-600" />,
      action: 'Visit the achievements page',
      reward: { type: 'reputation', value: 10 }
    }
  ];

  const currentStepData = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const handleStepComplete = () => {
    const step = currentStepData;
    const newCompleted = new Set([...completedSteps, step.id]);
    setCompletedSteps(newCompleted);

    // Award reward
    if (step.reward) {
      setTotalPoints(prev => prev + step.reward!.value);
      
      if (step.reward.type === 'achievement' && step.reward.name) {
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${step.reward.name} - ${step.reward.value} points`,
        });
      } else {
        toast({
          title: "Points Earned!",
          description: `+${step.reward.value} reputation points`,
        });
      }
    }

    // Move to next step or complete
    if (currentStep < onboardingSteps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 1000);
    } else {
      setTimeout(() => {
        toast({
          title: "🎉 Onboarding Complete!",
          description: `Welcome to the community! You earned ${totalPoints + (step.reward?.value || 0)} total points.`,
        });
        onComplete();
      }, 1500);
    }
  };

  const handleSkip = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const isStepCompleted = completedSteps.has(currentStepData.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Getting Started ({currentStep + 1}/{onboardingSteps.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          <Card className={`border-2 ${isStepCompleted ? 'border-green-500 bg-green-50' : 'border-primary'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isStepCompleted ? 'bg-green-100' : 'bg-primary/10'}`}>
                  {isStepCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    currentStepData.icon
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{currentStepData.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {currentStepData.description}
                  </p>
                  
                  {currentStepData.action && !isStepCompleted && (
                    <Badge variant="outline" className="text-xs">
                      {currentStepData.action}
                    </Badge>
                  )}
                  
                  {currentStepData.reward && (
                    <div className="flex items-center gap-1 mt-2">
                      <Gift className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary">
                        +{currentStepData.reward.value} {currentStepData.reward.type === 'achievement' ? 'achievement' : 'points'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Points Earned */}
          {totalPoints > 0 && (
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-lg font-bold text-primary">{totalPoints}</div>
              <div className="text-xs text-muted-foreground">Total Points Earned</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1"
            >
              {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Skip'}
            </Button>
            
            {!isStepCompleted ? (
              <Button
                onClick={handleStepComplete}
                className="flex-1"
              >
                {currentStepData.action ? 'Mark Complete' : 'Continue'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentStep(Math.min(currentStep + 1, onboardingSteps.length - 1))}
                className="flex-1"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Quick Tips */}
          <div className="text-center text-xs text-muted-foreground">
            💡 Tip: Complete actions to earn maximum rewards!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};