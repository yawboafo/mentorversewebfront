'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { authApi } from '@/lib/api/auth';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Plus,
  Sparkles,
  Settings,
  UserCircle,
  Shield
} from 'lucide-react';
import { useState } from 'react';

interface NavLink {
  href: string;
  label: string;
  icon?: React.ElementType;
}

export function Navbar() {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authApi.logout();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActiveRoute = (href: string) => {
    if (href === '/') return pathname === '/';
    // Exact match for /dashboard to prevent matching /dashboard/mentors
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // Generate navigation links based on auth state and role
  const getNavLinks = (): NavLink[] => {
    if (!isAuthenticated) {
      // LOGGED OUT - Show public navigation
      return [
        { href: '/mentors', label: 'Mentors', icon: Users },
        { href: '/content', label: 'Courses', icon: BookOpen },
      ];
    }

    // LOGGED IN - Different menus based on role
    if (user?.role === 'admin') {
      // ADMIN - Full access
      return [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/mentors', label: 'Mentors', icon: Users },
        { href: '/content', label: 'Courses', icon: BookOpen },
        { href: '/ai/chat', label: 'AI Mentor', icon: MessageSquare },
        { href: '/admin', label: 'Admin', icon: Shield },
      ];
    }

    if (user?.role === 'mentor') {
      // MENTOR - Creator-focused navigation
      return [
        { href: '/mentor/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
        { href: '/mentor/mentees', label: 'My Mentees', icon: Users },
        { href: '/mentor/content', label: 'My Content', icon: BookOpen },
        { href: '/mentor/content/create', label: 'Create', icon: Plus },
        { href: '/mentors', label: 'Browse Mentors', icon: Users },
        { href: '/ai/chat', label: 'AI Mentor', icon: MessageSquare },
      ];
    }

    // NORMAL USER (mentee) - Learner navigation
    // Check if user registered as mentor but hasn't been approved yet
    if (user?.signup_intent === 'mentor') {
      const mentorStatus = user?.mentor_status || 'none';
      
      if (mentorStatus === 'pending_approval') {
        // Application pending - show status link
        return [
          { href: '/mentor/pending', label: 'Application Status', icon: LayoutDashboard },
          { href: '/mentors', label: 'Mentors', icon: Users },
          { href: '/content', label: 'Courses', icon: BookOpen },
          { href: '/ai/chat', label: 'AI Mentor', icon: MessageSquare },
        ];
      } else if (mentorStatus === 'none') {
        // Need to complete application
        return [
          { href: '/mentor/apply', label: 'Complete Application', icon: LayoutDashboard },
          { href: '/mentors', label: 'Mentors', icon: Users },
          { href: '/content', label: 'Courses', icon: BookOpen },
          { href: '/ai/chat', label: 'AI Mentor', icon: MessageSquare },
        ];
      }
    }
    
    // Regular user navigation
    const baseLinks = [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/mentors', label: 'My Mentors', icon: Users },
      { href: '/mentors', label: 'Browse Mentors', icon: Users },
      { href: '/content', label: 'Courses', icon: BookOpen },
      { href: '/ai/chat', label: 'AI Mentor', icon: MessageSquare },
    ];
    
    // Only show "Become a Mentor" for regular users (not mentor intent)
    if (user?.signup_intent !== 'mentor') {
      baseLinks.push({ href: '/mentor/join', label: 'Become a Mentor', icon: Sparkles });
    }
    
    return baseLinks;
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href={isAuthenticated ? (user?.role === 'mentor' ? '/mentor/dashboard' : '/dashboard') : '/'} 
              className="text-2xl font-bold text-primary hover:opacity-80 transition-opacity"
            >
              MentorVerse
            </Link>
            {user?.role && (
              <Badge variant="secondary" className="ml-3 hidden sm:inline-flex">
                {user.role === 'admin' ? 'Admin' : user.role === 'mentor' ? 'Mentor' : 'Learner'}
              </Badge>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isActiveRoute(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'text-foreground bg-accent' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className="w-fit mt-2">
                        {user.role === 'admin' ? 'Administrator' : user.role === 'mentor' ? 'Mentor' : 'Learner'}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Role-specific quick links */}
                  {user.role === 'mentor' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/mentor/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Mentor Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/mentor/mentees" className="cursor-pointer">
                          <Users className="mr-2 h-4 w-4" />
                          My Mentees
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/mentor/content/create" className="cursor-pointer">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Content
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {user.role === 'user' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          My Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/mentors" className="cursor-pointer">
                          <Users className="mr-2 h-4 w-4" />
                          My Mentors
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Log in</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="py-4 space-y-1">
              {/* User info for authenticated users */}
              {isAuthenticated && user && (
                <div className="px-4 py-3 mb-2 bg-accent/50 rounded-lg mx-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      <Badge variant="outline" className="mt-1">
                        {user.role === 'admin' ? 'Admin' : user.role === 'mentor' ? 'Mentor' : 'Learner'}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActiveRoute(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 text-base font-medium transition-colors ${
                      isActive 
                        ? 'text-foreground bg-accent' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {link.label}
                  </Link>
                );
              })}

              {/* Auth Actions */}
              {isAuthenticated && user ? (
                <div className="border-t mt-2 pt-2 space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCircle className="h-5 w-5" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    Log out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 border-t pt-4 mt-2 px-2">
                  <Button variant="outline" className="w-full justify-center" size="lg" asChild>
                    <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button className="w-full justify-center" size="lg" asChild>
                    <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
