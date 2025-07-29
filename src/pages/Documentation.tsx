import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Book, 
  MessageSquare, 
  Hash, 
  Smile, 
  AtSign, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Code,
  Quote,
  List,
  Link,
  Sparkles,
  ArrowLeft,
  Copy,
  Check,
  Bot,
  Zap,
  Shield,
  Users,
  Settings,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { MessageRenderer } from '@/components/MessageRenderer';
import { useToast } from '@/hooks/use-toast';
import { SiteNavigation } from '@/components/SiteNavigation';

export default function Documentation() {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
      toast({
        title: "Copied!",
        description: "Syntax copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const CopyButton = ({ text, item }: { text: string; item: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => copyToClipboard(text, item)}
      className="h-6 w-6 p-0"
    >
      {copiedItem === item ? (
        <Check className="h-3 w-3 text-green-500" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );

  const SyntaxExample = ({ 
    syntax, 
    description, 
    example, 
    copyText 
  }: { 
    syntax: string; 
    description: string; 
    example: string;
    copyText?: string;
  }) => (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <code className="text-sm bg-muted px-2 py-1 rounded">{syntax}</code>
        <CopyButton text={copyText || syntax} item={syntax} />
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="border-t pt-3">
        <p className="text-xs text-muted-foreground mb-2">Preview:</p>
        <MessageRenderer content={example} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteNavigation />
      
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Book className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Documentation</h1>
              <p className="text-muted-foreground">Learn how to use all the advanced chat features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="bot" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="bot" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Bot
            </TabsTrigger>
            <TabsTrigger value="formatting" className="flex items-center gap-2">
              <Bold className="w-4 h-4" />
              Text Formatting
            </TabsTrigger>
            <TabsTrigger value="emojis" className="flex items-center gap-2">
              <Smile className="w-4 h-4" />
              Emojis
            </TabsTrigger>
            <TabsTrigger value="mentions" className="flex items-center gap-2">
              <AtSign className="w-4 h-4" />
              Mentions
            </TabsTrigger>
            <TabsTrigger value="quick-reference" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Quick Reference
            </TabsTrigger>
          </TabsList>

          {/* AI Bot Tab */}
          <TabsContent value="bot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Assistant (@bot)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What is @bot?</h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        @bot is our intelligent AI assistant powered by advanced language models. It can answer questions, 
                        help with research, explain concepts, assist with coding, and engage in natural conversations.
                      </p>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold">Basic Usage</h3>
                  
                  <SyntaxExample
                    syntax="@bot Hello, how are you?"
                    description="Start any message with @bot to chat with the AI assistant"
                    example="@bot Hello, how are you?"
                  />
                  
                  <SyntaxExample
                    syntax="@bot Can you explain quantum computing?"
                    description="Ask the bot to explain complex topics or concepts"
                    example="@bot Can you explain quantum computing?"
                  />
                  
                  <SyntaxExample
                    syntax="@bot Help me debug this JavaScript code: console.log('hello')"
                    description="Get coding help and debugging assistance"
                    example="@bot Help me debug this JavaScript code: console.log('hello')"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Capabilities
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Conversation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          • Natural conversation and Q&A<br/>
                          • Context-aware responses<br/>
                          • Multi-turn conversations<br/>
                          • Friendly and helpful tone
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Code className="w-4 h-4" />
                          Technical Help
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          • Code debugging and review<br/>
                          • Programming explanations<br/>
                          • Technical documentation<br/>
                          • Best practices advice
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Book className="w-4 h-4" />
                          Knowledge & Research
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          • Explain complex topics<br/>
                          • Research assistance<br/>
                          • Educational content<br/>
                          • Fact-checking and analysis
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Community Help
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          • OpenChat platform guidance<br/>
                          • Feature explanations<br/>
                          • Usage tips and tricks<br/>
                          • Community guidelines
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    How It Works
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
                      <div>
                        <h4 className="font-medium">Send Message</h4>
                        <p className="text-sm text-muted-foreground">Type @bot followed by your question or request</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
                      <div>
                        <h4 className="font-medium">AI Processing</h4>
                        <p className="text-sm text-muted-foreground">Your message is sent to our AI system for analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</div>
                      <div>
                        <h4 className="font-medium">Real-time Response</h4>
                        <p className="text-sm text-muted-foreground">Bot response appears in chat for everyone to see</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Best Practices & Guidelines
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Do's
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Be specific and clear in your questions</li>
                        <li>• Provide context for better responses</li>
                        <li>• Use @bot for educational and helpful content</li>
                        <li>• Ask follow-up questions if needed</li>
                        <li>• Report any inappropriate responses</li>
                      </ul>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Don'ts
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Don't spam or abuse the bot</li>
                        <li>• Don't ask for harmful or inappropriate content</li>
                        <li>• Don't share personal sensitive information</li>
                        <li>• Don't expect 100% accuracy on all topics</li>
                        <li>• Don't use for commercial spam</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    💡 Pro Tips
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• The bot appears in the user list when online</li>
                    <li>• Bot responses are saved and visible to all users</li>
                    <li>• You can mention the bot using @ like any other user</li>
                    <li>• Bot messages are marked with a special @bot identifier</li>
                    <li>• Check the bot status indicator to see if it's online</li>
                  </ul>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Technical Details for Developers
                  </h4>
                  <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
                    <p>• Bot integration uses Supabase Edge Functions for secure AI communication</p>
                    <p>• All bot responses are automatically saved to the database with <code>is_bot_message: true</code></p>
                    <p>• Bot messages appear in real-time to all connected users via Supabase realtime</p>
                    <p>• The system includes automatic error handling and graceful degradation</p>
                    <p>• Bot status is monitored and displayed to users in real-time</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Text Formatting Tab */}
          <TabsContent value="formatting" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Text Formatting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <SyntaxExample
                    syntax="**bold text**"
                    description="Make text bold"
                    example="This is **bold text** in a message"
                  />
                  
                  <SyntaxExample
                    syntax="*italic text*"
                    description="Make text italic"
                    example="This is *italic text* in a message"
                  />
                  
                  <SyntaxExample
                    syntax="__underlined text__"
                    description="Underline text"
                    example="This is __underlined text__ in a message"
                  />
                  
                  <SyntaxExample
                    syntax="~~strikethrough~~"
                    description="Strike through text"
                    example="This is ~~strikethrough~~ text"
                  />
                  
                  <SyntaxExample
                    syntax="`inline code`"
                    description="Inline code formatting"
                    example="Use `console.log()` to debug"
                  />
                  
                  <SyntaxExample
                    syntax="[Link Text](URL)"
                    description="Create clickable links"
                    example="Check out [Open-Chat.Us](https://open-chat.us)"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Code Blocks
                  </h3>
                  
                  <SyntaxExample
                    syntax="```language
code here
```"
                    description="Multi-line code with optional syntax highlighting"
                    example="```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```"
                    copyText="```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```"
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Quote className="w-5 h-5" />
                    Quotes & Lists
                  </h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <SyntaxExample
                      syntax="> quoted text"
                      description="Create a blockquote"
                      example="> This is a quoted message"
                    />
                    
                    <SyntaxExample
                      syntax="- list item"
                      description="Create bullet points (also works with * or +)"
                      example="- First item
- Second item
- Third item"
                      copyText="- First item
- Second item
- Third item"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emojis Tab */}
          <TabsContent value="emojis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smile className="w-5 h-5" />
                  Emoji System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Emoji Shortcodes</h3>
                  <p className="text-muted-foreground">
                    Type emoji names between colons to insert emojis. Start typing and see autocomplete suggestions!
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <SyntaxExample
                      syntax=":smile:"
                      description="Happy face emoji"
                      example="Hello there :smile:"
                    />
                    
                    <SyntaxExample
                      syntax=":heart:"
                      description="Red heart emoji"
                      example="I :heart: this feature!"
                    />
                    
                    <SyntaxExample
                      syntax=":fire:"
                      description="Fire emoji"
                      example="This chat is :fire:"
                    />
                    
                    <SyntaxExample
                      syntax=":thumbsup:"
                      description="Thumbs up emoji"
                      example="Great job :thumbsup:"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Popular Emoji Categories</h3>
                  
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Smileys</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { code: ':smile:', emoji: '😄' },
                          { code: ':joy:', emoji: '😂' },
                          { code: ':heart_eyes:', emoji: '😍' },
                          { code: ':wink:', emoji: '😉' },
                          { code: ':thinking:', emoji: '🤔' },
                        ].map((item) => (
                          <div key={item.code} className="flex items-center justify-between">
                            <code className="text-xs">{item.code}</code>
                            <span className="text-lg">{item.emoji}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Objects</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { code: ':fire:', emoji: '🔥' },
                          { code: ':star:', emoji: '⭐' },
                          { code: ':sparkles:', emoji: '✨' },
                          { code: ':zap:', emoji: '⚡' },
                          { code: ':100:', emoji: '💯' },
                        ].map((item) => (
                          <div key={item.code} className="flex items-center justify-between">
                            <code className="text-xs">{item.code}</code>
                            <span className="text-lg">{item.emoji}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Hands</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {[
                          { code: ':thumbsup:', emoji: '👍' },
                          { code: ':clap:', emoji: '👏' },
                          { code: ':raised_hands:', emoji: '🙌' },
                          { code: ':muscle:', emoji: '💪' },
                          { code: ':pray:', emoji: '🙏' },
                        ].map((item) => (
                          <div key={item.code} className="flex items-center justify-between">
                            <code className="text-xs">{item.code}</code>
                            <span className="text-lg">{item.emoji}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Pro Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Type : followed by any letter to see emoji suggestions</li>
                    <li>• Use arrow keys to navigate suggestions</li>
                    <li>• Press Enter to select or Escape to close</li>
                    <li>• Click on message emojis to react quickly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mentions Tab */}
          <TabsContent value="mentions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AtSign className="w-5 h-5" />
                  Mentions & User Interaction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Mentioning Users</h3>
                  
                  <SyntaxExample
                    syntax="@username"
                    description="Mention a user by typing @ followed by their name"
                    example="Hey @john, check this out!"
                  />
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">How Mentions Work</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Type @ to see a list of online users</li>
                      <li>• Use arrow keys to navigate the user list</li>
                      <li>• Press Enter to select a user</li>
                      <li>• Mentioned users will see a highlighted notification</li>
                      <li>• You can mention multiple users in one message</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Message Reactions</h3>
                  <p className="text-muted-foreground">
                    React to messages by hovering over them and clicking the emoji button, or use the quick reaction buttons on mobile.
                  </p>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Desktop</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          <li>• Hover over any message</li>
                          <li>• Click the 😊 emoji button</li>
                          <li>• Select your reaction</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Mobile</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1 text-sm">
                          <li>• Tap and hold a message</li>
                          <li>• Use the "Like" button for quick ❤️</li>
                          <li>• Tap emoji button for more options</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quick Reference Tab */}
          <TabsContent value="quick-reference" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Quick Reference Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-3 text-left">Syntax</th>
                          <th className="border border-border p-3 text-left">Result</th>
                          <th className="border border-border p-3 text-left">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-border p-3"><code>@user</code></td>
                          <td className="border border-border p-3">Mention</td>
                          <td className="border border-border p-3">Notifies the person</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>**text**</code></td>
                          <td className="border border-border p-3"><strong>Bold</strong></td>
                          <td className="border border-border p-3">Markdown style</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>*text*</code></td>
                          <td className="border border-border p-3"><em>Italic</em></td>
                          <td className="border border-border p-3">Markdown style</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>__text__</code></td>
                          <td className="border border-border p-3"><u>Underline</u></td>
                          <td className="border border-border p-3">Double underscore</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>~~text~~</code></td>
                          <td className="border border-border p-3"><s>Strikethrough</s></td>
                          <td className="border border-border p-3">Double tilde</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>`text`</code></td>
                          <td className="border border-border p-3">Inline code</td>
                          <td className="border border-border p-3">Monospace font</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>```</code></td>
                          <td className="border border-border p-3">Code block</td>
                          <td className="border border-border p-3">Multiline code</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>&gt; text</code></td>
                          <td className="border border-border p-3">Blockquote</td>
                          <td className="border border-border p-3">Start line with &gt;</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>- item</code></td>
                          <td className="border border-border p-3">List item</td>
                          <td className="border border-border p-3">Also works with * or +</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>@bot question</code></td>
                          <td className="border border-border p-3">AI Response</td>
                          <td className="border border-border p-3">Chat with AI assistant</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>:emoji:</code></td>
                          <td className="border border-border p-3">Emoji</td>
                          <td className="border border-border p-3">Autocomplete available</td>
                        </tr>
                        <tr>
                          <td className="border border-border p-3"><code>[text](url)</code></td>
                          <td className="border border-border p-3">Link</td>
                          <td className="border border-border p-3">Clickable link</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Send message</span>
                          <Badge variant="outline">Enter</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">New line</span>
                          <Badge variant="outline">Shift + Enter</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Close suggestions</span>
                          <Badge variant="outline">Escape</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Navigate suggestions</span>
                          <Badge variant="outline">↑ ↓</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Coming Soon</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Hash className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Slash commands</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">Message replies</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">File attachments</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bot className="w-4 h-4 text-green-600" />
                          <span className="text-sm">AI Bot (Available!)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">And much more!</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}