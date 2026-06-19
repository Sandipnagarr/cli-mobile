import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {Alert,Pressable,StyleSheet,Text,TextInput,View} from "react-native";
import { useContext } from "react";
import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme";
import { Image } from "react-native";
import Logo from "../../assets/MLLogo.png"; // update path as needed
const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);
  // const Loginhandel = async () => {
  //   const normalizedUsername = username.trim();

  //   if (!normalizedUsername || !password) {
  //     Alert.alert("Missing details", "Please fill all the fields.");
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);

  //     const response = await fetch("https://mlinfomap.org/mlwapi/userLogin", {
        
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         username: normalizedUsername,
  //         userpassword: password,
  //       }),
  //     });
  //     const data = await response.json();
      
  //     if (!response.ok) {
  //       Alert.alert(
  //         "Login failed",
  //         data?.msg || data?.message || "Unable to login.",
  //       );
  //       return;
  //     }

  //     const loginPayload = data?.data || {};
  //     const token = loginPayload?.token;
  //     const user = loginPayload?.resultUser;

  //     if (!token) {
  //       Alert.alert("Login failed", "Login response did not include a token.");
  //       return;
  //     }

  //     // if (user) {
  //     //   await AsyncStorage.setItem("user", JSON.stringify(user));
  //     //   await AsyncStorage.setItem("token", token);
  //     // }
  //     // ALWAYS save token

  //     // Save user only if exists
  //     if (user) {
  //       await AsyncStorage.setItem("user", JSON.stringify(user));
  //       await AsyncStorage.setItem("token", token);
  //     }
  //     onLogin?.();
  //   } catch (error) {
  //     console.log("Login error:", error);
  //     Alert.alert("Server error", "Could not connect to ML Weather server.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
const Loginhandel = async () => {
  const normalizedUsername = username.trim();

  if (!normalizedUsername || !password) {
    Alert.alert("Missing details", "Please fill all the fields.");
    return;
  }

  try {
    setIsLoading(true);

    const response = await fetch(
      "https://mlinfomap.org/mlwapi/userLogin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: normalizedUsername,
          userpassword: password,
        }),
      }
    );

    const data = await response.json();

    console.log("LOGIN RESPONSE => ", JSON.stringify(data, null, 2));

    // Already logged in handling
    if (
      data?.status === "already_logged_in" ||
      data?.error?.status === "already_logged_in"
    ) {
      const loginData = data?.data || {};

      Alert.alert(
        "Already Logged In",
        `${loginData?.name || normalizedUsername} is already logged in from ${
          loginData?.loggedin_device || "another device"
        }`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Logout Other Device",
            onPress: async () => {
              try {
                const logoutResponse = await fetch(
                  "https://mlinfomap.org/mlwapi/force-logout",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      userId: loginData?.userid,
                      logId: loginData?.log_id,
                    }),
                  }
                );

                const logoutData = await logoutResponse.json();

                if (logoutData?.status === "success") {
                  Alert.alert(
                    "Success",
                    logoutData?.msg ||
                      "Other device logged out successfully"
                  );

                  // Try login again
                  Loginhandel();
                } else {
                  Alert.alert(
                    "Error",
                    logoutData?.msg || "Unable to logout other device"
                  );
                }
              } catch (err) {
                console.log(err);
                Alert.alert(
                  "Error",
                  "Unable to logout other device"
                );
              }
            },
          },
        ]
      );

      return;
    }

    if (!response.ok) {
      Alert.alert(
        "Login failed",
        data?.msg || data?.message || "Unable to login."
      );
      return;
    }

    const loginPayload = data?.data || {};
    const token = loginPayload?.token;
    const user = loginPayload?.resultUser;

    if (!token) {
      Alert.alert(
        "Login failed",
        "Login response did not include a token."
      );
      return;
    }

    if (user) {
      await AsyncStorage.setItem(
        "user",
        JSON.stringify(user)
      );
    }

    await AsyncStorage.setItem("token", token);

    onLogin?.();
  } catch (error) {
    console.log("Login error:", error);
    Alert.alert(
      "Server error",
      "Could not connect to ML Weather server."
    );
  } finally {
    setIsLoading(false);
  }
};
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* <Image source={Logo} style={styles.logo} /> */}
<Image source={Logo} style={styles.logo} />

<Text style={styles.appTitle}>
  Weather Intelligence & Alert System
</Text>

<Text style={styles.title}>User Login</Text>

        <TextInput
          placeholder="Username"
          placeholderTextColor="#000"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
          autoCapitalize="none"
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#000"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <Pressable style={styles.button} onPress={Loginhandel}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Logging...' : 'Login'}
          </Text>
        </Pressable>
                <Text style={styles.copyright}>
  © 2026 ML INFOMAP. All rights reserved.
</Text>

      </View>
    </View>
  );
};

export default Login;
const createStyles = theme =>
  StyleSheet.create({
    container: {
      flex: 1,
      // backgroundColor: theme.header_gradient_start, // or background color
      backgroundColor: '#73a1a1',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: '80%',
      maxWidth: 400,
      backgroundColor: theme.hover_card_bg,
      padding: 25,
      borderRadius: 16,
      elevation: 8,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 10,
      borderColor: theme.primary_border_color,
      borderWidth: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 25,
      color: theme.secondary_text_color,
    },
    input: {
      backgroundColor: '#f1f5f9',
      padding: 14,
      borderRadius: 10,
      marginBottom: 15,
      borderColor: theme.primary_border_color,
      borderWidth: 1,
      color: '#000',
    },
    button: {
      backgroundColor: theme.primary_button_bg,
      padding: 16,
      borderRadius: 10,
      marginTop: 10,
    },
    buttonText: {
      textAlign: 'center',
      color: theme.text_on_dark_bg,
      fontWeight: 'bold',
      fontSize: 16,
    },
    appTitle: {
  fontSize: 15,
  fontWeight: "bold",
  textAlign: "center",
  color: "#0077c8",
  marginBottom: 10,
},

logo: {
  width: 80,
  height: 80,
  alignSelf: "center",
  marginBottom: 15,
  resizeMode: "contain",
},
  copyright: {
  marginTop: 30,
  textAlign: "center",
  color: "#94a3b8",
  fontSize: 12,
},
 
  });
