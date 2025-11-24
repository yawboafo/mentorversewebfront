'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequireRole } from '@/hooks/use-require-auth';
import { mentorsApi } from '@/lib/api/mentors';
import { MenteeDetails } from '@/lib/api/types';
import { Users, Search, Loader2, GraduationCap, Plus, UserPlus, ShoppingCart, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MenteeCard } from '@/components/mentor/mentee-card';

const ITEMS_PER_PAGE = 20;

type FilterType = 'all' | 'purchase' | 'subscription';

export default function MenteesPage() {
  const { user, isLoading: authLoading } = useRequireRole(['mentor', 'admin']);
  const [allMentees, setAllMentees] = useState<MenteeDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMentees, setTotalMentees] = useState(0);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [error, setError] = useState('');
  const [purchaseCount, setPurchaseCount] = useState(0);
  const [subscriptionCount, setSubscriptionCount] = useState(0);

  // Computed filtered mentees based on active tab
  const mentees = allMentees.filter(m => {
    if (filterType === 'purchase') return m.relationship_type === 'purchase_based';
    if (filterType === 'subscription') return m.relationship_type === 'subscription';
    return true; // 'all'
  });

  useEffect(() => {
    if (user) {
      fetchMentees();
      fetchAllMenteesForCounts();
    }
  }, [user, currentPage]);

  const fetchAllMenteesForCounts = async () => {
    try {
      // Fetch mentees (students who purchased content)
      const menteesResponse = await mentorsApi.getMentees({
        limit: 1000, // Large limit to get all mentees
      });
      const menteesData = menteesResponse.data || [];
      console.log('📊 Mentees (purchases):', menteesData.length);
      
      // Fetch subscribers
      let subscribersCount = 0;
      try {
        const subscribersResponse = await mentorsApi.getSubscribers();
        subscribersCount = subscribersResponse.data?.length || 0;
        console.log('📊 Subscribers:', subscribersCount);
      } catch (subErr) {
        console.log('⚠️ Could not fetch subscribers:', subErr);
      }
      
      const purchases = menteesData.length;
      setPurchaseCount(purchases);
      setSubscriptionCount(subscribersCount);
      console.log('📊 Final Counts - Purchases:', purchases, 'Subscriptions:', subscribersCount);
    } catch (err: any) {
      console.error('Error fetching counts:', err);
    }
  };

  const fetchMentees = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch mentees (purchase-based)
      const menteesResponse = await mentorsApi.getMentees({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
      });
      const menteesList = menteesResponse.data || [];
      
      // Fetch subscribers and transform to mentee format
      let subscribersList: MenteeDetails[] = [];
      try {
        const subscribersResponse = await mentorsApi.getSubscribers();
        const subscribers = subscribersResponse.data || [];
        
        // Transform subscriber format to match MenteeDetails
        subscribersList = subscribers.map((sub: any) => ({
          relationship_type: 'subscription',
          status: sub.subscription?.status || 'active',
          purchased_content: [],
          mentee: {
            id: sub.id,
            full_name: sub.fullName,
            email: sub.email,
            avatar_url: sub.profilePhoto,
            account_type: sub.accountType || 'individual',
            country: sub.country || null,
            bio: sub.bio || null,
          },
          first_connected_at: sub.subscription?.subscribedAt || new Date().toISOString(),
        }));
      } catch (subErr) {
        console.log('⚠️ Could not fetch subscribers for list:', subErr);
      }
      
      // Combine both lists
      const combinedList = [...menteesList, ...subscribersList];
      
      console.log('📋 Combined list:', {
        mentees: menteesList.length,
        subscribers: subscribersList.length,
        total: combinedList.length,
        subscribersList: subscribersList
      });
      
      setAllMentees(combinedList);
      setTotalMentees(combinedList.length);
      setTotalPages(Math.ceil(combinedList.length / ITEMS_PER_PAGE));
    } catch (err: any) {
      console.error('Error fetching mentees:', err);
      setError(err.message || 'Failed to load mentees. Please try again later.');
      setAllMentees([]);
      setTotalMentees(0);
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
            <h1 className="text-3xl font-bold">My Students & Subscribers</h1>
            <p className="text-muted-foreground mt-1">
              Manage students who purchased your content and your subscribers
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
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
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <ShoppingCart className="h-10 w-10 text-green-500" />
                <div>
                  <div className="text-3xl font-bold">{purchaseCount}</div>
                  <p className="text-sm text-muted-foreground">Purchased Content</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <UserPlus className="h-10 w-10 text-blue-500" />
                <div>
                  <div className="text-3xl font-bold">{subscriptionCount}</div>
                  <p className="text-sm text-muted-foreground">Subscribers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              <Users className="h-4 w-4 mr-2" />
              All ({totalMentees})
            </TabsTrigger>
            <TabsTrigger value="purchase">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchases ({purchaseCount})
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <UserPlus className="h-4 w-4 mr-2" />
              Subscribers ({subscriptionCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-14 w-14 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-3 w-24" />
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
          {filterType === 'all' ? (
            <>
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No Students Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? 'No students found matching your search.'
                  : 'Students will appear here when they purchase your content or subscribe to you. Start by creating and publishing your content!'}
              </p>
            </>
          ) : filterType === 'purchase' ? (
            <>
              <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No Purchases Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? 'No students with purchases found matching your search.'
                  : 'Students who purchase your courses and frameworks will appear here.'}
              </p>
            </>
          ) : (
            <>
              <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold mb-2">No Subscribers Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? 'No subscribers found matching your search.'
                  : 'Students who subscribe to follow your work will appear here.'}
              </p>
            </>
          )}
          {!searchQuery && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/mentor/content">
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Your Content
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Link href="/mentor/content/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Content
                </Link>
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <>
          {/* Mentees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {mentees.map((mentee) => (
              <MenteeCard key={mentee.mentee.id} mentee={mentee} />
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
