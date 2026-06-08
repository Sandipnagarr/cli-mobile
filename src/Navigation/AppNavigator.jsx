import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Loginscreen from "../Screens/Login.jsx";
import TabNavigator from "./TabNavigator.jsx";

const SHOW_LOGIN_ON_EVERY_OPEN = false;

export default function AppNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        if (SHOW_LOGIN_ON_EVERY_OPEN) {
          await AsyncStorage.multiRemove(["token", "user"]);

          if (isMounted) {
            setIsLoggedIn(false);
          }

          return;
        }

        const token = (await AsyncStorage.getItem("token"))?.trim();

        if (isMounted) {
          setIsLoggedIn(Boolean(token));
        }
      } catch (error) {
        console.log("Auth restore error:", error);
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setIsLoggedIn(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return isLoggedIn ? (
    <TabNavigator onLogout={handleLogout} />
  ) : (
    <Loginscreen onLogin={() => setIsLoggedIn(true)} />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },
});
