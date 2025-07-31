import { SecurityReport } from "@/pages/GitHubSecurityChecker";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react";

interface SecuritySummaryProps {
  report: SecurityReport;
}

export const SecuritySummary = ({ report }: SecuritySummaryProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Attention";
  };

  const statusCounts = report.checks.reduce(
    (acc, check) => {
      acc[check.status]++;
      return acc;
    },
    { pass: 0, warning: 0, error: 0, info: 0 }
  );

  const severityCounts = report.checks
    .filter(check => check.status !== 'pass')
    .reduce(
      (acc, check) => {
        acc[check.severity]++;
        return acc;
      },
      { low: 0, medium: 0, high: 0, critical: 0 }
    );

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h3 className="text-2xl font-bold">Security Score</h3>
            <p className="text-sm text-muted-foreground">
              Based on {report.checks.length} security checks
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className={`text-4xl font-bold ${getScoreColor(report.score)}`}>
              {report.score}
            </span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <Progress value={report.score} className="h-3" />
          <p className={`font-medium ${getScoreColor(report.score)}`}>
            {getScoreText(report.score)}
          </p>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{statusCounts.pass}</p>
            <p className="text-sm text-muted-foreground">Passed</p>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.warning}</p>
            <p className="text-sm text-muted-foreground">Warnings</p>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">{statusCounts.error}</p>
            <p className="text-sm text-muted-foreground">Issues</p>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Info className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{statusCounts.info}</p>
            <p className="text-sm text-muted-foreground">Info</p>
          </div>
        </div>
      </div>

      {/* Severity Breakdown */}
      {Object.values(severityCounts).some(count => count > 0) && (
        <div className="space-y-3">
          <h4 className="font-semibold">Issues by Severity</h4>
          <div className="flex flex-wrap gap-2">
            {severityCounts.critical > 0 && (
              <Badge variant="destructive">
                {severityCounts.critical} Critical
              </Badge>
            )}
            {severityCounts.high > 0 && (
              <Badge variant="destructive">
                {severityCounts.high} High
              </Badge>
            )}
            {severityCounts.medium > 0 && (
              <Badge variant="outline">
                {severityCounts.medium} Medium
              </Badge>
            )}
            {severityCounts.low > 0 && (
              <Badge variant="secondary">
                {severityCounts.low} Low
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Repository Info */}
      <div className="border-t pt-4 space-y-2">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Repository:</span>
            <p className="font-mono text-xs break-all">{report.repoUrl}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Files Scanned:</span>
            <p>{report.scannedFiles} of {report.totalFiles}</p>
          </div>
        </div>
      </div>
    </div>
  );
};