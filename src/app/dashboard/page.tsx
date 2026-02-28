"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const user = useQuery(api.user.getCurrentProfile);

  useEffect(() => {
    if (user && !user.hasCompletedOnboarding) {
      router.push("/onboarding");
    }
  }, [user, router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Welcome back, {user.name}!</p>
    </div>
  );
}
