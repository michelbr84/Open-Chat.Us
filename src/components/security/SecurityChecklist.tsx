import { SecurityCheck } from "@/pages/GitHubSecurityChecker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface SecurityChecklistProps {
  checks: SecurityCheck[];
}

export const SecurityChecklist = ({ checks }: SecurityChecklistProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: SecurityCheck['severity']) => {
    const variants = {
      low: "secondary",
      medium: "outline",
      high: "destructive",
      critical: "destructive"
    } as const;

    return (
      <Badge variant={variants[severity]} className="text-xs">
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const toggleExpanded = (checkId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(checkId)) {
      newExpanded.delete(checkId);
    } else {
      newExpanded.add(checkId);
    }
    setExpandedItems(newExpanded);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The solution has been copied to your clipboard.",
    });
  };

  const groupedChecks = checks.reduce((acc, check) => {
    const category = check.id.split('_')[0];
    if (!acc[category]) acc[category] = [];
    acc[category].push(check);
    return acc;
  }, {} as Record<string, SecurityCheck[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="capitalize">{category.replace('_', ' ')} Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryChecks.map((check) => (
                <div key={check.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(check.status)}
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{check.name}</h4>
                          {getSeverityBadge(check.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {check.description}
                        </p>
                        <p className="text-sm">{check.message}</p>
                      </div>
                    </div>
                    {(check.solution || check.learnMore) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(check.id)}
                      >
                        {expandedItems.has(check.id) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>

                  {expandedItems.has(check.id) && (check.solution || check.learnMore) && (
                    <div className="border-t pt-3 space-y-3">
                      {check.solution && (
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Solution:</h5>
                          <div className="bg-muted/50 p-3 rounded text-sm">
                            <pre className="whitespace-pre-wrap">{check.solution}</pre>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(check.solution!)}
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Copy Solution
                          </Button>
                        </div>
                      )}
                      {check.learnMore && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={check.learnMore} target="_blank" rel="noopener noreferrer">
                            Learn More
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};