"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { candidatesAPI } from "@/lib/api";
import { Candidate } from "@/lib/types";

const candidateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});

type CandidateForm = z.infer<typeof candidateSchema>;

interface CandidateFormProps {
  candidate?: Candidate;
  onSuccess: () => void;
}

export default function CandidateForm({ candidate, onSuccess }: CandidateFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateForm>({
    resolver: zodResolver(candidateSchema),
    defaultValues: candidate
      ? {
          name: candidate.name,
          email: candidate.email,
          phone: candidate.phone || "",
        }
      : undefined,
  });

  const onSubmit = async (data: CandidateForm) => {
    setLoading(true);
    setError("");
    try {
      if (candidate) {
        await candidatesAPI.update(candidate.id, data);
      } else {
        await candidatesAPI.create(data);
      }
      onSuccess();
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to save candidate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <input
          {...register("name")}
          type="text"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          {...register("email")}
          type="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
        <input
          {...register("phone")}
          type="tel"
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Saving..." : candidate ? "Update Candidate" : "Create Candidate"}
      </button>
    </form>
  );
}
