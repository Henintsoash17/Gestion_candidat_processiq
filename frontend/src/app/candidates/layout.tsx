import type { ReactNode } from "react";

export default function CandidatesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
