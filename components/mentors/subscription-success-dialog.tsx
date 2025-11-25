'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, MessageCircle, Calendar, Sparkles } from 'lucide-react';

interface SubscriptionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentorName: string;
  allowsMessaging: boolean;
  allows1to1Sessions: boolean;
  onMessageClick?: () => void;
  onBookAppointmentClick?: () => void;
}

export function SubscriptionSuccessDialog({
  isOpen,
  onClose,
  mentorName,
  allowsMessaging,
  allows1to1Sessions,
  onMessageClick,
  onBookAppointmentClick,
}: SubscriptionSuccessDialogProps) {

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl">
            You're all set! 🎉
          </DialogTitle>
          <DialogDescription className="text-base">
            You now have full access to work with{' '}
            <span className="font-semibold text-foreground">{mentorName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-4">
            <p className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              What's next?
            </p>
            <ul className="space-y-2 text-sm">
              {allowsMessaging && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Start a conversation via direct messages
                </li>
              )}
              {allows1to1Sessions && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Book your first 1:1 mentorship session
                </li>
              )}
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Access exclusive courses and content
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {allowsMessaging && onMessageClick && (
              <Button 
                onClick={() => {
                  onClose();
                  onMessageClick();
                }}
                className="w-full"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            )}
            {allows1to1Sessions && onBookAppointmentClick && (
              <Button 
                variant="outline"
                onClick={() => {
                  onClose();
                  onBookAppointmentClick();
                }}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Session
              </Button>
            )}
          </div>

          <Button 
            variant="ghost" 
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
