'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireRole } from '@/hooks/use-require-auth';
import { mentorsApi } from '@/lib/api/mentors';
import { MenteeDetails, MenteesResponse } from '@/lib/api/types';
import { Users, Search, Loader2, Mail, MapPin, Calendar, BookOpen, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 20;

export default function MenteesPage() {
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  const [mentees, setMentees] = useState<MenteeDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMentees, setTotalMentees] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchMentees();
    }
  }, [user, currentPage]);

  const fetchMentees = async () => {
    try {
      setIsLoading(true);
      const response = await mentorsApi.getMentees({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
      });
      setMentees(response.data);
      setTotalMentees(response.pagination.total);
      setTotalPages(response.pagination.total_pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load mentees');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchMentees();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      active: { variant: 'default', label: 'Active' },
      paused: { variant: 'secondary', label: 'Paused' },
      ended: { variant: 'outline', label: 'Ended' },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (authLoading || !user) {
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
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">My Students</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your mentees who have purchased your content
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-10 w-10 text-purple-500" />
              <div>
                <div className="text-3xl font-bold">{totalMentees}</div>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchMentees} className="mt-4">
            Try Again
          </Button>
        </Card>
      ) : mentees.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold mb-2">No Students Yet</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery
              ? 'No students found matching your search.'
              : 'Students will appear here when they purchase your content.'}
          </p>
          {!searchQuery && (
            <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Link href="/mentor/content">View Your Content</Link>
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Mentees List */}
          <div className="space-y-4 mb-8">
            {mentees.map((mentee) => (
              <Card key={mentee.mentee.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={mentee.mentee.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                        {mentee.mentee.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{mentee.mentee.full_name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {mentee.mentee.email}
                            </div>
                            {mentee.mentee.country && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {mentee.mentee.country}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{mentee.mentee.account_type}</Badge>
                          {getStatusBadge(mentee.status)}
                        </div>
                      </div>

                      {/* Purchased Content */}
                      {mentee.purchased_content.length > 0 && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              Purchased Content ({mentee.purchased_content.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {mentee.purchased_content.map((content) => (
                              <Badge key={content.id} variant="secondary" className="gap-1">
                                {content.title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Joined {format(new Date(mentee.first_connected_at), 'MMM d, yyyy')}
                        </div>
                        {mentee.last_activity_at && (
                          <div>
                            Last active {format(new Date(mentee.last_activity_at), 'MMM d, yyyy')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalMentees)} of {totalMentees} students
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(pageNum)}
                        size="sm"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
