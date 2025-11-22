'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { mentorsApi } from '@/lib/api/mentors';
import { contentApi } from '@/lib/api/content';
import { Mentor, Content } from '@/lib/api/types';
import { User, Globe, Briefcase } from 'lucide-react';

export default function MentorDetailPage() {
  const params = useParams();
  const mentorId = params.id as string;
  
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorData, contentData] = await Promise.all([
          mentorsApi.getMentor(mentorId),
          contentApi.getContent({ mentor_id: mentorId }),
        ]);
        setMentor(mentorData);
        setContent(contentData);
      } catch (error) {
        console.error('Failed to fetch mentor:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [mentorId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Skeleton className="h-48 w-full mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Mentor not found</h2>
        <Button asChild>
          <Link href="/mentors">Browse Mentors</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Mentor Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl mb-2">{mentor.user.fullName}</CardTitle>
              <CardDescription className="text-lg">{mentor.headline}</CardDescription>
            </div>
            <Badge variant="secondary">
              <Briefcase className="h-4 w-4 mr-1" />
              {mentor.experienceYears} years
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-muted-foreground whitespace-pre-line">{mentor.longBio}</p>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-semibold mb-2">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {mentor.areasOfExpertise?.map((area) => (
                <Badge key={area}>{area}</Badge>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {mentor.languages?.map((lang) => (
                  <Badge key={lang} variant="outline">
                    <Globe className="h-3 w-3 mr-1" />
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
            
            {Object.keys(mentor.socialLinks || {}).length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Social Links</h3>
                <div className="space-y-2">
                  {Object.entries(mentor.socialLinks).map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mentor's Content */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Courses & Frameworks by {mentor.full_name}</h2>
        
        {content.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">This mentor hasn't published any content yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">{item.content_type}</Badge>
                    <span className="text-sm font-semibold">${item.price}</span>
                  </div>
                  <CardTitle className="mt-2 line-clamp-2">{item.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/content/${item.id}`}>View Details</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
