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
import { Logo } from "@/components/logo"
import Link from "next/link"
import { authClient } from "@/lib/auth/client"
import { toast } from "sonner"
import { Mail } from "lucide-react"

export default function ResetPasswordSentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get("email")
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password")
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, router])

  const handleResend = async () => {
    if (!email || !canResend) return

    setIsResending(true)
    try {
      await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      })
      toast.success("Reset email sent again!")
      setCanResend(false)
      setCountdown(60)
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to resend email")
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return null
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
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Mail className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to
            </CardDescription>
            <p className="text-sm font-medium">{email}</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="text-muted-foreground text-center text-sm">
                Didn&apos;t receive the email? Check your spam folder or request a new link.
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleResend}
                disabled={!canResend || isResending}
              >
                {isResending
                  ? "Sending..."
                  : canResend
                  ? "Resend Email"
                  : `Resend in ${countdown}s`}
              </Button>
              <div className="text-center text-sm">
                <Link href="/sign-in" className="underline underline-offset-4">
                  Back to sign in
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
