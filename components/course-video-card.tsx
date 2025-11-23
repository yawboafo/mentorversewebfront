'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Content } from '@/lib/api/types';
import { Badge } from '@/components/ui/badge';
import { Play, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { motion } from 'framer-motion';

interface CourseVideoCardProps {
  content: Content;
  priority?: boolean;
  variant?: 'default' | 'featured';
}

export function CourseVideoCard({ content, priority = false, variant = 'default' }: CourseVideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isFeatured = variant === 'featured';
  const isVideo = content.mediaType === 'video';
  const hasMedia = content.mediaUrl || content.thumbnailUrl;

  return (
    <Link href={`/content/${content.id}`}>
      <motion.div
        className="group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: isFeatured ? 1.01 : 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {/* Thumbnail / Video Preview */}
        <div className={`
          relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 
          dark:from-purple-900/20 dark:via-pink-900/20 dark:to-orange-900/20
          ${isFeatured ? 'aspect-[16/9]' : 'aspect-video'}
          ${isHovered ? 'shadow-2xl' : 'shadow-md'}
          transition-shadow duration-300
        `}>
          {/* Media */}
          {hasMedia && !imageError ? (
            <div className="relative w-full h-full">
              <Image
                src={content.thumbnailUrl || content.mediaUrl || ''}
                alt={content.title}
                fill
                className="object-cover"
                priority={priority}
                onError={() => setImageError(true)}
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          ) : (
            /* Fallback gradient */
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-20">
                {content.contentType === 'course' ? '🎓' : '✨'}
              </div>
            </div>
          )}

          {/* Play Icon Overlay (for videos) */}
          {isVideo && (
            <motion.div 
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1 }}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border-2 border-white/80">
                <Play className="h-8 w-8 md:h-10 md:w-10 fill-white text-white ml-1" />
              </div>
            </motion.div>
          )}

          {/* Duration Badge (top right) */}
          {content.estimatedDuration && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-md text-xs md:text-sm font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {content.estimatedDuration}
            </div>
          )}

          {/* New Badge (top left) */}
          {isContentNew(content.createdAt) && (
            <div className="absolute top-2 left-2 md:top-3 md:left-3">
              <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs">
                NEW
              </Badge>
            </div>
          )}
        </div>

        {/* Content Info */}
        <div className={`${isFeatured ? 'mt-4' : 'mt-3'} space-y-2`}>
          {/* Title & Mentor */}
          <div>
            <h3 className={`
              font-bold line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors
              ${isFeatured ? 'text-xl md:text-2xl' : 'text-base md:text-lg'}
            `}>
              {content.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              by {content.mentor.fullName}
            </p>
          </div>

          {/* Price, Level, Tags */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Price */}
            <div className={`
              font-bold
              ${isFeatured ? 'text-xl' : 'text-lg'}
            `}>
              {formatCurrency(
                content.display_price || content.price,
                content.display_currency || content.currency || 'USD'
              )}
            </div>

            {/* Level Badge */}
            {content.level && (
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs capitalize">
                {content.level}
              </Badge>
            )}

            {/* Tags (show 2-3) */}
            {content.tags?.slice(0, isFeatured ? 3 : 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Description (featured only) */}
          {isFeatured && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {content.description}
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

// Helper to determine if content is new (created within last 7 days)
function isContentNew(createdAt: string): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return daysDiff <= 7;
}
