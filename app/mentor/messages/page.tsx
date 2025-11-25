'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Search, Loader2, Send, Clock } from 'lucide-react';
import { messagesApi } from '@/lib/api';
import type { Conversation } from '@/lib/api/types';
import { useRequireRole } from '@/hooks/use-require-auth';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MentorMessagesPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      loadConversations();
    }
  }, [user, authLoading]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await messagesApi.getConversations({ limit: 100 });
      setConversations(response.data);
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const mentee = conv.mentee;
    return mentee.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-black/95 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <MessageCircle className="w-8 h-8" />
                Messages
              </h1>
              <p className="text-zinc-400 mt-1">
                {totalUnread > 0 ? `${totalUnread} unread message${totalUnread > 1 ? 's' : ''}` : 'All conversations'}
              </p>
            </div>
            <Link
              href="/mentor/dashboard"
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mentees..."
              className="w-full bg-zinc-900 text-white placeholder-zinc-500 border border-zinc-800 rounded-full pl-12 pr-4 py-3 focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {filteredConversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
              <MessageCircle className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </h2>
            <p className="text-zinc-400 max-w-sm">
              {searchQuery
                ? 'Try adjusting your search'
                : 'Your conversations with mentees will appear here'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conversation, index) => {
              const mentee = conversation.mentee;
              const hasUnread = (conversation.unreadCount || 0) > 0;
              const lastMessageTime = conversation.lastMessageAt
                ? new Date(conversation.lastMessageAt)
                : null;

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/messages/${mentee.id}`}
                    className={`block bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:bg-zinc-900 hover:border-zinc-700 transition-all ${
                      hasUnread ? 'ring-1 ring-white/10' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800">
                          {mentee.profilePictureUrl ? (
                            <Image
                              src={mentee.profilePictureUrl}
                              alt={mentee.fullName}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                              {mentee.fullName.charAt(0)}
                            </div>
                          )}
                        </div>
                        {hasUnread && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <span className="text-black text-xs font-bold">
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold ${hasUnread ? 'text-white' : 'text-zinc-300'}`}>
                            {mentee.fullName}
                          </h3>
                          {lastMessageTime && (
                            <span className="text-xs text-zinc-500 flex-shrink-0">
                              {formatMessageTime(lastMessageTime)}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className={`text-sm line-clamp-2 ${hasUnread ? 'text-zinc-300' : 'text-zinc-500'}`}>
                            {conversation.lastMessage}
                          </p>
                        )}
                        {!conversation.lastMessage && (
                          <p className="text-sm text-zinc-600 italic">
                            No messages yet
                          </p>
                        )}
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex-shrink-0 self-center">
                        <Send className="w-5 h-5 text-zinc-600" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
