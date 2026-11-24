"use client";

import React, { createContext, useContext, useLayoutEffect, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  clearAllUserBrowserData,
  reconcileClientSessionOwner,
} from "@/lib/offline/sessionIsolation";

interface UserContextValue {
  userId: string;
  displayName: string;
  email: string | null;
}

const UserContext = createContext<UserContextValue>({
  userId: "",
  displayName: "Athlete",
  email: null,
});

export function UserProvider({
  userId,
  displayName,
  email,
  children,
}: {
  userId: string;
  displayName?: string | null;
  email?: string | null;
  children: React.ReactNode;
}) {
  const [isolated, setIsolated] = useState(false);

  useLayoutEffect(() => {
    reconcileClientSessionOwner(userId);
    setIsolated(true);
  }, [userId]);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearAllUserBrowserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const resolvedName =
    displayName?.trim() || (email ? email.split("@")[0] : null) || "Athlete";

  return (
    <UserContext.Provider
      value={{ userId, displayName: resolvedName, email: email ?? null }}
    >
      {isolated ? children : null}
    </UserContext.Provider>
  );
}

export function useDashboardUser() {
  return useContext(UserContext);
}
