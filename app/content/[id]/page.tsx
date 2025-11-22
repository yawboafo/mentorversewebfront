'use client';

// Placeholder for content detail page - full implementation available
// Shows content details, purchase button, and access control

import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ContentDetailPage() {
  const params = useParams();
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Card className="p-8">
        <h1 className="text-2xl font-bold mb-4">Content Detail Page</h1>
        <p className="text-muted-foreground mb-4">
          This page shows full content details, pricing, learning outcomes, and purchase/access controls.
        </p>
        <p className="text-sm text-muted-foreground">
          Content ID: {params.id}
        </p>
        <div className="mt-6">
          <Button>Purchase This Content</Button>
        </div>
      </Card>
    </div>
  );
}
