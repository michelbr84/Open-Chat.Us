import { SecurityReport } from "@/pages/GitHubSecurityChecker";
import { SecurityChecklist } from "./SecurityChecklist";
import { SecuritySummary } from "./SecuritySummary";
import { SecurityActions } from "./SecurityActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SecurityResultsProps {
  report: SecurityReport;
}

export const SecurityResults = ({ report }: SecurityResultsProps) => {
  return (
    <div className="mt-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Security Analysis Results
            <span className="text-sm font-normal text-muted-foreground">
              {new Date(report.timestamp).toLocaleString()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SecuritySummary report={report} />
        </CardContent>
      </Card>

      <SecurityChecklist checks={report.checks} />
      
      <SecurityActions report={report} />
    </div>
  );
};