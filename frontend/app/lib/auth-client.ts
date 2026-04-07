"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL || "",
  fetchOptions: {
    credentials: "include",
  },
  // example: http://localhost:8080
});