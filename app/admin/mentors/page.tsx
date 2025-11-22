'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireRole } from '@/hooks/use-require-auth';
import { adminApi } from '@/lib/api/admin';
import type { MentorApplicationAdmin } from '@/lib/api/types';
import { toast } from 'sonner';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Briefcase, 
  Globe, 
  Languages, 
  Calendar,
  Mail,
  ArrowLeft,
  Loader2,
  Shield
} from 'lucide-react';
import Link from 'next/link';

export default function AdminMentorApplicationsPage() {
  const { user, isLoading: authLoading } = useRequireRole(['admin']);
  const [applications, setApplications] = useState<MentorApplicationAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getMentorApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (mentorId: string) => {
    if (!confirm('Are you sure you want to approve this mentor application?')) {
      return;
    }

    setProcessingId(mentorId);
    try {
      await adminApi.approveMentorApplication(mentorId);
      toast.success('Mentor application approved! 🎉');
      // Remove from list
      setApplications(prev => prev.filter(app => app.userId !== mentorId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve application');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (mentorId: string) => {
    if (!confirm('Are you sure you want to reject this mentor application? This action cannot be undone.')) {
      return;
    }

    setProcessingId(mentorId);
    try {
      await adminApi.rejectMentorApplication(mentorId);
      toast.success('Mentor application rejected');
      // Remove from list
      setApplications(prev => prev.filter(app => app.userId !== mentorId));
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject application');
    } finally {
      setProcessingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin Panel
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Mentor Applications</h1>
            <p className="text-muted-foreground mt-1">
              Review and approve pending mentor applications
            </p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-4 w-48 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <Card className="p-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">All Caught Up! 🎉</h3>
          <p className="text-muted-foreground">
            No pending mentor applications at the moment
          </p>
        </Card>
      ) : (
        /* Applications List */
        <div className="space-y-6">
          {applications.map((application, index) => (
            <motion.div
              key={application.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        <User className="h-6 w-6" />
                        {application.user.fullName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-2">
                        <Mail className="h-4 w-4" />
                        {application.user_email}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Headline */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Headline
                    </h3>
                    <p className="text-lg font-medium">{application.headline}</p>
                  </div>

                  {/* Short Bio */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Short Bio</h3>
                    <p className="text-muted-foreground">{application.shortBio}</p>
                  </div>

                  {/* Long Bio */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Detailed Bio</h3>
                    <p className="text-sm whitespace-pre-wrap">{application.longBio}</p>
                  </div>

                  {/* Expertise */}
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-2">Areas of Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {application.areasOfExpertise.map((area) => (
                        <Badge key={area} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Experience
                      </h3>
                      <p className="font-medium">{application.experienceYears} years</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Languages className="h-4 w-4" />
                        Languages
                      </h3>
                      <p className="font-medium">{application.languages.join(', ')}</p>
                    </div>
                  </div>

                  {/* Social Links */}
                  {Object.keys(application.socialLinks).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Social Links
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(application.socialLinks).map(([platform, url]) => (
                          url && (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {platform}
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="bg-muted/50 flex gap-3">
                  <Button
                    onClick={() => handleApprove(application.userId)}
                    disabled={processingId === application.userId}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {processingId === application.userId ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(application.userId)}
                    disabled={processingId === application.userId}
                    variant="destructive"
                    className="flex-1"
                  >
                    {processingId === application.userId ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
