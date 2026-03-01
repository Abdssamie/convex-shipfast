"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { Upload, ArrowRight, ArrowLeft, Check } from "lucide-react";

type OnboardingStep = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState("system");
  const [notifications, setNotifications] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const user = useQuery(api.user.getCurrentProfile);
  const completeOnboarding = useMutation(api.user.completeOnboarding);
  const generateUploadUrl = useMutation(api.user.generateUploadUrl);
  const updateAvatar = useMutation(api.user.updateAvatar);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      const { storageId } = await result.json();
      await updateAvatar({ storageId });
      
      // Get the URL for preview
      const response = await fetch(`/api/storage/${storageId}`);
      if (response.ok) {
        const blob = await response.blob();
        setAvatarUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding({
        name: name || undefined,
        preferences: {
          theme,
          notifications,
        },
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    }
  };

  const handleSkip = async () => {
    try {
      await completeOnboarding({});
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to skip onboarding:", error);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((currentStep + 1) as OnboardingStep);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as OnboardingStep);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <Logo size={24} />
          </div>
          ShadcnStore
        </Link>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Welcome to ShadcnStore</CardTitle>
                <CardDescription>
                  Let's get you set up in just a few steps
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                Skip
              </Button>
            </div>
            <div className="pt-4">
              <Progress value={progress} className="h-2" />
              <p className="text-muted-foreground text-sm mt-2">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Set up your profile</h3>
                  <p className="text-muted-foreground text-sm">
                    Tell us a bit about yourself
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <Avatar className="size-24">
                    <AvatarImage src={avatarUrl || user?.image || undefined} />
                    <AvatarFallback>
                      {name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUploading}
                        asChild
                      >
                        <span>
                          <Upload className="mr-2 size-4" />
                          {isUploading ? "Uploading..." : "Upload Avatar"}
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <h3 className="text-lg font-semibold">Customize your experience</h3>
                  <p className="text-muted-foreground text-sm">
                    Set your preferences
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <select
                      id="theme"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Enable notifications</Label>
                      <p className="text-muted-foreground text-sm">
                        Receive updates about your account
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full">
                    <Check className="size-8" />
                  </div>
                  <h3 className="text-lg font-semibold">You're all set!</h3>
                  <p className="text-muted-foreground text-sm">
                    Here's a quick overview of what you can do
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">Dashboard</h4>
                    <p className="text-muted-foreground text-sm">
                      View your overview and manage your account
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">Tasks & Events</h4>
                    <p className="text-muted-foreground text-sm">
                      Organize your work and schedule
                    </p>
                  </div>
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-medium">Settings</h4>
                    <p className="text-muted-foreground text-sm">
                      Customize your experience anytime
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="mr-2 size-4" />
                Back
              </Button>
              <Button onClick={handleNext}>
                {currentStep === totalSteps ? (
                  <>
                    Get Started
                    <Check className="ml-2 size-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
