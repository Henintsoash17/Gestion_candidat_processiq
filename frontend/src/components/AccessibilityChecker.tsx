"use client";

import { useEffect, useRef } from "react";
import axe from "axe-core";

export default function AccessibilityChecker() {
  const hasRunRef = useRef(false);

  useEffect(() => {
    const runAxe = async () => {
      if (typeof window !== "undefined" && !hasRunRef.current) {
        hasRunRef.current = true;
        const results = await axe.run(document);
        console.log("Accessibility violations:", results.violations);
        // In a real app, you might want to display these results or send to a service
      }
    };

    runAxe();
  }, []);

  return null; // This component doesn't render anything
}
