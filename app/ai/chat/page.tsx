'use client';

// Placeholder for AI chat interface
// Full implementation includes session list, message history, and real-time chat

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function AiChatPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6">AI Mentor Assistant</h1>
      
      <Card className="p-8 text-center">
        <MessageSquare className="h-16 w-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4">Start a New Conversation</h2>
        <p className="text-muted-foreground mb-6">
          Get personalized guidance from our AI mentor assistant
        </p>
        <Button size="lg">Start AI Session</Button>
      </Card>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Recent Sessions</h3>
        <p className="text-muted-foreground">No recent sessions yet</p>
      </div>
    </div>
  );
}
