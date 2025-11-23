'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Content } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Users, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { motion } from 'framer-motion';

interface CourseLearningCardProps {
  content: Content;
  priority?: boolean;
}

export function CourseLearningCard({ content, priority = false }: CourseLearningCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasMedia = content.mediaUrl || content.thumbnailUrl;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link href={`/content/${content.id}`}>
      <motion.div
        className="group cursor-pointer h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 dark:border-zinc-800">
          {/* Course Thumbnail - 60% media */}
          <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900">
            {hasMedia && !imageError ? (
              <>
                <Image
                  src={content.thumbnailUrl || content.mediaUrl || ''}
                  alt={content.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={priority}
                  onError={() => setImageError(true)}
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            ) : (
              /* Professional fallback */
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-6xl opacity-10">
                  {content.contentType === 'course' ? '📚' : '✨'}
                </div>
              </div>
            )}

            {/* Price badge - top right */}
            <div className="absolute top-3 right-3">
              <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="font-bold text-sm">
                  {formatCurrency(
                    content.display_price || content.price,
                    content.display_currency || content.currency || 'USD'
                  )}
                </span>
              </div>
            </div>

            {/* Level badge - top left */}
            {content.level && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-xs capitalize">
                  {content.level}
                </Badge>
              </div>
            )}
          </div>

          {/* Content section - 40% */}
          <div className="p-5 flex-1 flex flex-col">
            {/* Mentor info */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                <AvatarImage src={content.mentor.avatarUrl} alt={content.mentor.fullName} />
                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-semibold">
                  {getInitials(content.mentor.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                  {content.mentor.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  Expert Mentor
                </p>
              </div>
            </div>

            {/* Course title */}
            <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-2 text-gray-900 dark:text-gray-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {content.title}
            </h3>

            {/* Description/tagline */}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
              {content.description || content.problemItSolves || 'Learn practical skills from industry experts'}
            </p>

            {/* Tags and metadata */}
            <div className="space-y-3 mt-auto">
              {/* Category tags */}
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="text-xs font-medium capitalize border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-400">
                  {content.contentType}
                </Badge>
                {content.tags?.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Bottom metadata */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {content.estimatedDuration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{content.estimatedDuration}</span>
                    </div>
                  )}
                </div>
                
                {/* Hover CTA */}
                <div className={`flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 transition-all ${
                  isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                }`}>
                  <span>View Details</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
