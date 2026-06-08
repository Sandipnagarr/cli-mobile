import { Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
export default function UserScreen({ onLogout }) {  
  const handleLogout = async (onLogout) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const logId = await AsyncStorage.getItem("logId");

      const response = await fetch("https://mlinfomap.org/mlwapi/user_logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          logId: logId ? JSON.parse(logId) : null,
        }),
      });
  const data = await response.json();

  console.log("LOGOUT RESPONSE:", data);
      //  ALWAYS clear storage (even if token revoked)
      await AsyncStorage.multiRemove([
        "token",
        "user",
        "circleClicked",
        "logId",
      ]);

      //  DIRECTLY go to login (no alert)
      onLogout?.();
    } catch (error) {
      console.log("Logout error:", error);

      // still logout even if API fails
      await AsyncStorage.clear();
      onLogout?.();
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile & Settings</Text>

        <Pressable
          style={styles.button}
          onPress={() => handleLogout(onLogout)}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  eyebrow: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  title: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  description: {
    color: "#475569",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  button: {
    alignSelf: "flex-start",
    backgroundColor: "#16a34a",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});
