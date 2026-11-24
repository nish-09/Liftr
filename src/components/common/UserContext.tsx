"use client";

import React, { createContext, useContext } from "react";

interface UserContextValue {
  displayName: string;
  email: string | null;
}

const UserContext = createContext<UserContextValue>({
  displayName: "Athlete",
  email: null,
});

export function UserProvider({
  displayName,
  email,
  children,
}: {
  displayName?: string | null;
  email?: string | null;
  children: React.ReactNode;
}) {
  const resolvedName =
    displayName?.trim() || (email ? email.split("@")[0] : null) || "Athlete";

  return (
    <UserContext.Provider value={{ displayName: resolvedName, email: email ?? null }}>
      {children}
    </UserContext.Provider>
  );
}

export function useDashboardUser() {
  return useContext(UserContext);
}
