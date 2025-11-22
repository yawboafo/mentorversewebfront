import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Users, BookOpen, MessageSquare, Target, TrendingUp, Award, CheckCircle2, Heart, Lightbulb, Trophy, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Gen-Z Bold */}
      <section className="relative py-24 md:py-32 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950/30 dark:via-pink-950/30 dark:to-orange-950/30 overflow-hidden animate-gradient">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge className="mb-8 px-6 py-2.5 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
              Real talk from legends 🔥
            </Badge>
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl md:text-8xl lg:text-9xl mb-8 leading-[0.95]">
              Level up with
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent animate-gradient">
                people who've done it
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl sm:text-2xl text-foreground/80 leading-relaxed font-medium">
              Learn from CEOs, creators & legends. Get the playbooks. 
              <br className="hidden sm:block" />
              <span className="text-purple-600 dark:text-purple-400 font-bold">Your growth era starts now.</span>
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
              <Button size="lg" className="text-lg px-10 py-7 h-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold group" asChild>
                <Link href="/mentors">
                  Find your mentor <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-10 py-7 h-auto rounded-full border-3 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 font-bold hover:scale-105 transition-all duration-300" asChild>
                <Link href="/content">Browse courses</Link>
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="mt-20 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 text-base">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-white/10 rounded-full shadow-soft backdrop-blur-sm">
                <span className="text-2xl">✓</span>
                <span className="font-semibold">Vetted legends</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-white/10 rounded-full shadow-soft backdrop-blur-sm">
                <span className="text-2xl">🔥</span>
                <span className="font-semibold">Proven playbooks</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-white/10 rounded-full shadow-soft backdrop-blur-sm">
                <span className="text-2xl">💪</span>
                <span className="font-semibold">Global community</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase of Leaders & Mentors */}
      <section className="py-24 bg-gradient-to-b from-background to-purple-50/30 dark:to-purple-950/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-orange-500 to-pink-500 text-white border-0 shadow-lg">
              <Trophy className="w-4 h-4 mr-2 inline" />
              Meet the legends
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              Learn from <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">icons & innovators</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium">
              Real people. Real success stories. Real wisdom.
            </p>
          </div>
          
          {/* Example Mentor Grid - Prominent Ghanaian Leaders */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
            {[
              { name: 'Dr. Kwame Despite', role: 'Media Mogul & Entrepreneur', image: '/mentors/kwame-despite.jpg' },
              { name: 'Patricia Obo-Nai', role: 'CEO Vodafone Ghana', image: '/mentors/patricia-obo-nai-v2.jpg' },
              { name: 'Patrick Awuah', role: 'Founder, Ashesi University', image: '/mentors/Patrick_Awuah_(Ashesi).jpg' },
              { name: 'Alex Bram', role: 'Tech Pioneer & Developer', image: '/mentors/alex-bram.jpg' },
              { name: 'Sulley Muntari', role: 'Football Legend', image: '/mentors/SulleyMuntari.jpg' },
              { name: 'Sarkodie', role: 'Music Icon & Entrepreneur', image: '/mentors/sarkodie.jpg' },
            ].map((mentor, i) => (
              <div key={i} className="flex flex-col items-center text-center group cursor-pointer">
                <div className="relative h-36 w-36 mb-5 rounded-full overflow-hidden ring-4 ring-gradient-to-r from-purple-400 via-pink-400 to-orange-400 group-hover:ring-8 group-hover:scale-110 transition-all duration-300 shadow-soft-lg hover-lift bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
                  <Image
                    src={mentor.image}
                    alt={mentor.name}
                    fill
                    className="object-cover"
                    sizes="144px"
                    priority={i < 3}
                  />
                </div>
                <h3 className="font-bold text-lg mb-1">{mentor.name}</h3>
                <p className="text-sm text-foreground/60 font-medium">{mentor.role}</p>
              </div>
            ))}
          </div>
          
          <p className="text-center text-lg font-semibold text-foreground/60 mb-8">
            + hundreds more ready to share the real playbook 🚀
          </p>
          
          <div className="text-center">
            <Button size="lg" className="rounded-full px-8 py-6 text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:scale-105 transition-all" asChild>
              <Link href="/mentors">
                Meet your mentors <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works - Bold & Playful */}
      <section className="py-24 bg-gradient-to-b from-purple-50/30 via-pink-50/20 to-orange-50/30 dark:from-purple-950/10 dark:via-pink-950/5 dark:to-orange-950/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-lg">
              <Target className="w-4 h-4 mr-2 inline" />
              How it works
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              3 steps to <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">level up</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium">
              Simple. Real. Effective.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            <div className="relative">
              <div className="flex flex-col items-center text-center group hover-lift">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center mb-8 shadow-soft-lg group-hover:shadow-2xl transition-all animate-pulse-glow">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <div className="mb-4">
                  <Badge className="mb-5 px-4 py-1.5 text-sm font-bold bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-100 border-0">Step 1</Badge>
                  <h3 className="text-2xl font-black mb-4">Find your legend</h3>
                  <p className="text-foreground/70 text-base leading-relaxed font-medium">
                    Browse by vibe, industry, expertise. Pick someone who's been where you wanna go.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex flex-col items-center text-center group hover-lift">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl flex items-center justify-center mb-8 shadow-soft-lg group-hover:shadow-2xl transition-all">
                  <BookOpen className="h-10 w-10 text-white" />
                </div>
                <div className="mb-4">
                  <Badge className="mb-5 px-4 py-1.5 text-sm font-bold bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 border-0">Step 2</Badge>
                  <h3 className="text-2xl font-black mb-4">Learn the playbook</h3>
                  <p className="text-foreground/70 text-base leading-relaxed font-medium">
                    Get their real frameworks, courses & insider tips. No fluff, just what works.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="flex flex-col items-center text-center group hover-lift">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mb-8 shadow-soft-lg group-hover:shadow-2xl transition-all">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div className="mb-4">
                  <Badge className="mb-5 px-4 py-1.5 text-sm font-bold bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 border-0">Step 3</Badge>
                  <h3 className="text-2xl font-black mb-4">Stay on track</h3>
                  <p className="text-foreground/70 text-base leading-relaxed font-medium">
                    AI keeps you moving. Get reminders, answers & support 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions - Vibrant & Bold */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0 shadow-lg">
              <Heart className="w-4 h-4 mr-2 inline" />
              Why it hits different
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              Learn from <span className="bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">lived experience</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium">
              Real people. Real wins. Real wisdom you can actually use.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 bg-gradient-to-br from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30 hover-lift shadow-soft-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-black">Real experience only</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                  No theory or BS. Just insights from people who've actually been there.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover-lift shadow-soft-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-black">Proven playbooks</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                  The exact frameworks successful people use. Copy, adapt, win.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover-lift shadow-soft-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-black">Level up IRL</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                  Transform your career, business & life with guidance that actually works.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 hover-lift shadow-soft-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-black">Find your tribe</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                  Connect with mentors who get it. People who've walked your path.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 hover-lift shadow-soft-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-black">Stay locked in</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                  Get the accountability & support to actually follow through on your goals.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 hover-lift shadow-soft-lg">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl flex items-center justify-center mb-5 shadow-lg">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-black">Fresh perspectives</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                  See problems through the eyes of legends who've already solved them.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories - Social Vibes */}
      <section className="py-24 bg-gradient-to-b from-purple-50/40 via-pink-50/30 to-background dark:from-purple-950/20 dark:via-pink-950/10 dark:to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Real wins
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              They did it. <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">You can too.</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium">
              Real testimonials from the community 💬
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-zinc-900 border-4 border-orange-400 hover-lift shadow-soft-lg relative overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="text-2xl">🔥</span>
                <span className="text-2xl">💪</span>
              </div>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center ring-4 ring-orange-400 shadow-lg">
                    <span className="text-3xl font-black text-white">KA</span>
                  </div>
                  <div>
                    <p className="font-black text-lg">Kwame Asante</p>
                    <p className="text-sm text-foreground/60 font-semibold">Product Manager</p>
                    <p className="text-xs text-foreground/50 mt-1">📍 Promoted in 6 months</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-base leading-relaxed font-medium mb-6">
                  "Learning from a CEO who actually built a product company gave me insights no course ever could. The mentorship hit different fr 💯"
                </p>
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xl">⭐</span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-foreground/60">Highly recommend</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-zinc-900 border-4 border-blue-400 hover-lift shadow-soft-lg relative overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="text-2xl">🚀</span>
                <span className="text-2xl">💡</span>
              </div>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ring-4 ring-blue-400 shadow-lg">
                    <span className="text-3xl font-black text-white">AM</span>
                  </div>
                  <div>
                    <p className="font-black text-lg">Ama Mensah</p>
                    <p className="text-sm text-foreground/60 font-semibold">Startup Founder</p>
                    <p className="text-xs text-foreground/50 mt-1">📍 Avoiding mistakes</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-base leading-relaxed font-medium mb-6">
                  "The frameworks from experienced founders saved me years of mistakes. Their lived experience is literally worth gold ✨"
                </p>
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xl">⭐</span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-foreground/60">Game changer</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white dark:bg-zinc-900 border-4 border-green-400 hover-lift shadow-soft-lg relative overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-2">
                <span className="text-2xl">🎯</span>
                <span className="text-2xl">👏</span>
              </div>
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center ring-4 ring-green-400 shadow-lg">
                    <span className="text-3xl font-black text-white">EO</span>
                  </div>
                  <div>
                    <p className="font-black text-lg">Efua Osei</p>
                    <p className="text-sm text-foreground/60 font-semibold">Career Switcher</p>
                    <p className="text-xs text-foreground/50 mt-1">📍 Landed dream role</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-base leading-relaxed font-medium mb-6">
                  "My mentor showed me exactly how they made their transition. I followed the playbook and landed my dream role. No cap 🙌"
                </p>
                <div className="flex gap-2 items-center">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-xl">⭐</span>
                    ))}
                  </div>
                  <span className="text-sm font-bold text-foreground/60">Life changing</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Section - Support Tool */}
      <section className="py-24 bg-gradient-to-b from-background to-cyan-50/30 dark:to-cyan-950/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 shadow-lg">
              <Sparkles className="w-4 h-4 mr-2 inline animate-pulse" />
              Your study buddy
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black mb-6 leading-tight">
              AI that <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">keeps you going</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium">
              Your mentors bring the wisdom. AI helps you stay locked in 24/7.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border-0 hover-lift shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-black">Break it down</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium">
                  Confused? AI explains mentor frameworks in simple terms you can actually understand.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-0 hover-lift shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-black">Stay on track</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium">
                  Reminders, check-ins & hype to keep you moving. No more falling off.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-0 hover-lift shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Lightbulb className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-black">24/7 answers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium">
                  Got a Q at 2am? AI's always there when your mentor's offline.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-0 hover-lift shadow-soft">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl font-black">Make it yours</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium">
                  AI connects mentor lessons to YOUR life. Personalized action plans that fit.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-center text-base text-foreground/60 mt-10 max-w-2xl mx-auto font-medium">
            Think of AI as your study buddy—not your mentor. Real growth comes from real people 💯
          </p>
        </div>
      </section>

      {/* For Mentors */}
      <section className="py-24 bg-gradient-to-b from-background to-purple-50/30 dark:to-purple-950/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-6 px-5 py-2 text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
              <Award className="w-4 h-4 mr-2 inline" />
              For leaders
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 leading-tight">
              Share your story. <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Build your legacy.</span>
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto font-medium">
              Turn your experience into impact (and income) 💰
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-0 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 hover-lift shadow-soft-lg">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-black">Monetize your wisdom</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                  Package your playbook into courses. Create once, earn forever.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 hover-lift shadow-soft-lg">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-black">Scale your impact</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                  Reach thousands. No more trading hours for dollars.
                </CardDescription>
              </CardContent>
            </Card>
            
            <Card className="text-center border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 hover-lift shadow-soft-lg">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                  <TrendingUp className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-black">Build your brand</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-foreground/70 font-medium leading-relaxed">
                  Become THE voice in your field. Grow your legend status.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center">
            <Button size="lg" className="text-lg px-10 py-7 h-auto rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:scale-105 transition-all font-bold group" asChild>
              <Link href="/mentor/apply">
                Start sharing <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="relative py-32 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white overflow-hidden animate-gradient">
        <div className="absolute top-10 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative">
          <Badge className="mb-8 px-6 py-3 text-lg font-bold bg-white/20 backdrop-blur-sm text-white border-0 shadow-xl">
            <Sparkles className="w-5 h-5 mr-2 inline animate-pulse" />
            Your moment is now ⚡
          </Badge>
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-8 leading-tight">
            Let's grow together
          </h2>
          <p className="text-xl sm:text-2xl mb-12 font-semibold max-w-3xl mx-auto leading-relaxed">
            Learn from legends. Get the playbook. Transform your life.
            <br />
            <span className="text-white/90">It's giving growth era 💅</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button size="lg" className="text-lg px-12 py-8 h-auto rounded-full bg-white text-purple-600 hover:bg-gray-100 shadow-2xl hover:scale-110 transition-all font-black group" asChild>
              <Link href="/mentors">
                Find your mentor <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" className="text-lg px-12 py-8 h-auto rounded-full border-4 border-white text-white hover:bg-white hover:text-purple-600 font-black hover:scale-110 transition-all" asChild>
              <Link href="/content">Browse courses</Link>
            </Button>
          </div>
          <p className="mt-12 text-lg font-semibold">
            Join thousands already leveling up 🚀
          </p>
        </div>
      </section>
    </div>
  );
}
