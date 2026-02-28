"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { authClient } from "@/lib/auth/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState, FormEvent } from "react"
import { checkRateLimit, authLimiter } from "@/lib/rate-limit"

export function SignupForm2({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const firstName = formData.get("firstName") as string
    const lastName = formData.get("lastName") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const terms = formData.get("terms") as string

    if (!terms) {
      toast.error("You must agree to the terms")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      setIsLoading(false)
      return
    }

    try {
      // Check rate limit
      const rateLimitResult = await checkRateLimit(authLimiter, email)
      if (!rateLimitResult.success) {
        const resetTime = rateLimitResult.reset ? new Date(rateLimitResult.reset).toLocaleTimeString() : "soon"
        toast.error(`Too many signup attempts. Please try again at ${resetTime}`)
        setIsLoading(false)
        return
      }

      const result = await authClient.signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`,
      })

      if (result.error) {
        toast.error(result.error.message || "Failed to create account")
        return
      }

      toast.success("Account created! Check your email to verify.")
      router.push("/dashboard")
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleSignup() {
    setIsLoading(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      })
    } catch (error) {
      toast.error("Failed to sign up with Google")
      setIsLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your information to create a new account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-3">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" name="firstName" placeholder="John" required disabled={isLoading} />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" name="lastName" placeholder="Doe" required disabled={isLoading} />
          </div>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required disabled={isLoading} />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required disabled={isLoading} />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" name="terms" required disabled={isLoading} />
          <Label htmlFor="terms" className="text-sm">
            I agree to the{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </a>
          </Label>
        </div>
        <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button 
          variant="outline" 
          className="w-full cursor-pointer" 
          type="button"
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Sign up with Google
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/sign-in-2" className="underline underline-offset-4">
          Sign in
        </a>
      </div>
    </form>
  )
}
