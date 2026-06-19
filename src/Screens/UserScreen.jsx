import React, { useEffect, useState, useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme";

export default function UserScreen({ onLogout }) {
  const [userName, setUserName] = useState("User");
   const { theme} = useContext(WeatherContext);
    const safeTheme = theme || defaultTheme;
    const styles = createStyles(safeTheme);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await AsyncStorage.getItem("user");

        if (user) {
          const parsedUser = JSON.parse(user);

          setUserName(
            parsedUser?.name ||
              parsedUser?.username ||
              parsedUser?.userName ||
              "User"
          );
        }
      } catch (error) {
        console.log("User load error:", error);
      }
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const logId = await AsyncStorage.getItem("logId");

      const response = await fetch(
        "https://mlinfomap.org/mlwapi/user_logout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            logId: logId ? JSON.parse(logId) : null,
          }),
        }
      );

      const data = await response.json();

      console.log("LOGOUT RESPONSE:", data);

      await AsyncStorage.multiRemove([
        "token",
        "user",
        "circleClicked",
        "logId",
      ]);

      onLogout?.();
    } catch (error) {
      console.log("Logout error:", error);

      await AsyncStorage.clear();
      onLogout?.();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </Text>
          </View>

          <Text style={styles.userName}>{userName}</Text>

          <Text style={styles.userRole}>
            Weather Dashboard User
          </Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
        <Text style={styles.copyright}>
  © 2026 ML INFOMAP. All rights reserved.
</Text>
      </View>
    </View>
  );
}

const createStyles = (safeTheme) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },

  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: safeTheme.primary_button_bg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  avatarText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },

  userName: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "700",
  },

  userRole: {
    marginTop: 5,
    color: "#64748b",
    fontSize: 14,
  },

  button: {
    alignSelf: "center",
   backgroundColor: safeTheme.primary_button_bg,
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 12,
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  copyright: {
  marginTop: 30,
  textAlign: "center",
  color: "#94a3b8",
  fontSize: 12,
},
});