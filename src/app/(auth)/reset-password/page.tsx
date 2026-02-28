"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import { toast } from "sonner"
import { Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token")
      router.push("/forgot-password")
    }
  }, [token, router])

  const validatePassword = (pwd: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (pwd.length < 8) {
      errors.push("At least 8 characters")
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("One uppercase letter")
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("One lowercase letter")
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("One number")
    }

    return { valid: errors.length === 0, errors }
  }

  const passwordValidation = validatePassword(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Invalid reset token")
      return
    }

    if (!passwordValidation.valid) {
      toast.error("Password does not meet requirements")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      })
      
      setIsSuccess(true)
      toast.success("Password reset successfully!")
      
      setTimeout(() => {
        router.push("/sign-in")
      }, 2000)
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to reset password. The link may be expired or invalid."
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return null
  }

  if (isSuccess) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
              <Logo size={24} />
            </div>
            ShadcnStore
          </Link>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-xl">Password Reset Successful</CardTitle>
              <CardDescription>
                Your password has been reset successfully. Redirecting to sign in...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
            <Logo size={24} />
          </div>
          ShadcnStore
        </Link>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {password && (
                    <div className="text-xs space-y-1">
                      <p className="text-muted-foreground">Password must contain:</p>
                      <ul className="space-y-1">
                        <li className={password.length >= 8 ? "text-green-600" : "text-muted-foreground"}>
                          {password.length >= 8 ? "✓" : "○"} At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter
                        </li>
                        <li className={/[a-z]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          {/[a-z]/.test(password) ? "✓" : "○"} One lowercase letter
                        </li>
                        <li className={/[0-9]/.test(password) ? "text-green-600" : "text-muted-foreground"}>
                          {/[0-9]/.test(password) ? "✓" : "○"} One number
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-600">Passwords do not match</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full cursor-pointer" 
                  disabled={isLoading || !passwordValidation.valid || password !== confirmPassword}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/sign-in" className="underline underline-offset-4">
                    Back to sign in
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
