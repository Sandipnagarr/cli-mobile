import react from "react";
import { API_URL } from "../config/Config";
import AsyncStorage from "@react-native-async-storage/async-storage";


// Function to fetch weather data based on location
export const fetchWeather = async (location) => {
    try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            console.log("No token found");
            return;
        }
     
        const response = await fetch(`${API_URL}/get_weather`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ q: location }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.log("Error fetching weather:", data?.msg || data?.message || "Unknown error");
            return;
        }
        return data;
    } catch (error) {
        console.log("Error fetching weather:", error.message);
    }
};

export const postrequest = async (endpoint, payload) => {
    console.log(payload, endpoint)
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }
    const response = await fetch(`https://mlinfomap.org/mlwapi/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

    
      body: JSON.stringify(payload),
    });

    const res = await response.json();
    return res;
  } catch (error) {
    console.log("API Error:", error);

    return null;
  }
};



