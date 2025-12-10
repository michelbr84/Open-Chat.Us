import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  messagesSent: number; messagesReceived: number; reactionsSent: number; reactionsReceived: number;
  averageResponseTime: number; errors: string[]; concurrentUsers: number; testDuration: number;
}

class OpenChatPerformanceTester {
  private metrics: PerformanceMetrics = { messagesSent: 0, messagesReceived: 0, reactionsSent: 0, reactionsReceived: 0, averageResponseTime: 0, errors: [], concurrentUsers: 0, testDuration: 0 };
  private responseTimes: number[] = [];

  async testMessageThroughput(messagesPerSecond: number, durationSeconds: number) {
    const interval = 1000 / messagesPerSecond;
    return new Promise<void>((resolve) => {
      const intervalId = setInterval(async () => {
        const startTime = Date.now();
        const { error } = await supabase.from('messages').insert({ content: `Perf test ${this.metrics.messagesSent + 1}`, sender_name: `PerfTest${Math.floor(Math.random() * 1000)}`, sender_id: null });
        this.responseTimes.push(Date.now() - startTime);
        if (!error) this.metrics.messagesSent++;
      }, interval);
      setTimeout(() => { clearInterval(intervalId); resolve(); }, durationSeconds * 1000);
    });
  }

  generateReport(): PerformanceMetrics {
    this.metrics.averageResponseTime = this.responseTimes.length > 0 ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length : 0;
    return { ...this.metrics };
  }

  async runCompleteSuite(): Promise<PerformanceMetrics> {
    await this.testMessageThroughput(5, 5);
    return this.generateReport();
  }
}

export { OpenChatPerformanceTester };
