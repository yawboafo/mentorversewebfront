'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { mentorSubscriptionsApi } from '@/lib/api/mentor-subscriptions';
import { MentorSettings, MentorAccessType, BillingPeriod } from '@/lib/api/types';
import { toast } from 'sonner';
import { ArrowLeft, Save, DollarSign, Crown, Sparkles, MessageCircle, Video, Users, BookOpen, AlertCircle } from 'lucide-react';

export default function MentorSubscriptionSettingsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useRequireAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<MentorSettings>>({
    accessType: MentorAccessType.OPEN,
    baseSubscriptionPrice: 0,
    currency: 'USD',
    billingPeriod: BillingPeriod.MONTHLY,
    offersCourses: true,
    offers1to1Sessions: true,
    offersGroupSessions: false,
    allowsMessaging: true,
    messageLimitPerPeriod: undefined,
    isActive: true,
  });

  useEffect(() => {
    if (user && user.role !== 'mentor') {
      toast.error('Only mentors can access this page');
      router.push('/dashboard');
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await mentorSubscriptionsApi.getMentorSettings();
        setSettings(response.data);
      } catch (error: any) {
        // If no settings exist yet, keep the defaults
        if (error.status !== 404) {
          console.error('Failed to fetch settings:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSettings();
    }
  }, [user, router]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Validation
      if (settings.accessType !== MentorAccessType.OPEN && (!settings.baseSubscriptionPrice || settings.baseSubscriptionPrice <= 0)) {
        toast.error('Please set a valid subscription price for paid access');
        return;
      }

      await mentorSubscriptionsApi.updateMentorSettings(settings as MentorSettings);
      toast.success('Subscription settings saved successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold mb-2">Subscription Settings</h1>
          <p className="text-lg text-muted-foreground">
            Configure how mentees can access your mentorship services
          </p>
        </div>

        <div className="space-y-6">
          {/* Access Type Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Access Type
              </CardTitle>
              <CardDescription>
                Choose how mentees can access your services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setSettings({ ...settings, accessType: MentorAccessType.OPEN, baseSubscriptionPrice: 0 })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.accessType === MentorAccessType.OPEN
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <Sparkles className="h-8 w-8 mx-auto text-green-600" />
                    <h3 className="font-semibold">Open (Free)</h3>
                    <p className="text-xs text-muted-foreground">
                      Free access for all mentees
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, accessType: MentorAccessType.PAID })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.accessType === MentorAccessType.PAID
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <DollarSign className="h-8 w-8 mx-auto text-purple-600" />
                    <h3 className="font-semibold">Premium</h3>
                    <p className="text-xs text-muted-foreground">
                      Paid subscription required
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, accessType: MentorAccessType.VIP })}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    settings.accessType === MentorAccessType.VIP
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="text-center space-y-2">
                    <Crown className="h-8 w-8 mx-auto text-pink-600" />
                    <h3 className="font-semibold">VIP</h3>
                    <p className="text-xs text-muted-foreground">
                      Exclusive high-tier access
                    </p>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Card - Only show for paid access */}
          {settings.accessType !== MentorAccessType.OPEN && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Pricing
                </CardTitle>
                <CardDescription>
                  Set your subscription price and billing period
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={settings.baseSubscriptionPrice || ''}
                      onChange={(e) => setSettings({ ...settings, baseSubscriptionPrice: parseFloat(e.target.value) || 0 })}
                      placeholder="49.99"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) => setSettings({ ...settings, currency: value })}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="billing">Billing Period</Label>
                    <Select
                      value={settings.billingPeriod}
                      onValueChange={(value) => setSettings({ ...settings, billingPeriod: value as BillingPeriod })}
                    >
                      <SelectTrigger id="billing">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BillingPeriod.MONTHLY}>Monthly</SelectItem>
                        <SelectItem value={BillingPeriod.QUARTERLY}>Quarterly (3 months)</SelectItem>
                        <SelectItem value={BillingPeriod.YEARLY}>Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {settings.baseSubscriptionPrice && settings.baseSubscriptionPrice > 0 && (
                  <div className="bg-primary/5 rounded-lg p-4">
                    <p className="text-sm">
                      <strong>Preview:</strong> {settings.currency} {settings.baseSubscriptionPrice.toFixed(2)} / {settings.billingPeriod}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Services Offered Card */}
          <Card>
            <CardHeader>
              <CardTitle>Services Offered</CardTitle>
              <CardDescription>
                Select what you offer to your mentees
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="messaging" className="cursor-pointer">Direct Messaging</Label>
                    <p className="text-xs text-muted-foreground">Allow mentees to message you</p>
                  </div>
                </div>
                <Checkbox
                  id="messaging"
                  checked={settings.allowsMessaging}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, allowsMessaging: checked })}
                />
              </div>

              {settings.allowsMessaging && (
                <div className="ml-8 space-y-2">
                  <Label htmlFor="messageLimit">Message Limit (optional)</Label>
                  <Input
                    id="messageLimit"
                    type="number"
                    min="0"
                    value={settings.messageLimitPerPeriod || ''}
                    onChange={(e) => setSettings({ ...settings, messageLimitPerPeriod: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Unlimited"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum messages per billing period (leave empty for unlimited)
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Video className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="sessions" className="cursor-pointer">1:1 Sessions</Label>
                    <p className="text-xs text-muted-foreground">Offer private mentorship sessions</p>
                  </div>
                </div>
                <Checkbox
                  id="sessions"
                  checked={settings.offers1to1Sessions}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, offers1to1Sessions: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="group" className="cursor-pointer">Group Sessions</Label>
                    <p className="text-xs text-muted-foreground">Host group workshops and calls</p>
                  </div>
                </div>
                <Checkbox
                  id="group"
                  checked={settings.offersGroupSessions}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, offersGroupSessions: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="courses" className="cursor-pointer">Courses & Content</Label>
                    <p className="text-xs text-muted-foreground">Share exclusive courses and materials</p>
                  </div>
                </div>
                <Checkbox
                  id="courses"
                  checked={settings.offersCourses}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, offersCourses: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Active Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Status</CardTitle>
              <CardDescription>
                Control whether new subscriptions are accepted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-primary" />
                  <div>
                    <Label htmlFor="active" className="cursor-pointer">Accept New Subscriptions</Label>
                    <p className="text-xs text-muted-foreground">
                      {settings.isActive ? 'Currently accepting new mentees' : 'Not accepting new mentees'}
                    </p>
                  </div>
                </div>
                <Checkbox
                  id="active"
                  checked={settings.isActive}
                  onCheckedChange={(checked: boolean) => setSettings({ ...settings, isActive: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
