"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Candidate } from "@/lib/types";
import { candidatesAPI } from "@/lib/api";
import LogoutButton from "@/components/LogoutButton";

export default function CandidatesList() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const isFirstFetch = useRef(true);

  const fetchCandidates = useCallback(async () => {
    if (isFirstFetch.current) {
      setInitialLoading(true);
    } else {
      setRefreshing(true);
    }
    setError("");
    try {
      const response = await candidatesAPI.getAll(page, 10, { search, status: statusFilter });
      setCandidates(response.data.candidates);
      setTotal(response.data.total);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch candidates");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
      isFirstFetch.current = false;
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await candidatesAPI.delete(id);
      fetchCandidates();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to delete candidate");
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-full flex flex-1 items-center justify-center bg-gray-50">
        <span className="text-lg text-gray-700">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-full flex-1 bg-gray-50 py-8">
      {refreshing && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-white/40" aria-hidden />
      )}
      <div className="w-4/5 mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900">Candidates</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              href="/candidates/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium shadow"
            >
              Add Candidate
            </Link>
            <LogoutButton />
          </div>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 text-gray-900"
            autoComplete="off"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900"
          >
            <option value="" className="text-gray-900">
              All Status
            </option>
            <option value="pending" className="text-gray-900">
              Pending
            </option>
            <option value="validated" className="text-gray-900">
              Validated
            </option>
            <option value="rejected" className="text-gray-900">
              Rejected
            </option>
          </select>
        </div>

        {candidates.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No candidates found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-gray-50 border border-gray-200 rounded-lg shadow p-6 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">{candidate.name}</h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${candidate.status === "validated" ? "bg-green-100 text-green-700" : candidate.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
                  >
                    {candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-700">{candidate.email}</p>
                {candidate.phone && <p className="text-gray-500 text-sm">{candidate.phone}</p>}
                <div className="mt-3 flex gap-3">
                  <Link
                    href={`/candidates/${candidate.id}`}
                    className="text-indigo-600 hover:underline font-medium"
                  >
                    View
                  </Link>
                  <Link
                    href={`/candidates/${candidate.id}/edit`}
                    className="text-green-600 hover:underline font-medium"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(candidate.id)}
                    className="text-red-600 hover:underline font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 text-gray-900"
          >
            Previous
          </button>
          <span className="text-gray-900">
            Page {page} of {Math.ceil(total / 10)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * 10 >= total}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 text-gray-900"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
