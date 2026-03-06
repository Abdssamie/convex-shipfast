"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";

function InviteContent({ id }: { id: string }) {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleAcceptInvitation = async () => {
        setIsVerifying(true);
        setError(null);
        try {
            const { error: acceptError } = await authClient.organization.acceptInvitation({
                invitationId: id,
            });

            if (acceptError) {
                setError(acceptError.message || "Failed to accept invitation.");
                toast.error(acceptError.message || "Failed to accept invitation.");
            } else {
                toast.success("Invitation accepted successfully!");
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
            toast.error(err.message || "An unexpected error occurred.");
        } finally {
            setIsVerifying(false);
        }
    };

    if (session && !session.user.emailVerified) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-muted/30 p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
                        <CardDescription>We encountered an issue with your invitation.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium">
                            You must verify your email address before accepting this invitation.
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Please check your inbox for a verification email. Once verified, you can refresh this page to accept the invitation.
                        </p>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button onClick={() => router.refresh()} variant="default" className="w-full">
                            I&apos;ve verified my email
                        </Button>
                        <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
                            Go to Dashboard
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">You&apos;ve been invited!</CardTitle>
                    <CardDescription>Join the organization by accepting this invitation.</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive font-medium mb-4">
                            {error}
                        </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Click the button below to accept the invitation and join the organization.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button
                        onClick={handleAcceptInvitation}
                        disabled={isVerifying || !session}
                        variant="default"
                        className="w-full"
                    >
                        {isVerifying ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Accepting...
                            </>
                        ) : (
                            "Accept Invitation"
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

export default function InvitePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    return (
        <>
            <AuthLoading>
                <div className="flex h-screen w-full items-center justify-center bg-muted/30">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AuthLoading>

            <Unauthenticated>
                <div className="flex h-screen w-full items-center justify-center bg-muted/30 p-4">
                    <Card className="w-full max-w-md shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Sign in required</CardTitle>
                            <CardDescription>You need to be signed in to accept this invitation.</CardDescription>
                        </CardHeader>
                        <CardFooter className="flex justify-end">
                            <Button
                                onClick={() => {
                                    const callbackUrl = `/invite/${id}`;
                                    router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
                                }}
                                variant="default"
                                className="w-full"
                            >
                                Sign In to Continue
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </Unauthenticated>

            <Authenticated>
                <InviteContent id={id} />
            </Authenticated>
        </>
    );
}
