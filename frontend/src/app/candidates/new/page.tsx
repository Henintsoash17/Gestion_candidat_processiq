"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CandidateForm from "@/components/CandidateForm";
import LogoutButton from "@/components/LogoutButton";

export default function NewCandidatePage() {
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
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900">Add New Candidate</h1>
          <LogoutButton />
        </div>
        <CandidateForm onSuccess={() => router.push("/candidates")} />
      </div>
    </div>
  );
}
