"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

interface ConditionalClerkProviderProps {
  children: ReactNode;
}

export function ConditionalClerkProvider({ children }: ConditionalClerkProviderProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Check if we have a valid Clerk key (real keys are longer and don't contain "placeholder")
  const hasValidClerkKey = publishableKey &&
    publishableKey.length > 50 &&
    !publishableKey.includes("placeholder");

  if (hasValidClerkKey) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }

  // Render without Clerk for UI development/testing
  console.warn("⚠️ Clerk disabled: Invalid or placeholder publishable key. Auth features will not work.");
  return <>{children}</>;
}
