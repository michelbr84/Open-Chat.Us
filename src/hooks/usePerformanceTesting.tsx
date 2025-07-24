import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceResult {
  test: string;
  duration: number;
  success: boolean;
  responseTime?: number;
  throughput?: number;
  errors: string[];
}

export const usePerformanceTesting = () => {
  const [results, setResults] = useState<PerformanceResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test message loading performance
  const testMessageLoading = async (): Promise<PerformanceResult> => {
    const startTime = Date.now();
    const errors: string[] = [];
    let success = true;

    try {
      // Test 1: Load recent messages (most common query)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        errors.push(`Message loading error: ${error.message}`);
        success = false;
      }

      // Test 2: Search messages
      await supabase
        .from('messages')
        .select('*')
        .ilike('content', '%test%')
        .eq('is_deleted', false)
        .limit(20);

    } catch (err) {
      errors.push(`Exception: ${err}`);
      success = false;
    }

    const duration = Date.now() - startTime;
    return {
      test: 'Message Loading',
      duration,
      success,
      responseTime: duration,
      errors,
    };
  };

  // Test concurrent message sending
  const testMessageThroughput = async (messageCount = 10): Promise<PerformanceResult> => {
    const startTime = Date.now();
    const errors: string[] = [];
    let successCount = 0;

    const promises = Array.from({ length: messageCount }, async (_, index) => {
      try {
        const { error } = await supabase.from('messages').insert({
          content: `Performance test message ${index + 1} - ${Date.now()}`,
          sender_name: `PerfTester${index}`,
          sender_id: null,
        });

        if (error) {
          errors.push(`Message ${index}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (err) {
        errors.push(`Message ${index} exception: ${err}`);
      }
    });

    await Promise.all(promises);
    const duration = Date.now() - startTime;
    const throughput = (successCount / duration) * 1000; // messages per second

    return {
      test: `Message Throughput (${messageCount} messages)`,
      duration,
      success: successCount === messageCount,
      throughput,
      errors,
    };
  };

  // Test reactions performance
  const testReactionsPerformance = async (): Promise<PerformanceResult> => {
    const startTime = Date.now();
    const errors: string[] = [];
    let success = true;

    try {
      // Get a message to react to
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

      if (messages && messages.length > 0) {
        const messageId = messages[0].id;
        
        // Test adding reactions
        const reactionPromises = ['👍', '❤️', '😂'].map(async (emoji, index) => {
          try {
            const { error } = await supabase.from('message_reactions').insert({
              message_id: messageId,
              user_id: `perf-test-${Date.now()}-${index}`,
              emoji,
            });

            if (error) {
              errors.push(`Reaction ${emoji}: ${error.message}`);
            }
          } catch (err) {
            errors.push(`Reaction ${emoji} exception: ${err}`);
          }
        });

        await Promise.all(reactionPromises);

        // Test loading reactions
        await supabase
          .from('message_reactions')
          .select('*')
          .eq('message_id', messageId);
      }
    } catch (err) {
      errors.push(`Reactions test exception: ${err}`);
      success = false;
    }

    const duration = Date.now() - startTime;
    return {
      test: 'Reactions Performance',
      duration,
      success: errors.length === 0,
      responseTime: duration,
      errors,
    };
  };

  // Test real-time subscription performance
  const testRealtimePerformance = async (durationMs = 5000): Promise<PerformanceResult> => {
    const startTime = Date.now();
    const errors: string[] = [];
    let messagesReceived = 0;
    let success = true;

    return new Promise((resolve) => {
      try {
        const channel = supabase
          .channel('perf-test-realtime')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
              messagesReceived++;
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              errors.push('Real-time subscription failed');
              success = false;
            }
          });

        // Send a test message after subscription
        setTimeout(async () => {
          await supabase.from('messages').insert({
            content: `Real-time test message - ${Date.now()}`,
            sender_name: 'RealtimeTester',
            sender_id: null,
          });
        }, 1000);

        setTimeout(() => {
          supabase.removeChannel(channel);
          const duration = Date.now() - startTime;
          
          resolve({
            test: 'Real-time Performance',
            duration,
            success: success && messagesReceived > 0,
            responseTime: duration,
            throughput: messagesReceived,
            errors: messagesReceived === 0 ? ['No messages received'] : errors,
          });
        }, durationMs);

      } catch (err) {
        resolve({
          test: 'Real-time Performance',
          duration: Date.now() - startTime,
          success: false,
          errors: [`Real-time test exception: ${err}`],
        });
      }
    });
  };

  // Run all performance tests
  const runPerformanceTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    const allResults: PerformanceResult[] = [];

    console.log('🚀 Starting OpenChat Performance Tests...');

    // Test 1: Message Loading
    console.log('📥 Testing message loading...');
    const loadingResult = await testMessageLoading();
    allResults.push(loadingResult);
    setResults([...allResults]);

    // Test 2: Message Throughput (small batch)
    console.log('📤 Testing message throughput...');
    const throughputResult = await testMessageThroughput(5);
    allResults.push(throughputResult);
    setResults([...allResults]);

    // Test 3: Reactions Performance
    console.log('💫 Testing reactions performance...');
    const reactionsResult = await testReactionsPerformance();
    allResults.push(reactionsResult);
    setResults([...allResults]);

    // Test 4: Real-time Performance
    console.log('⚡ Testing real-time performance...');
    const realtimeResult = await testRealtimePerformance(3000);
    allResults.push(realtimeResult);
    setResults([...allResults]);

    setIsRunning(false);
    console.log('✅ Performance tests completed!');
    
    return allResults;
  };

  return {
    results,
    isRunning,
    runPerformanceTests,
  };
};