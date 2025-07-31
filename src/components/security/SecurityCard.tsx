import { Card, CardContent } from "@/components/ui/card";

interface SecurityCardProps {
  children: React.ReactNode;
}

export const SecurityCard = ({ children }: SecurityCardProps) => {
  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
};