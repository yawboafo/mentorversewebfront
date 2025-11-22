'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Rocket, 
  Globe, 
  Users, 
  Award, 
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  MessageSquare,
  Target,
  Star,
  Shield,
  Plus,
  X
} from 'lucide-react';
import { mentorsApi } from '@/lib/api/mentors';
import { toast } from 'sonner';

const expertiseOptions = [
  'Web Development', 'Mobile Development', 'AI/ML', 'Data Science',
  'DevOps', 'Cloud Computing', 'Cybersecurity', 'UI/UX Design',
  'Product Management', 'Business Strategy', 'Marketing', 'Sales',
  'Leadership', 'Career Development', 'Public Speaking', 'Writing'
];

const languageOptions = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Portuguese', 'Hindi', 'Other'];

export default function MentorApplyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [customExpertise, setCustomExpertise] = useState('');
  
  const [formData, setFormData] = useState({
    headline: '',
    short_bio: '',
    long_bio: '',
    areas_of_expertise: [] as string[],
    experience_years: 0,
    languages: [] as string[],
    social_links: {
      linkedin: '',
      twitter: '',
      website: '',
      github: ''
    }
  });

  const toggleExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      areas_of_expertise: prev.areas_of_expertise.includes(expertise)
        ? prev.areas_of_expertise.filter(e => e !== expertise)
        : [...prev.areas_of_expertise, expertise]
    }));
  };

  const addCustomExpertise = () => {
    if (customExpertise.trim() && !formData.areas_of_expertise.includes(customExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        areas_of_expertise: [...prev.areas_of_expertise, customExpertise.trim()]
      }));
      setCustomExpertise('');
    }
  };

  const removeExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      areas_of_expertise: prev.areas_of_expertise.filter(e => e !== expertise)
    }));
  };

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.areas_of_expertise.length === 0) {
      setError('Please select at least one area of expertise');
      return;
    }

    if (formData.languages.length === 0) {
      setError('Please select at least one language');
      return;
    }

    setIsLoading(true);

    try {
      await mentorsApi.applyToBecomeMentor(formData);
      toast.success('Application submitted successfully! 🎉');
      
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit application. Please try again.');
      toast.error('Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    { icon: TrendingUp, title: 'Earn While You Share', description: 'Set your own rates and earn from mentorship sessions' },
    { icon: Users, title: 'Build Your Community', description: 'Connect with motivated learners globally' },
    { icon: Award, title: 'Establish Authority', description: 'Become a recognized expert in your field' },
    { icon: Globe, title: 'Flexible Schedule', description: 'Mentor on your own time, from anywhere' }
  ];

  const steps = [
    { number: 1, title: 'Basic Info', icon: Briefcase },
    { number: 2, title: 'Expertise', icon: Target },
    { number: 3, title: 'Social Links', icon: Globe }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-block mb-4"
          >
            <Badge variant="secondary" className="gap-2 px-4 py-2 text-base">
              <Sparkles className="h-5 w-5" />
              Join Our Mentor Community ✨
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent"
          >
            Become a Mentor 🚀
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Share your expertise, inspire the next generation, and earn while making an impact
          </motion.p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="h-full border-2 hover:border-purple-500 transition-all backdrop-blur-sm bg-white/80">
                <CardContent className="pt-6 text-center">
                  <div className="mb-4 inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <benefit.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Application Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-2xl backdrop-blur-xl bg-white/90">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Mentor Application
                </CardTitle>
                <Badge variant="outline" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Reviewed in 48hrs
                </Badge>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-4 pt-4">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <motion.div
                      className={`flex items-center gap-3 ${
                        currentStep >= step.number ? 'opacity-100' : 'opacity-40'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                        currentStep >= step.number
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {currentStep > step.number ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <step.icon className="h-5 w-5" />
                        )}
                      </div>
                      <span className="hidden md:inline font-semibold">{step.title}</span>
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 md:w-24 h-1 mx-2 rounded ${
                        currentStep > step.number ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 pb-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="headline" className="text-base font-semibold">
                        Professional Headline *
                      </Label>
                      <Input
                        id="headline"
                        placeholder="e.g., Senior Software Engineer | AI/ML Specialist"
                        value={formData.headline}
                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                        required
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="short_bio" className="text-base font-semibold">
                        Short Bio (150 characters) *
                      </Label>
                      <Textarea
                        id="short_bio"
                        placeholder="A brief introduction about yourself..."
                        value={formData.short_bio}
                        onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                        required
                        maxLength={150}
                        className="text-base resize-none"
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground text-right">
                        {formData.short_bio.length}/150
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="long_bio" className="text-base font-semibold">
                        Detailed Bio *
                      </Label>
                      <Textarea
                        id="long_bio"
                        placeholder="Share your journey, experience, and what you're passionate about teaching..."
                        value={formData.long_bio}
                        onChange={(e) => setFormData({ ...formData, long_bio: e.target.value })}
                        required
                        className="text-base resize-none"
                        rows={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience_years" className="text-base font-semibold">
                        Years of Experience *
                      </Label>
                      <Input
                        id="experience_years"
                        type="number"
                        min="0"
                        placeholder="e.g., 5"
                        value={formData.experience_years || ''}
                        onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                        required
                        className="h-12 text-base"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Expertise & Languages */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        Areas of Expertise * (Select at least one)
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {expertiseOptions.map((expertise) => (
                          <motion.button
                            key={expertise}
                            type="button"
                            onClick={() => toggleExpertise(expertise)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.areas_of_expertise.includes(expertise)
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {expertise}
                            {formData.areas_of_expertise.includes(expertise) && (
                              <CheckCircle2 className="inline-block ml-2 h-4 w-4" />
                            )}
                          </motion.button>
                        ))}
                      </div>

                      {/* Custom Expertise */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add custom expertise..."
                          value={customExpertise}
                          onChange={(e) => setCustomExpertise(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomExpertise())}
                          className="h-10"
                        />
                        <Button type="button" onClick={addCustomExpertise} size="sm" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Selected Custom Expertise */}
                      {formData.areas_of_expertise.filter(e => !expertiseOptions.includes(e)).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.areas_of_expertise.filter(e => !expertiseOptions.includes(e)).map((expertise) => (
                            <Badge key={expertise} variant="secondary" className="gap-2">
                              {expertise}
                              <button
                                type="button"
                                onClick={() => removeExpertise(expertise)}
                                className="hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        Languages * (Select at least one)
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {languageOptions.map((language) => (
                          <motion.button
                            key={language}
                            type="button"
                            onClick={() => toggleLanguage(language)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                              formData.languages.includes(language)
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {language}
                            {formData.languages.includes(language) && (
                              <CheckCircle2 className="inline-block ml-2 h-4 w-4" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Social Links */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <p className="text-sm text-muted-foreground">
                      Share your social profiles to help learners connect with you (optional)
                    </p>

                    <div className="space-y-2">
                      <Label htmlFor="linkedin" className="text-base font-semibold">
                        LinkedIn Profile
                      </Label>
                      <Input
                        id="linkedin"
                        type="url"
                        placeholder="https://linkedin.com/in/yourprofile"
                        value={formData.social_links.linkedin}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, linkedin: e.target.value }
                        })}
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="twitter" className="text-base font-semibold">
                        Twitter/X Profile
                      </Label>
                      <Input
                        id="twitter"
                        type="url"
                        placeholder="https://twitter.com/yourhandle"
                        value={formData.social_links.twitter}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, twitter: e.target.value }
                        })}
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="github" className="text-base font-semibold">
                        GitHub Profile
                      </Label>
                      <Input
                        id="github"
                        type="url"
                        placeholder="https://github.com/yourusername"
                        value={formData.social_links.github}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, github: e.target.value }
                        })}
                        className="h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-base font-semibold">
                        Personal Website
                      </Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={formData.social_links.website}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, website: e.target.value }
                        })}
                        className="h-12 text-base"
                      />
                    </div>
                  </motion.div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col md:flex-row gap-4 pt-6 pb-8">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="w-full md:w-auto"
                  >
                    ← Previous
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="w-full md:flex-1 h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full md:flex-1">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 gap-2"
                    >
                      {isLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            🚀
                          </motion.div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <Star className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Your application will be reviewed by our team within 48 hours</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
