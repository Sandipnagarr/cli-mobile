
import React, { useContext, useState, useRef,useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme"
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';


export default function ForecastCards() {
  const { data, theme } = useContext(WeatherContext);
  // const styles = createStyles(theme);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);
  const [showHourly, setShowHourly] = useState(true);
  const [showDaily, setShowDaily] = useState(false);
  const scrollRef = useRef(null);

  // if (!data) {
  //   return <Text>Loading forecast...</Text>;
  // }

  // ---------- SIMPLE STRUCTURE ----------
  const forecastDays = data?.forecast?.forecastday || [];

  // DAILY
  const dayForecastList = forecastDays.map((day) => ({
    date: day.date,
    temp_min: day.day.mintemp_c,
    temp_max: day.day.maxtemp_c,
    icon: `https:${day.day.condition.icon}`,
    condition_text: day.day.condition.text,
    chance_of_rain: day.day.daily_chance_of_rain,
    humidity: day.day.avghumidity,
    rain_mm: day.day.totalprecip_mm || day.day.precip_mm || 0,
  }));

  // HOURLY (today only)
  const hourlyData = (forecastDays[0]?.hour || []).map((hour) => ({
    time: hour.time.split(" ")[1],
    temp: hour.temp_c,
    icon: `https:${hour.condition.icon}`,
    chance_of_rain: hour.chance_of_rain,
    rain_mm: hour.precip_mm || 0, //
    wind: hour.wind_kph,
  }));
  const currentHour = new Date().getHours();

  useEffect(() => {
    const currentIndex = hourlyData.findIndex((hour) => {
      const hourValue = Number(hour.time.split(":")[0]);

      return hourValue === currentHour;
    });

    if (currentIndex !== -1) {
      scrollRef.current?.scrollTo({
        x: currentIndex * 160,
        animated: true,
      });
    }
  }, [hourlyData]);

  // NOW CHECK DATA
  if (!data) {
    return <Text>Loading forecast...</Text>;
  }

  // HELPER
  return (
    <View style={styles.section}>
      {/* HOURLY TAB */}
      <Pressable
        style={[styles.accordionTab, showHourly && styles.activeAccordionTab]}
        onPress={() => setShowHourly(!showHourly)}
      >
        <Text
          style={[
            styles.tabTitle,
            { color: showHourly ? safeTheme.secondary_text_color : "#fff" },
          ]}
        >
          Hourly Forecast
        </Text>
        <Text style={styles.arrow}>{showHourly ? "▲" : "▼"}</Text>
      </Pressable>

      {showHourly && (
        <ScrollView
          horizontal
          ref={scrollRef}
          showsHorizontalScrollIndicator={false}
        >
          {hourlyData.map((hour, i) => {
            const hourValue = Number(hour.time.split(":")[0]);
            const isCurrent = hourValue === currentHour;

            return (
              <View
                key={i}
                style={[styles.hourCard, isCurrent && styles.activeHourCard]}
              >
                {/* TIME */}
                <Text style={styles.hourTime}>{hour.time}</Text>

                {/* ICON */}
                <Image source={{ uri: hour.icon }} style={styles.hourIcon} />

                {/* TEMP */}
                <Text style={styles.hourTemp}>{hour.temp}°C</Text>

                {/* RAIN % */}
                <Text style={styles.hourRain}>
                  🌧️ {hour.chance_of_rain}% Rain probility
                </Text>

                {/* RAIN MM (FIXED) */}
                <Text style={styles.hour_mm}>🌧 {hour.rain_mm} mm</Text>

                {/* WIND (NEW like Angular) */}
                <Text style={styles.hour_mm}>
                  <FontAwesome5
                    name="wind"
                    size={14}
                    color={safeTheme.secondary_text_color}
                  />
                  {hour.wind} km/h
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* DAILY TAB */}
      <Pressable
        style={[styles.accordionTab, showDaily && styles.activeAccordionTab]}
        onPress={() => setShowDaily(!showDaily)}
      >
        <Text
          style={[
            styles.tabTitle,
            { color: showDaily ? safeTheme.secondary_text_color : "#fff" },
          ]}
        >
          7-Day Weather Forecast
        </Text>
        <Text style={styles.arrow}>{showDaily ? "▲" : "▼"}</Text>
      </Pressable>

      {showDaily && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dayForecastList?.map((day, i) => (
            <View
              key={i}
              style={[
                styles.dayCard,
                {
                  backgroundColor: i === 0 ? safeTheme.hover_card_bg : "#fff",
                },
              ]}
            >
              <Text style={styles.date}>{day.date}</Text>

              <View style={styles.tempRow}>
                <Text style={styles.minTemp}>min: {day.temp_min}°C</Text>
                <Text style={styles.maxTemp}>max: {day.temp_max}°C</Text>
              </View>

              <Image source={{ uri: day.icon }} style={styles.dayIcon} />

              <Text style={styles.condition}>{day.condition_text}</Text>

              <Text style={styles.rain}> 🌧️ {day.chance_of_rain}% chance</Text>

              <Text style={styles.humidity}>💧 {day.humidity}%</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (safeTheme) =>
  StyleSheet.create({
    section: {
      marginTop: 15,
    },

    hourCard: {
      width: 140,
      padding: 10,
      borderRadius: 0,
      margin: 10,
      alignItems: "center",
      backgroundColor: safeTheme.min_other_color,
      textcolor: safeTheme.secondary_text_color,
    },

    hourTime: {
      fontSize: 12,
      color: safeTheme.secondary_text_color,
    },

    hourIcon: {
      width: 50,
      height: 50,
    },
    hourTemp: {
      fontWeight: "bold",
      color: safeTheme.secondary_text_color,
    },

    hourRain: {
      fontSize: 10,
      color: safeTheme.text_on_light_bg,
    },

    accordionTab: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 15,
      backgroundColor: safeTheme.primary_button_bg,
      marginBottom: 1,
    },

    activeAccordionTab: {
      backgroundColor: safeTheme.accordion_active_bg,
    },

    tabTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontWeight: "600",
      color: safeTheme.text_on_dark_bg,
    },

    arrow: {
      position: "absolute",
      right: 15,
      fontSize: 16,
      color: safeTheme.text_on_dark_bg,
    },

    activeHourCard: {
      backgroundColor: safeTheme.hover_card_bg,
      borderColor: safeTheme.primary_border_color,
      borderWidth: 1,
      color: "red",
    },

    dayCard: {
      width: 160,
      padding: 12,
      borderRadius: 0,
      margin: 10,
      backgroundColor: safeTheme.hover_card_bg,
      borderColor: safeTheme.primary_border_color,
      borderWidth: 1,
    },

    date: {
      fontWeight: "600",
      marginBottom: 6,
      textAlign: "center",
      color: safeTheme.secondary_text_color,
    },

    tempRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 6,
    },

    minTemp: {
      fontSize: 10,
      color: safeTheme.secondary_text_color,
    },

    maxTemp: {
      fontSize: 10,
      color: safeTheme.secondary_text_color,
    },

    dayIcon: {
      width: 50,
      height: 50,
      alignSelf: "center",
      marginVertical: 5,
    },

    condition: {
      textAlign: "center",
      fontSize: 12,
      color: safeTheme.text_on_light_bg,
    },

    rain: {
      fontSize: 10,
      textAlign: "center",
      color: safeTheme.text_on_light_bg,
    },

    humidity: {
      fontSize: 10,
      textAlign: "center",
      color: safeTheme.text_on_light_bg,
    },
    hour_mm: {
      color: safeTheme.text_on_light_bg,
      fontSize: 10,
    },
    noData: {
      textAlign: "center",
      marginTop: 10,
      color: safeTheme.secondary_text_color,
    },
  });