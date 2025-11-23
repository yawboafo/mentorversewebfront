'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mentor } from '@/lib/api/types';
import { 
  Briefcase, 
  Award, 
  Users, 
  Star, 
  BookmarkPlus, 
  Bookmark,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MentorProfileCardProps {
  mentor: Mentor;
  priority?: boolean;
  featured?: boolean;
}

export function MentorProfileCard({ mentor, priority = false, featured = false }: MentorProfileCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getExperienceBadge = (years: number) => {
    if (years >= 15) return { label: 'Industry Leader', icon: Award, color: 'text-amber-600 dark:text-amber-400' };
    if (years >= 10) return { label: '10+ Years', icon: TrendingUp, color: 'text-blue-600 dark:text-blue-400' };
    if (years >= 5) return { label: '5+ Years', icon: Briefcase, color: 'text-green-600 dark:text-green-400' };
    return { label: 'Experienced', icon: Briefcase, color: 'text-gray-600 dark:text-gray-400' };
  };

  const experienceBadge = getExperienceBadge(mentor.experienceYears || 0);
  const ExperienceIcon = experienceBadge.icon;

  return (
    <Link href={`/mentors/${mentor.user?.id || mentor.userId}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`group ${featured ? 'md:col-span-2' : ''}`}
      >
        <Card className={`
          overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-300
          bg-white dark:bg-zinc-900
          ${featured ? 'md:flex md:flex-row' : ''}
        `}>
          <CardContent className={`p-0 ${featured ? 'md:flex md:w-full' : ''}`}>
            {/* Hero Image Section */}
            <div className={`
              relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 
              dark:from-orange-950/20 dark:via-amber-950/20 dark:to-orange-900/20
              ${featured ? 'md:w-2/5 aspect-[4/5] md:aspect-auto' : 'aspect-[4/5]'}
            `}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(251,146,60,0.3),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,158,11,0.2),transparent_50%)]" />
              </div>

              {/* Mentor Photo */}
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                  <Avatar className={`
                    relative border-4 border-white dark:border-zinc-800 shadow-2xl
                    ${featured ? 'h-48 w-48 lg:h-56 lg:w-56' : 'h-40 w-40 sm:h-44 sm:w-44'}
                  `}>
                    <AvatarImage 
                      src={mentor.profileImageUrl || mentor.user?.avatarUrl || undefined}
                      alt={mentor.user?.fullName || mentor.headline}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                      {getInitials(mentor.user?.fullName || mentor.headline)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </div>

              {/* Verified Badge */}
              {mentor.isVerified && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold shadow-lg">
                  <CheckCircle2 className="h-3.5 w-3.5 fill-white" />
                  Verified
                </div>
              )}

              {/* Bookmark Button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsBookmarked(!isBookmarked);
                }}
                className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors"
              >
                {isBookmarked ? (
                  <Bookmark className="h-4 w-4 fill-orange-600 text-orange-600" />
                ) : (
                  <BookmarkPlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>

            {/* Content Section */}
            <div className={`p-6 ${featured ? 'md:w-3/5 md:flex md:flex-col md:justify-between' : ''}`}>
              {/* Header */}
              <div className="mb-4">
                <h3 className={`
                  font-bold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1
                  group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors
                  ${featured ? 'text-2xl' : 'text-xl'}
                `}>
                  {mentor.user?.fullName || 'Mentor'}
                </h3>
                
                {/* Title/Role */}
                {mentor.headline && (
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                    {mentor.headline}
                  </p>
                )}

                {/* Primary Expertise */}
                {mentor.areasOfExpertise?.[0] && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {mentor.areasOfExpertise[0]}
                  </p>
                )}
              </div>

              {/* Bio Preview (shown on hover or if featured) */}
              <motion.div
                initial={false}
                animate={{ 
                  height: (isHovered || featured) ? 'auto' : 0,
                  opacity: (isHovered || featured) ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mb-4"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                  {mentor.shortBio || mentor.longBio || 'Experienced professional dedicated to helping others achieve their goals through personalized mentorship and guidance.'}
                </p>
              </motion.div>

              {/* Winning Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Experience Badge */}
                <Badge 
                  variant="outline" 
                  className={`${experienceBadge.color} border-current bg-current/5 flex items-center gap-1`}
                >
                  <ExperienceIcon className="h-3 w-3" />
                  {experienceBadge.label}
                </Badge>

                {/* Active Status */}
                {mentor.status === 'active' && (
                  <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-950/20 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-green-600 dark:fill-green-400" />
                    Active
                  </Badge>
                )}
              </div>

              {/* Expertise Tags (more detailed on hover) */}
              <motion.div
                initial={false}
                animate={{ 
                  height: isHovered ? 'auto' : 'auto',
                  opacity: 1
                }}
                className="mb-4"
              >
                <div className="flex flex-wrap gap-1.5">
                  {mentor.areasOfExpertise?.slice(0, isHovered ? 5 : 3).map((area, idx) => (
                    <Badge 
                      key={idx}
                      variant="secondary"
                      className="text-xs bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      {area}
                    </Badge>
                  ))}
                  {(mentor.areasOfExpertise?.length || 0) > (isHovered ? 5 : 3) && (
                    <Badge 
                      variant="outline" 
                      className="text-xs text-gray-500 dark:text-gray-500"
                    >
                      +{(mentor.areasOfExpertise?.length || 0) - (isHovered ? 5 : 3)}
                    </Badge>
                  )}
                </div>
              </motion.div>

              {/* Bottom Section */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-zinc-800">
                {/* Engagement Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    <span className="font-medium">
                      {mentor.experienceYears}+ years
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  size="sm"
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  View Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}
