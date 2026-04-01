"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Candidate } from "@/lib/types";
import { candidatesAPI } from "@/lib/api";

interface CandidateDetailProps {
  id: string;
}

export default function CandidateDetail({ id }: CandidateDetailProps) {
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const response = await candidatesAPI.getById(id);
        setCandidate(response.data);
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || "Failed to fetch candidate");
      } finally {
        setLoading(false);
      }
    };
    fetchCandidate();
  }, [id]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      await candidatesAPI.validate(id);
      // Refresh candidate data
      const response = await candidatesAPI.getById(id);
      setCandidate(response.data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Validation failed");
    } finally {
      setValidating(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await candidatesAPI.reject(id);
      // Refresh candidate data
      const response = await candidatesAPI.getById(id);
      setCandidate(response.data);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Rejection failed");
    } finally {
      setRejecting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-full flex flex-1 items-center justify-center bg-gray-50">
        <span className="text-lg text-gray-700">Loading...</span>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-red-500 text-lg">{error}</span>
      </div>
    );
  if (!candidate)
    return (
      <div className="min-h-full flex flex-1 items-center justify-center bg-gray-50">
        <span className="text-lg text-gray-700">Candidate not found</span>
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">{candidate.name}</h1>
        <Link
          href={`/candidates/${candidate.id}/edit`}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium shadow"
        >
          Edit Candidate
        </Link>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Email:</span>
          <span className="text-gray-900">{candidate.email}</span>
        </div>
        {candidate.phone && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-medium">Phone:</span>
            <span className="text-gray-900">{candidate.phone}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${candidate.status === "validated" ? "bg-green-100 text-green-700" : candidate.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
          >
            {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Created:</span>
          <span className="text-gray-900">
            {new Date(candidate.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">Updated:</span>
          <span className="text-gray-900">
            {new Date(candidate.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleValidate}
          disabled={
            validating || candidate.status === "validated" || candidate.status === "rejected"
          }
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validating ? "Validating..." : "Validate Candidate"}
        </button>
        <button
          onClick={handleReject}
          disabled={
            rejecting || candidate.status === "rejected" || candidate.status === "validated"
          }
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {rejecting ? "Rejecting..." : "Reject Candidate"}
        </button>
      </div>
    </div>
  );
}
