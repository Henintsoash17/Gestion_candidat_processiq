"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CandidatesList from "@/components/CandidatesList";

export default function CandidatesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router, mounted]);

  if (!mounted || !isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return <CandidatesList />;
}
