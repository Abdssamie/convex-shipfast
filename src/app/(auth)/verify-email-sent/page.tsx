"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft } from "lucide-react"

export default function VerifyEmailSentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [isResending, setIsResending] = useState(false)
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
    } else {
      const storedEmail = sessionStorage.getItem("verification-email")
      if (storedEmail) {
        setEmail(storedEmail)
        sessionStorage.removeItem("verification-email")
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setResendDisabled(false)
    }
  }, [countdown])

  const handleResendVerification = async () => {
    setIsResending(true)
    setMessage(null)

    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      
      if (!response.ok || result.error) {
        setMessage({
          type: "error",
          text: result.error?.message || "Failed to resend verification email"
        })
      } else {
        setMessage({
          type: "success",
          text: "Verification email sent! Please check your inbox."
        })
        setResendDisabled(true)
        setCountdown(60)
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Failed to resend verification email"
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-sm font-medium">{email}</p>
            </div>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Click the link in the email to verify your account.</p>
            <p>If you don&apos;t see the email, check your spam folder.</p>
          </div>

          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "success"}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResendVerification}
              disabled={isResending || resendDisabled}
              className="w-full"
              variant="outline"
            >
              {isResending ? "Sending..." : resendDisabled ? `Resend in ${countdown}s` : "Resend Verification Email"}
            </Button>

            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full"
              variant="ghost"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
