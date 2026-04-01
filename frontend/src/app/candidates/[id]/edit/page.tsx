"use client";

import { use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CandidateForm from "@/components/CandidateForm";
import { Candidate } from "@/lib/types";
import { candidatesAPI } from "@/lib/api";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

interface EditCandidatePageProps {
  params: Promise<{ id: string }>;
}

export default function EditCandidatePage({ params }: EditCandidatePageProps) {
  const { id } = use(params);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchCandidate = async () => {
      try {
        const response = await candidatesAPI.getById(id);
        setCandidate(response.data);
      } catch {
        router.push("/candidates");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [isAuthenticated, router, id]);

  if (!isAuthenticated) return <div>Redirecting to login...</div>;
  if (loading) return <div>Loading...</div>;
  if (!candidate) return <div>Candidate not found</div>;

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-gray-50 py-8">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href={`/candidates/${id}`} className="text-indigo-600 hover:underline font-medium">
            ← Back to Candidate
          </Link>
          <LogoutButton />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Edit Candidate</h1>
        <CandidateForm candidate={candidate} onSuccess={() => router.push(`/candidates/${id}`)} />
      </div>
    </div>
  );
}
