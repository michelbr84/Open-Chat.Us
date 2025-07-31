import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Github, Loader2 } from "lucide-react";

interface SecurityFormProps {
  onAnalyze: (repoUrl: string) => void;
  loading: boolean;
}

export const SecurityForm = ({ onAnalyze, loading }: SecurityFormProps) => {
  const [repoUrl, setRepoUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      onAnalyze(repoUrl.trim());
    }
  };

  const isValidGitHubUrl = (url: string) => {
    const githubPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubPattern.test(url);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Repository Security Analysis
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter a GitHub repository URL to scan for security issues
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="repo-url">GitHub Repository URL</Label>
        <div className="relative">
          <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="repo-url"
            type="url"
            placeholder="https://github.com/username/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        {repoUrl && !isValidGitHubUrl(repoUrl) && (
          <p className="text-sm text-destructive">
            Please enter a valid GitHub repository URL
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={loading || !repoUrl || !isValidGitHubUrl(repoUrl)}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing Repository...
          </>
        ) : (
          <>
            <Shield className="mr-2 h-4 w-4" />
            Analyze Security
          </>
        )}
      </Button>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• This tool analyzes public repositories only</p>
        <p>• No sensitive data is stored or transmitted</p>
        <p>• Analysis includes file scanning and configuration checks</p>
      </div>
    </form>
  );
};