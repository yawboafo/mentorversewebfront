'use client';

// Placeholder for mentor application form
// Full implementation includes multi-field form with validation

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';

export default function MentorApplyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="p-8">
        <div className="text-center mb-8">
          <Users className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Become a Mentor</h1>
          <p className="text-muted-foreground">
            Share your expertise and help others grow
          </p>
        </div>
        
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Complete the application form with your professional background, areas of expertise,
            and teaching experience. Our team will review your application within 48 hours.
          </p>
          <Button size="lg" className="w-full">Start Application</Button>
        </div>
      </Card>
    </div>
  );
}
