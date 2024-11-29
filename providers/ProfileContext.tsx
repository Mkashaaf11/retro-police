import React, { createContext, useState, useContext } from "react";
import { Session } from "@supabase/supabase-js";

// Define context type to hold the session state
interface ProfileContextType {
  session: Session | null;
  setSession: (session: Session | null) => void;
}

// Create the context with default values
const ProfileContext = createContext<ProfileContextType>({
  session: null,
  setSession: () => {},
});

// ProfileProvider component that holds the session state
export const ProfileProvider = ({
  children,
  session,
  setSession,
}: {
  children: React.ReactNode;
  session: Session | null;
  setSession: (session: Session | null) => void;
}) => {
  return (
    <ProfileContext.Provider value={{ session, setSession }}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to access the session context
export const useProfile = () => useContext(ProfileContext);
