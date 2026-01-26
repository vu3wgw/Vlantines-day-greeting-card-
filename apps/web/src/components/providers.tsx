"use client";

import { useAuth } from "@clerk/nextjs";
import { env } from "@my-better-t-app/env/web";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

import { ThemeProvider } from "./theme-provider";
import { Toaster } from "./ui/sonner";

// Check if we have valid credentials
const convexUrl = env.NEXT_PUBLIC_CONVEX_URL;
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidConvex = convexUrl && convexUrl.includes("convex.cloud") && !convexUrl.includes("placeholder");
const hasValidClerk = clerkKey && clerkKey.length > 50 && !clerkKey.includes("placeholder");

// Only create Convex client if URL is valid
const convex = hasValidConvex ? new ConvexReactClient(convexUrl) : null;

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {convex && hasValidClerk ? (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          {children}
        </ConvexProviderWithClerk>
      ) : convex ? (
        <ConvexProvider client={convex}>
          {children}
        </ConvexProvider>
      ) : (
        // No backend - just render children for UI preview
        <>{children}</>
      )}
      <Toaster richColors />
    </ThemeProvider>
  );
}
