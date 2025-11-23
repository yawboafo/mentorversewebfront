'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mentor } from '@/lib/api/types';
import { 
  Briefcase, 
  Award, 
  Users, 
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MentorProfileCardProps {
  mentor: Mentor;
  priority?: boolean;
  featured?: boolean;
  compact?: boolean;
}

export function MentorProfileCard({ mentor, priority = false, featured = false, compact = false }: MentorProfileCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getExperienceLevel = (years: number) => {
    if (years >= 15) return { label: 'Industry Leader', color: 'text-amber-600 dark:text-amber-400' };
    if (years >= 10) return { label: '10+ Years Experience', color: 'text-blue-600 dark:text-blue-400' };
    if (years >= 5) return { label: '5+ Years Experience', color: 'text-emerald-600 dark:text-emerald-400' };
    return { label: 'Experienced Professional', color: 'text-primary' };
  };

  const experienceLevel = getExperienceLevel(mentor.experienceYears || 0);
  const mentorName = mentor.user?.fullName || 'Mentor';
  const mentorTitle = mentor.headline || 'Professional Mentor';
  const mentorBio = mentor.shortBio || mentor.longBio || 'Helping others achieve their goals through personalized mentorship and guidance.';

  return (
    <Link href={`/mentors/${mentor.user?.id || mentor.userId}`} className="group block h-full">
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="relative h-full overflow-hidden rounded-2xl border border-border/50 bg-card shadow-soft transition-all duration-300 hover:shadow-soft-lg"
      >
        {/* Verified Badge - Floating */}
        {mentor.isVerified && (
          <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-soft backdrop-blur-sm">
            <CheckCircle2 className="h-3.5 w-3.5 fill-white" />
            Verified
          </div>
        )}

        {/* Mentor Image Section - Premium & Human-Centered */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 px-8 pb-6 pt-8">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(139,92,246,0.4),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(147,197,253,0.3),transparent_70%)]" />
          </div>

          {/* Large Circular Avatar - The Human Touch */}
          <div className="relative mx-auto w-fit">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Avatar className="relative h-32 w-32 border-4 border-background shadow-soft-lg ring-1 ring-border/10">
                <AvatarImage 
                  src={mentor.profileImageUrl || mentor.user?.avatarUrl || undefined}
                  alt={mentorName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary via-accent to-secondary text-3xl font-bold text-primary-foreground">
                  {getInitials(mentorName)}
                </AvatarFallback>
              </Avatar>
            </motion.div>
          </div>
        </div>

        {/* Content Section - Clean & Spacious */}
        <div className="space-y-4 p-6">
          {/* Name & Title */}
          <div className="space-y-1.5 text-center">
            <h3 className="text-xl font-bold leading-tight tracking-tight transition-colors group-hover:text-primary">
              {mentorName}
            </h3>
            <p className="text-sm font-medium text-muted-foreground">
              {mentorTitle}
            </p>
          </div>

          {/* Bio Tagline - One Sentence Max */}
          <p className="line-clamp-2 text-center text-sm leading-relaxed text-muted-foreground">
            {mentorBio}
          </p>

          {/* Experience Level Badge - Premium Styling */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium ${experienceLevel.color}`}>
              <Award className="h-3.5 w-3.5" />
              {experienceLevel.label}
            </div>
          </div>

          {/* Expertise Pills - Gen Z Minimal */}
          {mentor.areasOfExpertise && mentor.areasOfExpertise.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {mentor.areasOfExpertise.slice(0, 3).map((area, idx) => (
                <Badge 
                  key={idx}
                  variant="secondary"
                  className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/80"
                >
                  {area}
                </Badge>
              ))}
              {mentor.areasOfExpertise.length > 3 && (
                <Badge 
                  variant="outline" 
                  className="rounded-full px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  +{mentor.areasOfExpertise.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Stats Row - Subtle Social Proof */}
          <div className="flex items-center justify-center gap-6 border-t border-border/50 pt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span className="font-medium">{mentor.experienceYears || 0}+ years</span>
            </div>
            {mentor.status === 'active' && (
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-medium">Active</span>
              </div>
            )}
          </div>

          {/* CTA - Subtle & Premium */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all group-hover:gap-2">
              <span>View Profile</span>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
