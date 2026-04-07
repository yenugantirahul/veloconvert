"use client";

import { createAuthClient } from "better-auth/react";

const configuredBaseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
const baseURL =
  configuredBaseURL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_BACKEND_URL is required in production.");
}

export const authClient = createAuthClient({
  baseURL,
  fetchOptions: {
    credentials: "include",
  },
  // example: http://localhost:8080
});