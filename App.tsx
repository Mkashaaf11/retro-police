//App.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { NavigationContainer } from "@react-navigation/native";
import { PaperProvider } from "react-native-paper";
import { Session } from "@supabase/supabase-js";
import { theme } from "./app/theme/theme";
import AuthStack from "./app/navigation/AuthStack";
import TabNav from "./app/navigation/TabNav";
import { ProfileProvider } from "./providers/ProfileContext";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Auth State Change Event:", _event);

        setSession(session);
      }
    );

    getSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <ProfileProvider session={session} setSession={setSession}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          {session ? <TabNav /> : <AuthStack />}
        </NavigationContainer>
      </PaperProvider>
    </ProfileProvider>
  );
}
