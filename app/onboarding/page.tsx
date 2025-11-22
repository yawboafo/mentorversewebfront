'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useAuth } from '@/hooks/use-auth';
import { onboardingApi } from '@/lib/api/onboarding';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const GOAL_OPTIONS = [
  'Career advancement',
  'Skill development',
  'Business growth',
  'Personal transformation',
  'Leadership development',
  'Work-life balance',
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Individual onboarding state
  const [individualData, setIndividualData] = useState({
    goals: [] as string[],
    custom_goal: '',
    primary_focus: 'career' as 'career' | 'business' | 'mindset' | 'lifestyle' | 'other',
    current_challenges: '',
    experience_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
  });

  // Business onboarding state
  const [businessData, setBusinessData] = useState({
    business_name: '',
    industry: '',
    company_size: '',
    description: '',
    main_challenge: '',
    location: '',
  });

  useEffect(() => {
    console.log('📋 Onboarding page - user:', user?.email, 'onboarding_completed:', user?.onboarding_completed, 'authLoading:', authLoading);
    
    if (user && user.onboarding_completed) {
      console.log('✅ Onboarding already completed, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, router, authLoading]);

  const toggleGoal = (goal: string) => {
    if (individualData.goals.includes(goal)) {
      setIndividualData({
        ...individualData,
        goals: individualData.goals.filter(g => g !== goal),
      });
    } else {
      setIndividualData({
        ...individualData,
        goals: [...individualData.goals, goal],
      });
    }
  };

  const handleIndividualSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      const goals = [...individualData.goals];
      if (individualData.custom_goal) {
        goals.push(individualData.custom_goal);
      }

      await onboardingApi.submitIndividual({
        goals,
        primary_focus: individualData.primary_focus,
        current_challenges: individualData.current_challenges,
        experience_level: individualData.experience_level,
      });

      console.log('✅ Onboarding submitted successfully, refreshing user...');
      
      // Refresh user data to update onboarding_completed flag
      await refreshUser();
      
      toast.success('Onboarding completed! 🎉');
      
      // Use window.location.href for full page reload to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
      setIsLoading(false);
    }
  };

  const handleBusinessSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      await onboardingApi.submitBusiness(businessData);
      
      console.log('✅ Business onboarding submitted successfully, refreshing user...');
      
      // Refresh user data to update onboarding_completed flag
      await refreshUser();
      
      toast.success('Onboarding completed! 🎉');
      
      // Use window.location.href for full page reload to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
      setIsLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isIndividual = user.account_type === 'individual';
  const totalSteps = 4;

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to MentorVerse</CardTitle>
          <CardDescription>
            Let's personalize your experience
            {!isIndividual && ' for your business'}
          </CardDescription>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-secondary h-2 rounded-full">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isIndividual ? (
            <>
              {/* Individual Step 1: Goals */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">What are your goals?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select all that apply
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {GOAL_OPTIONS.map((goal) => (
                        <Button
                          key={goal}
                          type="button"
                          variant={individualData.goals.includes(goal) ? 'default' : 'outline'}
                          onClick={() => toggleGoal(goal)}
                          className="h-auto py-3 justify-start"
                        >
                          {goal}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom_goal">Other (optional)</Label>
                    <Input
                      id="custom_goal"
                      placeholder="Add your own goal"
                      value={individualData.custom_goal}
                      onChange={(e) => setIndividualData({ ...individualData, custom_goal: e.target.value })}
                    />
                  </div>
                  <div className="w-full mt-6">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={individualData.goals.length === 0 && !individualData.custom_goal}
                      className="w-full"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Individual Step 2: Primary Focus */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">What's your primary focus area?</h3>
                    <Select
                      value={individualData.primary_focus}
                      onValueChange={(value: any) => setIndividualData({ ...individualData, primary_focus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="mindset">Mindset</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={() => setStep(3)} className="w-full">
                      Continue
                    </Button>
                    <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {/* Individual Step 3: Challenges */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">What are your current challenges?</h3>
                    <Textarea
                      placeholder="Tell us about the challenges you're facing..."
                      rows={5}
                      value={individualData.current_challenges}
                      onChange={(e) => setIndividualData({ ...individualData, current_challenges: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setStep(4)}
                      disabled={!individualData.current_challenges.trim()}
                      className="w-full"
                    >
                      Continue
                    </Button>
                    <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {/* Individual Step 4: Experience Level */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">What's your experience level?</h3>
                    <Select
                      value={individualData.experience_level}
                      onValueChange={(value: any) => setIndividualData({ ...individualData, experience_level: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                        <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                        <SelectItem value="advanced">Advanced - Experienced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Button onClick={handleIndividualSubmit} className="w-full" disabled={isLoading}>
                      {isLoading ? 'Completing...' : 'Complete Onboarding'}
                    </Button>
                    <Button variant="outline" onClick={() => setStep(3)} className="w-full" disabled={isLoading}>
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Business Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input
                      id="business_name"
                      value={businessData.business_name}
                      onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={businessData.industry}
                      onChange={(e) => setBusinessData({ ...businessData, industry: e.target.value })}
                      required
                    />
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!businessData.business_name || !businessData.industry}
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Business Step 2: Company Size & Location */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company Size</Label>
                    <Select
                      value={businessData.company_size}
                      onValueChange={(value) => setBusinessData({ ...businessData, company_size: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={businessData.location}
                      onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!businessData.company_size || !businessData.location}
                      className="w-full"
                    >
                      Continue
                    </Button>
                    <Button variant="outline" onClick={() => setStep(1)} className="w-full">
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {/* Business Step 3: Description */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Business Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your business..."
                      rows={5}
                      value={businessData.description}
                      onChange={(e) => setBusinessData({ ...businessData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setStep(4)}
                      disabled={!businessData.description.trim()}
                      className="w-full"
                    >
                      Continue
                    </Button>
                    <Button variant="outline" onClick={() => setStep(2)} className="w-full">
                      Back
                    </Button>
                  </div>
                </div>
              )}

              {/* Business Step 4: Main Challenge */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="main_challenge">Main Challenge</Label>
                    <Textarea
                      id="main_challenge"
                      placeholder="What's the biggest challenge your business is facing?"
                      rows={5}
                      value={businessData.main_challenge}
                      onChange={(e) => setBusinessData({ ...businessData, main_challenge: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Button
                      onClick={handleBusinessSubmit}
                      disabled={!businessData.main_challenge.trim() || isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Completing...' : 'Complete Onboarding'}
                    </Button>
                    <Button variant="outline" onClick={() => setStep(3)} className="w-full" disabled={isLoading}>
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
