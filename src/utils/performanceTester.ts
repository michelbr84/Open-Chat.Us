// Performance Testing Suite for OpenChat
// This tests concurrent users, message throughput, and system stability

import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  messagesSent: number;
  messagesReceived: number;
  reactionsSent: number;
  reactionsReceived: number;
  averageResponseTime: number;
  errors: string[];
  concurrentUsers: number;
  testDuration: number;
}

class OpenChatPerformanceTester {
  private metrics: PerformanceMetrics = {
    messagesSent: 0,
    messagesReceived: 0,
    reactionsSent: 0,
    reactionsReceived: 0,
    averageResponseTime: 0,
    errors: [],
    concurrentUsers: 0,
    testDuration: 0,
  };

  private responseTimes: number[] = [];
  private testStartTime: number = 0;

  // Test 1: Message Throughput
  async testMessageThroughput(messagesPerSecond: number, durationSeconds: number) {
    console.log(`🧪 Testing message throughput: ${messagesPerSecond} msgs/sec for ${durationSeconds}s`);
    
    this.testStartTime = Date.now();
    const interval = 1000 / messagesPerSecond;
    
    return new Promise<void>((resolve) => {
      const sendMessage = async () => {
        const startTime = Date.now();
        
        try {
          const { error } = await supabase.from('messages').insert({
            content: `Performance test message ${this.metrics.messagesSent + 1}`,
            sender_name: `PerfTest${Math.floor(Math.random() * 1000)}`,
            sender_id: null,
          });

          const responseTime = Date.now() - startTime;
          this.responseTimes.push(responseTime);

          if (error) {
            this.metrics.errors.push(`Message send error: ${error.message}`);
          } else {
            this.metrics.messagesSent++;
          }
        } catch (err) {
          this.metrics.errors.push(`Message send exception: ${err}`);
        }
      };

      const intervalId = setInterval(sendMessage, interval);
      
      setTimeout(() => {
        clearInterval(intervalId);
        this.metrics.testDuration = Date.now() - this.testStartTime;
        resolve();
      }, durationSeconds * 1000);
    });
  }

  // Test 2: Concurrent Users Simulation
  async testConcurrentUsers(userCount: number, actionsPerUser: number) {
    console.log(`👥 Testing ${userCount} concurrent users, ${actionsPerUser} actions each`);
    
    this.metrics.concurrentUsers = userCount;
    const promises: Promise<void>[] = [];

    for (let i = 0; i < userCount; i++) {
      promises.push(this.simulateUser(i, actionsPerUser));
    }

    await Promise.all(promises);
  }

  private async simulateUser(userId: number, actions: number): Promise<void> {
    const userName = `TestUser${userId}`;
    
    for (let action = 0; action < actions; action++) {
      const actionType = Math.random();
      
      try {
        if (actionType < 0.7) {
          // 70% chance: Send message
          await this.sendTestMessage(userName);
        } else if (actionType < 0.9) {
          // 20% chance: Add reaction
          await this.addTestReaction();
        } else {
          // 10% chance: Search messages
          await this.searchMessages('test');
        }
        
        // Random delay between actions (0.5-2 seconds)
        await this.delay(500 + Math.random() * 1500);
      } catch (err) {
        this.metrics.errors.push(`User ${userId} action ${action}: ${err}`);
      }
    }
  }

  private async sendTestMessage(userName: string): Promise<void> {
    const startTime = Date.now();
    
    const { error } = await supabase.from('messages').insert({
      content: `Concurrent test from ${userName} at ${new Date().toISOString()}`,
      sender_name: userName,
      sender_id: null,
    });

    this.responseTimes.push(Date.now() - startTime);
    
    if (error) {
      this.metrics.errors.push(`Send message error: ${error.message}`);
    } else {
      this.metrics.messagesSent++;
    }
  }

  private async addTestReaction(): Promise<void> {
    const startTime = Date.now();
    
    // Get a random recent message to react to
    const { data: messages } = await supabase
      .from('messages')
      .select('id')
      .limit(10);

    if (messages && messages.length > 0) {
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const emoji = ['👍', '❤️', '😂', '🔥'][Math.floor(Math.random() * 4)];
      
      const { error } = await supabase.from('message_reactions').insert({
        message_id: randomMessage.id,
        user_id: `test-user-${Math.random()}`,
        emoji: emoji,
      });

      if (!error) {
        this.metrics.reactionsSent++;
      }
    }

    this.responseTimes.push(Date.now() - startTime);
  }

  private async searchMessages(query: string): Promise<void> {
    const startTime = Date.now();
    
    await supabase
      .from('messages')
      .select('*')
      .ilike('content', `%${query}%`)
      .limit(20);

    this.responseTimes.push(Date.now() - startTime);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Test 3: Real-time Performance
  async testRealtimePerformance(durationSeconds: number): Promise<void> {
    console.log(`⚡ Testing real-time subscriptions for ${durationSeconds}s`);
    
    return new Promise<void>((resolve) => {
      const channel = supabase
        .channel('performance-test')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            this.metrics.messagesReceived++;
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'message_reactions' },
          (payload) => {
            this.metrics.reactionsReceived++;
          }
        )
        .subscribe();

      setTimeout(() => {
        supabase.removeChannel(channel);
        resolve();
      }, durationSeconds * 1000);
    });
  }

  // Generate Performance Report
  generateReport(): PerformanceMetrics {
    this.metrics.averageResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;

    return { ...this.metrics };
  }

  // Run Complete Test Suite
  async runCompleteSuite(): Promise<PerformanceMetrics> {
    console.log('🚀 Starting OpenChat Performance Test Suite...');
    
    try {
      // Test 1: Light load (5 msgs/sec for 10 seconds)
      await this.testMessageThroughput(5, 10);
      
      // Test 2: Moderate concurrent users (10 users, 5 actions each)
      await this.testConcurrentUsers(10, 5);
      
      // Test 3: Real-time subscription test (15 seconds)
      const realtimePromise = this.testRealtimePerformance(15);
      
      // Test 4: Heavy load during real-time test (10 msgs/sec for 15 seconds)
      await this.testMessageThroughput(10, 15);
      
      await realtimePromise;
      
      console.log('✅ Performance test suite completed!');
      
    } catch (error) {
      this.metrics.errors.push(`Test suite error: ${error}`);
    }
    
    return this.generateReport();
  }
}

// Export for use in performance testing
export { OpenChatPerformanceTester };

// Example usage:
// const tester = new OpenChatPerformanceTester();
// const results = await tester.runCompleteSuite();
// console.log('Performance Results:', results);