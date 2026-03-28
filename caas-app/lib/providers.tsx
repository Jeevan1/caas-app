"use client";
import { ReactNode } from "react";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Toaster } from "sonner";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { CurrentUserSettings, User } from "./types";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

type CurrentUser = User;

const CurrentUserContext = React.createContext<CurrentUser | null>(null);

const CurrentUserSettingsContext =
  React.createContext<CurrentUserSettings | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUser | null;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function CurrentUserSettingsProvider({
  settings,
  children,
}: {
  settings: CurrentUserSettings | null;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserSettingsContext.Provider value={settings}>
      {children}
    </CurrentUserSettingsContext.Provider>
  );
}

export function useCurrentUser<TUser = CurrentUser>() {
  const context = React.useContext(CurrentUserContext);
  return context as TUser | null;
}
export function useCurrentUserSettings<TUserSettings = CurrentUserSettings>() {
  const context = React.useContext(CurrentUserSettingsContext);
  return context as TUserSettings | null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute={"class"}
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          richColors
          toastOptions={{
            className: "border-l-4 shadow-lg",
            style: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              borderColor: "hsl(var(--border))",
            },
          }}
        />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
