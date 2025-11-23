'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Users, BookOpen, MessageSquare, Target, TrendingUp, Award, CheckCircle2, Heart, Lightbulb, Trophy, Sparkles, ChevronLeft, ChevronRight, Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { mentorsApi } from '@/lib/api/mentors';
import { contentApi } from '@/lib/api/content';
import { Mentor, Content } from '@/lib/api/types';
import { formatCurrency } from '@/lib/utils/currency';
import { CourseLearningCard } from '@/components/course-learning-card';

export default function HomePage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [courses, setCourses] = useState<Content[]>([]);
  const [mentorsPage, setMentorsPage] = useState(1);
  const [coursesPage, setCoursesPage] = useState(1);
  const [mentorsTotalPages, setMentorsTotalPages] = useState(1);
  const [coursesTotalPages, setCoursesTotalPages] = useState(1);
  const [isLoadingMentors, setIsLoadingMentors] = useState(true);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  
  const videoRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchMentors();
  }, [mentorsPage]);

  useEffect(() => {
    fetchCourses();
  }, [coursesPage]);

  // Intersection Observer for video autoplay
  useEffect(() => {
    const currentRef = videoRef.current;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVideoVisible(true);
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of video is visible
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const fetchMentors = async () => {
    try {
      setIsLoadingMentors(true);
      const response = await mentorsApi.getMentors({ page: mentorsPage, limit: ITEMS_PER_PAGE });
      setMentors(response.data || []);
      setMentorsTotalPages(Math.ceil((response.total || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Failed to fetch mentors:', error);
      setMentors([]);
    } finally {
      setIsLoadingMentors(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await contentApi.getContent({ page: coursesPage, limit: ITEMS_PER_PAGE });
      setCourses(response.data || []);
      setCoursesTotalPages(Math.ceil((response.total || 0) / ITEMS_PER_PAGE));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section - Gen-Z Bold */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 overflow-hidden animate-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <motion.div 
          className="absolute top-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"
          animate={{ 
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"
          animate={{ 
            y: [20, -20, 20],
            x: [10, -10, 10],
            scale: [1, 1.15, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <Badge className="mb-8 px-6 py-2.5 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
                Real talk from legends 🔥
              </Badge>
            </motion.div>
            <motion.h1 
              className="text-5xl font-black tracking-tight sm:text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.95]"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Level up with
              </motion.span>
              <br />
              <motion.span 
                className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent animate-gradient"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5, type: "spring", stiffness: 150 }}
              >
                people who've done it
              </motion.span>
            </motion.h1>
            <motion.p 
              className="mx-auto mt-8 max-w-2xl text-xl sm:text-2xl text-foreground/80 leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              Learn from CEOs, creators & legends. Get the playbooks. 
              <br className="hidden sm:block" />
              <motion.span 
                className="text-purple-600 dark:text-purple-400 font-bold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                Your growth era starts now.
              </motion.span>
            </motion.p>
            <motion.div 
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9, type: "spring", stiffness: 100 }}
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: [0, -1, 1, -1, 0] }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Button size="lg" className="text-lg px-10 py-7 h-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl font-bold group animate-glow-intense" asChild>
                  <Link href="/mentors">
                    Find your mentor <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 h-auto rounded-full border-3 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 font-bold" asChild>
                  <Link href="/content">Browse courses</Link>
                </Button>
              </motion.div>
            </motion.div>
            
            {/* Trust Indicators */}
            <motion.div 
              className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              {[
                { emoji: "✓", text: "Vetted legends", delay: 0 },
                { emoji: "🔥", text: "Proven playbooks", delay: 0.1 },
                { emoji: "💪", text: "Global community", delay: 0.2 }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-white/10 rounded-full shadow-soft backdrop-blur-sm"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20, 
                    delay: 1.3 + item.delay 
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: [0, -2, 2, -2, 0],
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.span 
                    className="text-2xl"
                    animate={{ rotate: [0, 10, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {item.emoji}
                  </motion.span>
                  <span className="font-semibold">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Showcase of Leaders & Mentors */}
      <section className="py-24 bg-gradient-to-b from-background to-purple-50/30 dark:to-purple-950/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
            >
              <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-lg">
                <Trophy className="w-4 h-4 mr-2 inline" />
                Meet the legends
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Learn from <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">icons & innovators</span>
            </motion.h2>
            <motion.p 
              className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Real people. Real success stories. Real wisdom.
            </motion.p>
          </motion.div>
          
          {/* Dynamic Mentor Grid */}
          {isLoadingMentors ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-36 w-36 mb-5 rounded-full bg-muted animate-pulse" />
                  <div className="h-5 w-24 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
              {mentors.map((mentor, i) => (
                <Link key={mentor.id} href={`/mentors/${mentor.user?.id || mentor.userId}`} prefetch={false}>
                  <motion.div 
                    className="flex flex-col items-center text-center group cursor-pointer"
                    initial={{ opacity: 0, y: 50, scale: 0.8 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      duration: 0.5, 
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 20
                    }}
                    whileHover={{ 
                      y: -10,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <motion.div 
                      className="relative h-36 w-36 mb-5 rounded-full overflow-hidden ring-4 ring-gradient-to-r from-purple-400 via-pink-400 to-orange-400 shadow-soft-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900"
                      whileHover={{ 
                        scale: 1.15,
                        rotate: 5,
                        boxShadow: "0 20px 60px rgba(168, 85, 247, 0.6)"
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      {(mentor.profileImageUrl || mentor.user?.avatarUrl) ? (
                        <Image
                          src={mentor.profileImageUrl || mentor.user.avatarUrl}
                          alt={mentor.user?.fullName || mentor.headline}
                          fill
                          className="object-cover"
                          sizes="144px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-purple-500 to-pink-500">
                          {getInitials(mentor.user?.fullName || mentor.headline)}
                        </div>
                      )}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-purple-600/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <motion.span
                          className="text-2xl"
                          initial={{ y: 10, opacity: 0 }}
                          whileHover={{ y: 0, opacity: 1 }}
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
                          🔥
                        </motion.span>
                      </motion.div>
                    </motion.div>
                    <motion.h3 
                      className="font-bold text-lg mb-1"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                    >
                      {mentor.user?.fullName || mentor.headline}
                    </motion.h3>
                    <motion.p 
                      className="text-sm text-foreground/60 font-medium line-clamp-2"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 + 0.4 }}
                    >
                      {mentor.headline || mentor.areasOfExpertise?.[0] || 'Mentor'}
                    </motion.p>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Mentors Pagination */}
          {!isLoadingMentors && mentorsTotalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMentorsPage(p => Math.max(1, p - 1))}
                disabled={mentorsPage === 1}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {mentorsPage} of {mentorsTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMentorsPage(p => Math.min(mentorsTotalPages, p + 1))}
                disabled={mentorsPage === mentorsTotalPages}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <motion.p 
            className="text-center text-lg font-semibold text-foreground/60 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            + hundreds more ready to share the real playbook 🚀
          </motion.p>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Button size="lg" className="rounded-full px-8 py-6 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl animate-glow-intense" asChild>
                <Link href="/mentors">
                  Meet your mentors <motion.span 
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Courses - Dynamic with Pagination */}
      <section className="py-24 bg-gradient-to-b from-background to-purple-50/30 dark:to-purple-950/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                <BookOpen className="w-4 h-4 mr-2 inline" />
                Featured Courses
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Learn the <motion.span 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >real playbook</motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Actionable courses from industry leaders
            </motion.p>
          </motion.div>

          {/* Dynamic Courses Grid */}
          {isLoadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-video rounded-xl bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted animate-pulse rounded w-16" />
                      <div className="h-6 bg-muted animate-pulse rounded w-20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.5, 
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 20
                  }}
                >
                  <CourseLearningCard content={course} priority={i < 3} />
                </motion.div>
              ))}
            </div>
          )}

          {/* Courses Pagination */}
          {!isLoadingCourses && coursesTotalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCoursesPage(p => Math.max(1, p - 1))}
                disabled={coursesPage === 1}
                className="rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                Page {coursesPage} of {coursesTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCoursesPage(p => Math.min(coursesTotalPages, p + 1))}
                disabled={coursesPage === coursesTotalPages}
                className="rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <motion.p 
            className="text-center text-lg font-semibold text-foreground/60 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            + more courses added weekly 📚
          </motion.p>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Button size="lg" className="rounded-full px-8 py-6 text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-xl animate-glow-intense" asChild>
                <Link href="/content">
                  Browse all courses <motion.span 
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works - Bold & Playful */}
      <section className="py-24 bg-gradient-to-b from-purple-50/30 via-pink-50/20 to-orange-50/30 dark:from-purple-950/10 dark:via-pink-950/5 dark:to-orange-950/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
                <Target className="w-4 h-4 mr-2 inline" />
                How it works
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              3 steps to <motion.span 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >level up</motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Simple. Real. Effective.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                icon: Users,
                gradient: "from-purple-500 via-pink-500 to-orange-500",
                badgeBg: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100",
                step: "Step 1",
                title: "Find your legend",
                description: "Browse by vibe, industry, expertise. Pick someone who's been where you wanna go.",
                emoji: "🔍"
              },
              {
                icon: BookOpen,
                gradient: "from-blue-500 via-cyan-500 to-teal-500",
                badgeBg: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
                step: "Step 2",
                title: "Learn the playbook",
                description: "Get their real frameworks, courses & insider tips. No fluff, just what works.",
                emoji: "📚"
              },
              {
                icon: Sparkles,
                gradient: "from-green-500 via-emerald-500 to-teal-500",
                badgeBg: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100",
                step: "Step 3",
                title: "Stay on track",
                description: "AI keeps you moving. Get reminders, answers & support 24/7.",
                emoji: "⚡"
              }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                className="relative"
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: i * 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <motion.div 
                  className="flex flex-col items-center text-center group cursor-pointer"
                  whileHover={{ y: -10 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <motion.div 
                    className={`w-20 h-20 bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center mb-8 shadow-soft-lg relative`}
                    whileHover={{ 
                      scale: 1.15,
                      rotate: 10,
                      boxShadow: "0 25px 50px -12px rgba(168, 85, 247, 0.5)"
                    }}
                    animate={{ 
                      y: [0, -5, 0],
                    }}
                    transition={{ 
                      y: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
                      scale: { type: "spring", stiffness: 300, damping: 15 },
                      rotate: { type: "spring", stiffness: 300, damping: 15 }
                    }}
                  >
                    <step.icon className="h-10 w-10 text-white" />
                    <motion.span
                      className="absolute -top-3 -right-3 text-2xl"
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4 + 0.5,
                        ease: "easeInOut"
                      }}
                    >
                      {step.emoji}
                    </motion.span>
                  </motion.div>
                  <div className="mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: i * 0.2 + 0.3 }}
                    >
                      <Badge className={`mb-5 px-4 py-1.5 text-sm font-bold ${step.badgeBg} border-0`}>{step.step}</Badge>
                    </motion.div>
                    <motion.h3 
                      className="text-2xl font-black mb-4"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 + 0.4 }}
                    >
                      {step.title}
                    </motion.h3>
                    <motion.p 
                      className="text-foreground/70 text-base leading-relaxed font-medium"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 + 0.5 }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions - Vibrant & Bold */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0 shadow-lg">
                <Heart className="w-4 h-4 mr-2 inline" />
                Why it hits different
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Learn from <motion.span 
                className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >lived experience</motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Real people. Real wins. Real wisdom you can actually use.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                gradient: "from-pink-500 to-orange-500",
                bgGradient: "from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30",
                title: "Real experience only",
                description: "No theory or BS. Just insights from people who've actually been there.",
                emoji: "💯"
              },
              {
                icon: BookOpen,
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
                title: "Proven playbooks",
                description: "The exact frameworks successful people use. Copy, adapt, win.",
                emoji: "📖"
              },
              {
                icon: TrendingUp,
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
                title: "Level up IRL",
                description: "Transform your career, business & life with guidance that actually works.",
                emoji: "📈"
              },
              {
                icon: Users,
                gradient: "from-purple-500 to-violet-500",
                bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
                title: "Find your tribe",
                description: "Connect with mentors who get it. People who've walked your path.",
                emoji: "👥"
              },
              {
                icon: Target,
                gradient: "from-amber-500 to-yellow-500",
                bgGradient: "from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30",
                title: "Stay locked in",
                description: "Get the accountability & support to actually follow through on your goals.",
                emoji: "🎯"
              },
              {
                icon: Lightbulb,
                gradient: "from-rose-500 to-pink-500",
                bgGradient: "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
                title: "Fresh perspectives",
                description: "See problems through the eyes of legends who've already solved them.",
                emoji: "💡"
              }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, rotateX: 45 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02,
                  transition: { type: "spring", stiffness: 400, damping: 15 }
                }}
              >
                <Card className={`border-0 bg-gradient-to-br ${value.bgGradient} shadow-soft-lg group cursor-pointer relative overflow-hidden h-full`}>
                  <CardHeader>
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${value.gradient} rounded-3xl flex items-center justify-center mb-5 shadow-lg relative`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    >
                      <value.icon className="h-8 w-8 text-white" />
                      <motion.span
                        className="absolute -top-2 -right-2 text-xl"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                          ease: "easeInOut"
                        }}
                      >
                        {value.emoji}
                      </motion.span>
                    </motion.div>
                    <CardTitle className="text-2xl font-black">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories - Social Vibes */}
      <section className="py-24 bg-gradient-to-b from-background to-emerald-50/30 dark:to-emerald-950/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Real wins
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              They did it. <motion.span 
                className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >You can too.</motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Real testimonials from the community 💬
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Kwame Asante",
                role: "Product Manager",
                achievement: "📍 Promoted in 6 months",
                initials: "KA",
                gradient: "from-orange-400 to-pink-500",
                borderColor: "border-orange-400",
                ringColor: "ring-orange-400",
                emojis: ["🔥", "💪"],
                testimonial: '"Learning from a CEO who actually built a product company gave me insights no course ever could. The mentorship hit different fr 💯"',
                rating: "Highly recommend"
              },
              {
                name: "Ama Mensah",
                role: "Startup Founder",
                achievement: "📍 Avoiding mistakes",
                initials: "AM",
                gradient: "from-blue-400 to-purple-500",
                borderColor: "border-blue-400",
                ringColor: "ring-blue-400",
                emojis: ["🚀", "💡"],
                testimonial: '"The frameworks from experienced founders saved me years of mistakes. Their lived experience is literally worth gold ✨"',
                rating: "Game changer"
              },
              {
                name: "Efua Osei",
                role: "Career Switcher",
                achievement: "📍 Landed dream role",
                initials: "EO",
                gradient: "from-green-400 to-emerald-500",
                borderColor: "border-green-400",
                ringColor: "ring-green-400",
                emojis: ["🎯", "👏"],
                testimonial: '"My mentor showed me exactly how they made their transition. I followed the playbook and landed my dream role. No cap 🙌"',
                rating: "Life changing"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: i * 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  y: -12,
                  scale: 1.03,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                }}
              >
                <Card className={`bg-white dark:bg-zinc-900 border-4 ${testimonial.borderColor} shadow-soft-lg relative overflow-hidden group cursor-pointer`}>
                  <motion.div 
                    className="absolute top-4 right-4 flex gap-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: i * 0.2 + 0.5, stiffness: 400, damping: 15 }}
                  >
                    {testimonial.emojis.map((emoji, ei) => (
                      <motion.span
                        key={ei}
                        className="text-2xl"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          y: [0, -3, 0]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3 + ei * 0.2,
                          ease: "easeInOut"
                        }}
                      >
                        {emoji}
                      </motion.span>
                    ))}
                  </motion.div>
                  <CardHeader>
                    <motion.div 
                      className="flex items-center gap-4 mb-4"
                      initial={{ x: -30, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 + 0.3 }}
                    >
                      <motion.div 
                        className={`h-20 w-20 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center ring-4 ${testimonial.ringColor} shadow-lg`}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 5
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <span className="text-3xl font-black text-white">{testimonial.initials}</span>
                      </motion.div>
                      <div>
                        <p className="font-black text-lg">{testimonial.name}</p>
                        <p className="text-sm text-foreground/60 font-semibold">{testimonial.role}</p>
                        <p className="text-xs text-foreground/50 mt-1">{testimonial.achievement}</p>
                      </div>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <motion.p 
                      className="text-foreground/80 text-base leading-relaxed font-medium mb-6"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 + 0.4 }}
                    >
                      {testimonial.testimonial}
                    </motion.p>
                    <motion.div 
                      className="flex gap-2 items-center"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 + 0.6 }}
                    >
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, si) => (
                          <motion.span
                            key={si}
                            className="text-xl"
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            viewport={{ once: true }}
                            transition={{ 
                              type: "spring",
                              delay: i * 0.2 + 0.7 + si * 0.1,
                              stiffness: 300,
                              damping: 15
                            }}
                          >
                            ⭐
                          </motion.span>
                        ))}
                      </div>
                      <span className="text-sm font-bold text-foreground/60">{testimonial.rating}</span>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Video Section - Watch & Learn */}
      <section 
        ref={videoRef}
        className="py-24 bg-gradient-to-b from-emerald-50/30 dark:from-emerald-950/10 to-background"
      >
        <div className="w-full px-0">
          <motion.div 
            className="text-center mb-16 px-4 sm:px-6 lg:px-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                <Play className="w-4 h-4 mr-2 inline" />
                Watch & Learn
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              See How It <motion.span 
                className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >Works</motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Get a sneak peek into the MentorVerse experience 🎥
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: 0.2
            }}
            className="relative w-full aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30"
          >
            <iframe
              key={isVideoVisible ? 'playing' : 'paused'}
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/Uz5BRjmbJ8E?autoplay=${isVideoVisible ? '1' : '0'}&mute=1&rel=0&modestbranding=1&playsinline=1`}
              title="MentorVerse Introduction"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            {!isVideoVisible && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-200 to-pink-200 dark:from-purple-900 dark:to-pink-900 pointer-events-none"
                initial={{ opacity: 1 }}
                animate={{ opacity: isVideoVisible ? 0 : 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Play className="w-24 h-24 text-white/80" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          <motion.p
            className="text-center text-sm text-foreground/60 mt-6 font-medium"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            💡 Video will play automatically when you scroll here
          </motion.p>
        </div>
      </section>

      {/* AI Section - Support Tool */}
      <section className="py-24 bg-gradient-to-b from-background to-cyan-50/30 dark:to-cyan-950/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg">
                <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
                Your study buddy
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              AI that <motion.span 
                className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >keeps you going</motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Your mentors bring the wisdom. AI helps you stay locked in 24/7.
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              {
                icon: MessageSquare,
                gradient: "from-blue-500 to-cyan-500",
                bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
                title: "Break it down",
                description: "Confused? AI explains mentor frameworks in simple terms you can actually understand.",
                emoji: "🧠"
              },
              {
                icon: CheckCircle2,
                gradient: "from-green-500 to-emerald-500",
                bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
                title: "Stay on track",
                description: "Reminders, check-ins & hype to keep you moving. No more falling off.",
                emoji: "✅"
              },
              {
                icon: Lightbulb,
                gradient: "from-purple-500 to-violet-500",
                bgGradient: "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
                title: "24/7 answers",
                description: "Got a Q at 2am? AI's always there when your mentor's offline.",
                emoji: "💬"
              },
              {
                icon: Target,
                gradient: "from-orange-500 to-amber-500",
                bgGradient: "from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30",
                title: "Make it yours",
                description: "AI connects mentor lessons to YOUR life. Personalized action plans that fit.",
                emoji: "🎯"
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  y: -8,
                  scale: 1.02
                }}
              >
                <Card className={`bg-gradient-to-br ${card.bgGradient} border-0 shadow-soft group cursor-pointer h-full`}>
                  <CardHeader>
                    <motion.div 
                      className="flex items-center gap-3"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div 
                        className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-lg relative`}
                        animate={{ 
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.4,
                          ease: "easeInOut"
                        }}
                        whileHover={{ 
                          scale: 1.1,
                          rotate: 10
                        }}
                      >
                        <card.icon className="h-7 w-7 text-white" />
                        <motion.span
                          className="absolute -top-1 -right-1 text-lg"
                          animate={{ 
                            scale: [1, 1.3, 1]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.3 + 0.5,
                            ease: "easeInOut"
                          }}
                        >
                          {card.emoji}
                        </motion.span>
                      </motion.div>
                      <CardTitle className="text-xl font-black">{card.title}</CardTitle>
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-foreground/70 font-medium">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <p className="text-center text-base text-foreground/60 mt-10 max-w-2xl mx-auto font-medium">
            Think of AI as your study buddy—not your mentor. Real growth comes from real people 💯
          </p>
        </div>
      </section>

      {/* For Mentors */}
      <section className="py-24 bg-gradient-to-b from-background to-purple-50/30 dark:to-purple-950/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            >
              <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                <Award className="w-4 h-4 mr-2 inline" />
                For leaders
              </Badge>
            </motion.div>
            <motion.h2 
              className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Share your story. <motion.span 
                className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >Build your legacy.</motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Turn your experience into impact (and income) 💰
            </motion.p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: Award,
                gradient: "from-purple-500 via-pink-500 to-orange-500",
                bgGradient: "from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
                title: "Monetize your wisdom",
                description: "Package your playbook into courses. Create once, earn forever.",
                emoji: "💰"
              },
              {
                icon: Users,
                gradient: "from-blue-500 via-cyan-500 to-teal-500",
                bgGradient: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
                title: "Scale your impact",
                description: "Reach thousands. No more trading hours for dollars.",
                emoji: "🚀"
              },
              {
                icon: TrendingUp,
                gradient: "from-green-500 via-emerald-500 to-teal-500",
                bgGradient: "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
                title: "Build your brand",
                description: "Become THE voice in your field. Grow your legend status.",
                emoji: "⭐"
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  delay: i * 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                whileHover={{ 
                  y: -10,
                  scale: 1.03
                }}
              >
                <Card className={`text-center border-0 bg-gradient-to-br ${card.bgGradient} shadow-soft-lg group cursor-pointer h-full`}>
                  <CardHeader>
                    <motion.div 
                      className={`w-20 h-20 bg-gradient-to-br ${card.gradient} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl relative`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5
                      }}
                      animate={{ 
                        y: [0, -5, 0]
                      }}
                      transition={{ 
                        y: { duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" },
                        scale: { type: "spring", stiffness: 300, damping: 15 },
                        rotate: { type: "spring", stiffness: 300, damping: 15 }
                      }}
                    >
                      <card.icon className="h-10 w-10 text-white" />
                      <motion.span
                        className="absolute -top-2 -right-2 text-2xl"
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.3 + 0.5,
                          ease: "easeInOut"
                        }}
                      >
                        {card.emoji}
                      </motion.span>
                    </motion.div>
                    <CardTitle className="text-2xl font-black">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                      {card.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="text-lg px-10 py-7 h-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl font-bold group animate-glow-intense" asChild>
                <Link href="/mentor/join">
                  Start sharing <motion.span 
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="relative py-32 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white overflow-hidden animate-gradient">
        <motion.div 
          className="absolute top-10 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-10 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          >
            <Badge className="mb-8 px-6 py-3 text-lg font-bold bg-white/20 backdrop-blur-sm text-white border-0 shadow-xl">
              <Sparkles className="w-5 h-5 mr-2 inline animate-pulse" />
              Your moment is now ⚡
            </Badge>
          </motion.div>
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Let's grow together
          </motion.h2>
          <motion.p 
            className="text-xl sm:text-2xl mb-12 font-semibold max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            Learn from legends. Get the playbook. Transform your life.
            <br />
            <motion.span 
              className="text-white/90"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              It's giving growth era 💅
            </motion.span>
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Button size="lg" className="text-lg px-12 py-8 h-auto rounded-full bg-white text-purple-600 hover:bg-gray-100 shadow-2xl font-black group" asChild>
                <Link href="/mentors">
                  Find your mentor <motion.span 
                    className="inline-block ml-2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <ArrowRight className="h-6 w-6" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Button size="lg" className="text-lg px-12 py-8 h-auto rounded-full border-4 border-white text-white hover:bg-white hover:text-purple-600 font-black" asChild>
                <Link href="/content">Browse courses</Link>
              </Button>
            </motion.div>
          </motion.div>
          <motion.p 
            className="mt-12 text-lg font-semibold"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            Join thousands already leveling up 🚀
          </motion.p>
        </div>
      </section>
    </div>
  );
}
