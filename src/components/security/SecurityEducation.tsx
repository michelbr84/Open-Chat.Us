import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, AlertTriangle, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SecurityEducation = () => {
  const securityTips = [
    {
      icon: Shield,
      title: "Environment Variables",
      description: "Never commit API keys, passwords, or sensitive data to your repository.",
      tips: [
        "Use .env files and add them to .gitignore",
        "Use environment variables in production",
        "Rotate keys regularly"
      ]
    },
    {
      icon: Lock,
      title: "Access Control",
      description: "Implement proper authentication and authorization in your applications.",
      tips: [
        "Use HTTPS for all communications",
        "Implement proper session management",
        "Follow the principle of least privilege"
      ]
    },
    {
      icon: Eye,
      title: "Code Visibility",
      description: "Be mindful of what information is exposed in your public repositories.",
      tips: [
        "Review code before committing",
        "Remove debug information",
        "Sanitize configuration files"
      ]
    },
    {
      icon: AlertTriangle,
      title: "Dependency Security",
      description: "Keep your dependencies updated and scan for known vulnerabilities.",
      tips: [
        "Use tools like npm audit",
        "Update dependencies regularly",
        "Monitor security advisories"
      ]
    }
  ];

  const resources = [
    {
      title: "GitHub Security Best Practices",
      url: "https://docs.github.com/en/code-security",
      description: "Official GitHub security documentation"
    },
    {
      title: "OWASP Top 10",
      url: "https://owasp.org/Top10/",
      description: "Web application security risks"
    },
    {
      title: "Security.txt Standard",
      url: "https://securitytxt.org/",
      description: "Standard for security policy disclosure"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Security Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {securityTips.map((tip, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center gap-2">
                  <tip.icon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">{tip.title}</h4>
                </div>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
                <ul className="text-sm space-y-1">
                  {tip.tips.map((tipItem, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{tipItem}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {resources.map((resource, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-sm">{resource.title}</h4>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
                <Button variant="outline" size="sm" asChild>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    Learn More
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};