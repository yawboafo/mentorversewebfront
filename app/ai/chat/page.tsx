'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { aiApi } from '@/lib/api/ai';
import { AiSession } from '@/lib/api/types';
import { MessageSquare, Send, Bot, User as UserIcon, Plus, Clock, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AiChatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const [sessions, setSessions] = useState<AiSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; response?: string }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchSessions = async () => {
    try {
      const data = await aiApi.getSessions();
      setSessions(data);
    } catch (err: any) {
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = async () => {
    try {
      const session = await aiApi.createSession({
        context_type: 'general',
      });
      setCurrentSessionId(session.id);
      setMessages([]);
      setSessions([session, ...sessions]);
      toast.success('New session started! 🎉');
    } catch (err: any) {
      toast.error('Failed to start session');
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentSessionId) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setIsSending(true);

    try {
      const response = await aiApi.sendMessage(currentSessionId, userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response.response || 'No response' }]);
    } catch (err: any) {
      toast.error('Failed to send message');
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsSending(false);
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const history = await aiApi.getSessionHistory(sessionId);
      setCurrentSessionId(sessionId);
      setMessages(history.messages || []);
    } catch (err: any) {
      toast.error('Failed to load session');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Mentor Assistant</h1>
            <p className="text-muted-foreground">Get personalized guidance anytime</p>
          </div>
        </div>
        <Button onClick={startNewSession} className="bg-gradient-to-r from-purple-600 to-pink-600">
          <Plus className="h-4 w-4 mr-2" />
          New Session
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sessions Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No sessions yet
                </div>
              ) : (
                <div className="divide-y">
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => loadSession(session.id)}
                      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                        currentSessionId === session.id ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm line-clamp-1">
                          {session.context_type || 'General Chat'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {!currentSessionId ? (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4">
                    <Bot className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-3">Start a Conversation</h2>
                  <p className="text-muted-foreground mb-6">
                    Get personalized guidance, ask questions, or discuss your goals with our AI mentor assistant
                  </p>
                  <Button onClick={startNewSession} size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Plus className="h-5 w-5 mr-2" />
                    Start New Session
                  </Button>
                </div>
              </CardContent>
            ) : (
              <>
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Start the conversation by typing a message below
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.role === 'user' ? message.content : message.response || message.content}
                          </p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <UserIcon className="h-5 w-5 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {isSending && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Input */}
                <div className="border-t p-4">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isSending}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!inputMessage.trim() || isSending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
