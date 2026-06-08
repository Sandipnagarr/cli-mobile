import React, { useState, useContext } from "react";
import { View, TextInput,StyleSheet,Pressable } from "react-native";
import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme";

export default function SearchBar({ webViewRef }) {
  const [query, setQuery] = useState("");

  const { setLocation, setLocationName, theme } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);

  const handleSearch = async () => {
  if (!query) return;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query,
    )}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "weather-app",
        Accept: "application/json",
      },
    });

    const text = await res.text();
    
    const data = JSON.parse(text);

    if (data.length === 0) {
      alert("Location not found");
      return;
    }

    const place = data[0];

    const lat = place.lat;
    const lon = place.lon;
    const name = place.display_name;

    setLocation(`${lat},${lon}`);
    setLocationName(name);

    webViewRef.current?.postMessage(
      JSON.stringify({
        type: "SEARCH_LOCATION",
        lat,
        lon,
        name,
      }),
    );
  } catch (error) {
    console.log("Search error:", error);
  }
};

  return (
    <View style={styles.searchContainer}>
      <TextInput
        placeholder="Search location..."
        value={query}
        onChangeText={setQuery}
        style={styles.input}
      />
      <Pressable
        style={styles.Button}
        title="Search"
        color={safeTheme.primary_button_bg}
        onPress={handleSearch}
      />
    </View>
  );
}

const createStyles = (safeTheme) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 6,
      padding: 8,
      marginRight: 8,
    },
    Button: {
      backgroundColor: safeTheme.primary_button_bg,
      color: "white",
    },
  });

  /**
   * 
   * 
5/6/2026-------
Completed setup and configuration for generating the Android Release APK
Resolved build failure issues encountered during Release APK generation
Successfully generated and tested the Release APK build
Installed the APK on Vishal's phone and tested functionality across all application pages
Re-implemented and restored application icons after corruption caused by an unexpected PC shutdown
Updated the Weather Forecast table format to display Max and Min temperature ranges
6/6/2026------
Debugged and fixed the issue causing the User tab icon not to display in the application
Added a loading indicator to the Weather KPI component and today Weather Card while API data is being fetched
Generated the latest release build, installed  APK on phone, and verified application functionality
Redesigned the weather information cards and updated the layout to display icon and value horizontally
*/