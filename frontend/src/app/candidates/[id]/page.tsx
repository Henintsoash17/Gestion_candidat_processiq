"use client";

import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CandidateDetail from "@/components/CandidateDetail";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

interface CandidateDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CandidateDetailPage({ params }: CandidateDetailPageProps) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return <div>Redirecting to login...</div>;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/candidates" className="text-indigo-600 hover:underline font-medium">
            ← Back to Candidates
          </Link>
          <LogoutButton />
        </div>
        <CandidateDetail id={id} />
      </div>
    </div>
  );
}
