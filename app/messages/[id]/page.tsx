'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { messagesApi } from '@/lib/api';
import { mentorSubscriptionsApi } from '@/lib/api/mentor-subscriptions';
import type { ConversationMessages, Message, MentorAccessStatus } from '@/lib/api/types';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function MessagingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: mentorId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<ConversationMessages | null>(null);
  const [accessStatus, setAccessStatus] = useState<MentorAccessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation and check access
  useEffect(() => {
    const loadData = async () => {
      if (authLoading) return;
      
      if (!user) {
        router.push(`/login?redirect=/messages/${mentorId}`);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Check access first
        const accessResponse = await mentorSubscriptionsApi.checkMentorAccess(mentorId);
        const access = accessResponse.data;
        setAccessStatus(access);

        if (!access.canMessage) {
          setError(access.messagingDeniedReason || 'You need an active subscription to message this mentor.');
          setLoading(false);
          return;
        }

        // Load conversation
        const conversation = await messagesApi.getConversation(mentorId);
        setData(conversation);

        // Mark as read
        if (conversation.messages.length > 0) {
          messagesApi.markConversationAsRead(mentorId).catch(console.error);
        }
      } catch (err: any) {
        console.error('Failed to load conversation:', err);
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mentorId, user, authLoading, router]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending || !data) return;

    try {
      setSending(true);
      const newMessage = await messagesApi.sendMessage(mentorId, message.trim());
      
      setData({
        ...data,
        messages: [...data.messages, newMessage],
        conversation: {
          ...data.conversation,
          lastMessage: newMessage.content,
          lastMessageAt: newMessage.createdAt,
        },
      });
      
      setMessage('');
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Access Required</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <Link
              href={`/mentors/${mentorId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              View Mentor Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { conversation, messages } = data;
  const mentor = conversation.mentor;
  const mentee = conversation.mentee;
  const isMentor = user?.id === mentor.id;
  
  // Determine who to display in header
  const displayPerson = isMentor ? mentee : mentor;
  const displayLink = isMentor ? `/mentor/mentees/${mentee.id}` : `/mentors/${mentor.id}`;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-400" />
              </button>
              
              <Link href={displayLink} className="flex items-center gap-3 group">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
                  {displayPerson.profilePictureUrl ? (
                    <Image
                      src={displayPerson.profilePictureUrl}
                      alt={displayPerson.fullName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                      {displayPerson.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="font-semibold text-white group-hover:text-zinc-300 transition-colors">
                    {displayPerson.fullName}
                  </h1>
                  {isMentor ? (
                    <p className="text-xs text-zinc-500">Mentee</p>
                  ) : (
                    mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
                      <p className="text-xs text-zinc-500">
                        {mentor.areasOfExpertise[0]}
                      </p>
                    )
                  )}
                </div>
              </Link>
            </div>

            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center min-h-[400px] text-center"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                <Send className="w-8 h-8 text-zinc-600" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Start the conversation</h2>
              <p className="text-zinc-400 max-w-sm">
                {isMentor 
                  ? `Send your first message to ${mentee.fullName}.`
                  : `Send your first message to ${mentor.fullName} to begin your mentorship journey.`
                }
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg, index) => {
                  const isOwnMessage = msg.senderId === user?.id;
                  const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {showAvatar ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                            {isOwnMessage ? (
                              user?.full_name ? (
                                <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                                  {user.full_name.charAt(0)}
                                </div>
                              ) : null
                            ) : mentor.profilePictureUrl ? (
                              <Image
                                src={mentor.profilePictureUrl}
                                alt={mentor.fullName}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-sm font-semibold">
                                {mentor.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-8 h-8" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`flex-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            isOwnMessage
                              ? 'bg-white text-black rounded-br-md'
                              : 'bg-zinc-900 text-white rounded-bl-md'
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                        <span className="text-xs text-zinc-600 mt-1 px-1">
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-zinc-800 bg-black/95 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message ${displayPerson.fullName}...`}
              disabled={sending}
              className="flex-1 bg-zinc-900 text-white placeholder-zinc-500 border border-zinc-800 rounded-full px-6 py-3 focus:outline-none focus:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
