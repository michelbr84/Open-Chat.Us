import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContentFilter {
  id: string;
  filter_type: string;
  pattern: string;
  is_regex: boolean;
  severity: number;
  is_active: boolean;
}

interface ModerationResult {
  allowed: boolean;
  flagged: boolean;
  autoBlocked: boolean;
  violations: string[];
  confidenceScore: number;
}

export const useAutoModeration = () => {
  const [contentFilters, setContentFilters] = useState<ContentFilter[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load content filters from database
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const { data, error } = await supabase
          .from('content_filters')
          .select('*')
          .eq('is_active', true);

        if (error) throw error;
        setContentFilters(data || []);
      } catch (error) {
        console.error('Failed to load content filters:', error);
      }
    };

    loadFilters();
  }, []);

  // Auto-moderation scoring algorithms
  const checkProfanityFilter = useCallback((content: string, filters: ContentFilter[]): { violations: string[], score: number } => {
    const violations: string[] = [];
    let score = 0;

    const profanityFilters = filters.filter(f => f.filter_type === 'profanity');
    
    for (const filter of profanityFilters) {
      let match = false;
      
      if (filter.is_regex) {
        try {
          const regex = new RegExp(filter.pattern, 'gi');
          match = regex.test(content);
        } catch (e) {
          console.warn('Invalid regex pattern:', filter.pattern);
          continue;
        }
      } else {
        match = content.toLowerCase().includes(filter.pattern.toLowerCase());
      }

      if (match) {
        violations.push(`Profanity: ${filter.pattern}`);
        score += filter.severity * 20; // Severity 1=20, 2=40, 3=60
      }
    }

    return { violations, score };
  }, []);

  const checkSpamFilter = useCallback((content: string, filters: ContentFilter[]): { violations: string[], score: number } => {
    const violations: string[] = [];
    let score = 0;

    const spamFilters = filters.filter(f => f.filter_type === 'spam');
    
    // Basic spam indicators
    const repeatedChars = /(.)\1{4,}/gi; // 5+ repeated characters
    const excessiveCaps = content.length > 10 && (content.match(/[A-Z]/g)?.length || 0) / content.length > 0.6;
    const excessiveUrls = (content.match(/https?:\/\/\S+/gi) || []).length > 2;
    const repeatedWords = content.split(/\s+/).filter((word, index, arr) => 
      arr.slice(0, index).includes(word) && word.length > 3
    ).length > 2;

    if (repeatedChars.test(content)) {
      violations.push('Spam: Excessive repeated characters');
      score += 25;
    }

    if (excessiveCaps) {
      violations.push('Spam: Excessive capital letters');
      score += 20;
    }

    if (excessiveUrls) {
      violations.push('Spam: Multiple URLs');
      score += 30;
    }

    if (repeatedWords) {
      violations.push('Spam: Repeated words');
      score += 15;
    }

    // Check custom spam patterns
    for (const filter of spamFilters) {
      let match = false;
      
      if (filter.is_regex) {
        try {
          const regex = new RegExp(filter.pattern, 'gi');
          match = regex.test(content);
        } catch (e) {
          console.warn('Invalid regex pattern:', filter.pattern);
          continue;
        }
      } else {
        match = content.toLowerCase().includes(filter.pattern.toLowerCase());
      }

      if (match) {
        violations.push(`Spam pattern: ${filter.pattern}`);
        score += filter.severity * 15;
      }
    }

    return { violations, score };
  }, []);

  const checkKeywordFilter = useCallback((content: string, filters: ContentFilter[]): { violations: string[], score: number } => {
    const violations: string[] = [];
    let score = 0;

    const keywordFilters = filters.filter(f => f.filter_type === 'keyword');
    
    for (const filter of keywordFilters) {
      let match = false;
      
      if (filter.is_regex) {
        try {
          const regex = new RegExp(filter.pattern, 'gi');
          match = regex.test(content);
        } catch (e) {
          console.warn('Invalid regex pattern:', filter.pattern);
          continue;
        }
      } else {
        match = content.toLowerCase().includes(filter.pattern.toLowerCase());
      }

      if (match) {
        violations.push(`Keyword: ${filter.pattern}`);
        score += filter.severity * 10;
      }
    }

    return { violations, score };
  }, []);

  // Enhanced rate limiting check
  const checkRateLimit = useCallback(async (userId: string | null, messageLength: number): Promise<boolean> => {
    try {
      const userIdentifier = userId || 'anonymous';
      const timePeriod = 60; // 1 minute
      
      // Different limits for different user types
      const baseLimit = userId ? 20 : 10; // Authenticated users get higher limits
      const lengthMultiplier = messageLength > 200 ? 0.5 : 1; // Longer messages get stricter limits
      const adjustedLimit = Math.floor(baseLimit * lengthMultiplier);

      const { data, error } = await supabase.rpc('enhanced_rate_limit_check', {
        user_identifier: userIdentifier,
        action_type: 'message_post',
        max_actions: adjustedLimit,
        time_window_minutes: 1,
        strict_mode: !userId // Stricter for anonymous users
      });

      if (error) {
        console.error('Rate limit check failed:', error);
        return false; // Fail safe - deny if we can't check
      }

      return data;
    } catch (error) {
      console.error('Rate limit error:', error);
      return false;
    }
  }, []);

  // Main moderation function
  const moderateContent = useCallback(async (
    content: string, 
    userId: string | null,
    messageId?: string
  ): Promise<ModerationResult> => {
    setLoading(true);

    try {
      // Check rate limiting first
      const rateLimitPassed = await checkRateLimit(userId, content.length);
      
      if (!rateLimitPassed) {
        return {
          allowed: false,
          flagged: true,
          autoBlocked: true,
          violations: ['Rate limit exceeded'],
          confidenceScore: 100
        };
      }

      // Run content filters
      const profanityResult = checkProfanityFilter(content, contentFilters);
      const spamResult = checkSpamFilter(content, contentFilters);
      const keywordResult = checkKeywordFilter(content, contentFilters);

      const allViolations = [
        ...profanityResult.violations,
        ...spamResult.violations,
        ...keywordResult.violations
      ];

      const totalScore = profanityResult.score + spamResult.score + keywordResult.score;
      
      // Scoring thresholds
      const WARN_THRESHOLD = 30;
      const FLAG_THRESHOLD = 60;
      const BLOCK_THRESHOLD = 100;

      let allowed = true;
      let flagged = false;
      let autoBlocked = false;

      if (totalScore >= BLOCK_THRESHOLD) {
        allowed = false;
        autoBlocked = true;
        flagged = true;
      } else if (totalScore >= FLAG_THRESHOLD) {
        allowed = true; // Allow but flag for review
        flagged = true;
      } else if (totalScore >= WARN_THRESHOLD) {
        allowed = true;
        // Could show warning to user
      }

      // Auto-flag content if needed
      if (flagged && messageId) {
        await supabase.from('flagged_content').insert({
          content_type: 'message',
          content_id: messageId,
          flag_reason: allViolations.join('; '),
          auto_flagged: true,
          confidence_score: Math.min(totalScore / 100, 1.0)
        });
      }

      return {
        allowed,
        flagged,
        autoBlocked,
        violations: allViolations,
        confidenceScore: Math.min(totalScore, 100)
      };

    } catch (error) {
      console.error('Moderation error:', error);
      // Fail safe - allow content but log error
      return {
        allowed: true,
        flagged: false,
        autoBlocked: false,
        violations: [],
        confidenceScore: 0
      };
    } finally {
      setLoading(false);
    }
  }, [contentFilters, checkProfanityFilter, checkSpamFilter, checkKeywordFilter, checkRateLimit]);

  // Add new content filter (admin only)
  const addContentFilter = useCallback(async (
    filterType: string,
    pattern: string,
    isRegex: boolean = false,
    severity: number = 1
  ) => {
    try {
      const { error } = await supabase.from('content_filters').insert({
        filter_type: filterType,
        pattern: pattern,
        is_regex: isRegex,
        severity: severity,
        is_active: true
      });

      if (error) throw error;
      
      toast({
        title: "Filter Added",
        description: `New ${filterType} filter added successfully.`
      });

      // Reload filters
      const { data } = await supabase
        .from('content_filters')
        .select('*')
        .eq('is_active', true);
      
      setContentFilters(data || []);

    } catch (error) {
      console.error('Failed to add filter:', error);
      toast({
        title: "Error",
        description: "Failed to add content filter.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    moderateContent,
    addContentFilter,
    contentFilters,
    loading
  };
};