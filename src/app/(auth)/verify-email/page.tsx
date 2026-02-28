"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { CheckCircle2, XCircle } from "lucide-react"

type VerificationState = "loading" | "success" | "error"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [state, setState] = useState<VerificationState>("loading")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token")
      
      if (!token) {
        setState("error")
        setErrorMessage("Verification token is missing")
        return
      }

      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        const result = await response.json()

        if (!response.ok || result.error) {
          setState("error")
          setErrorMessage(result.error?.message || "Verification failed")
          return
        }

        setState("success")
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } catch (error) {
        setState("error")
        setErrorMessage("An unexpected error occurred")
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Email Verification</CardTitle>
          <CardDescription>
            {state === "loading" && "Verifying your email address..."}
            {state === "success" && "Your email has been verified"}
            {state === "error" && "Verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state === "loading" && (
            <LoadingSpinner size="md" />
          )}

          {state === "success" && (
            <Alert variant="success">
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your email has been verified successfully. Redirecting to dashboard...
              </AlertDescription>
            </Alert>
          )}

          {state === "error" && (
            <>
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Verification Failed</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push("/verify-email-sent")}
                  className="w-full"
                  variant="outline"
                >
                  Resend Verification Email
                </Button>

                <Button
                  onClick={() => router.push("/sign-in")}
                  className="w-full"
                  variant="ghost"
                >
                  Back to Sign In
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
