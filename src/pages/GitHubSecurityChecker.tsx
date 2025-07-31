import { useState } from "react";
import { SiteNavigation } from "@/components/SiteNavigation";
import { Footer } from "@/components/Footer";
import { SecurityForm } from "@/components/security/SecurityForm";
import { SecurityResults } from "@/components/security/SecurityResults";
import { SecurityCard } from "@/components/security/SecurityCard";
import { SecurityEducation } from "@/components/security/SecurityEducation";

export interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  solution?: string;
  learnMore?: string;
}

export interface SecurityReport {
  repoUrl: string;
  timestamp: string;
  checks: SecurityCheck[];
  score: number;
  totalFiles: number;
  scannedFiles: number;
}

export const GitHubSecurityChecker = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (repoUrl: string) => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const response = await fetch('https://lbadeqrxsvhfuygxvyqf.supabase.co/functions/v1/github-security-analyzer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiYWRlcXJ4c3ZoZnV5Z3h2eXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MzA2MjAsImV4cCI6MjA2MTUwNjYyMH0.ShQ5USLX9Bl3OFtiOVboTpCcDMaP_dXLI8y53Z3Pnks`
        },
        body: JSON.stringify({ repoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze repository');
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation variant="header" />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">
              GitHub Security Checker
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Analyze your GitHub repositories for security vulnerabilities, 
              exposed secrets, and configuration issues. Get actionable recommendations 
              to improve your project's security posture.
            </p>
          </div>

          {/* Main Analysis Section */}
          <SecurityCard>
            <SecurityForm onAnalyze={handleAnalyze} loading={loading} />
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-destructive">{error}</p>
              </div>
            )}
            {report && <SecurityResults report={report} />}
          </SecurityCard>

          {/* Educational Content */}
          <SecurityEducation />
        </div>
      </main>

      <Footer />
    </div>
  );
};