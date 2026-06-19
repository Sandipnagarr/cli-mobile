import React, { useEffect, useContext, useState } from "react";
import { ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { postrequest } from "../api/Api";
import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme";
import { HAZARD_ICONS } from '../Icon';
export default function TempCards(){
  const { circle} = useContext(WeatherContext);
  const [dayCards, setDayCards] = useState([]);
  const [severityTable, setSeverityTable] = useState([]);
  const { theme } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);

const getIcon = name => HAZARD_ICONS.find(item => item.name === name)?.icon;

  const iconRows = [
    {
      key: 'rain',
      icon: getIcon('Rainfall'),
    },
    {
      key: 'wind',
      icon: getIcon('Wind'),
    },
    {
      key: 'humidity',
      icon: getIcon('Drop'),
    },
    {
      key: 'visibility',
      icon: getIcon('Eye'),
    },
    {
      key: 'tempMax',
      icon: getIcon('temprature'),
    },
    {
      key: 'tempMin',
      icon: getIcon('temprature'),
    },
  ];
  // fetch api for temp cards data..............
const fetchTempCards = async () => {
  try {
    let circlePayload = circle === "All India" ? "M&G" : circle;

    const response = await postrequest("fetch_circle_report", {
      circle: circlePayload,
    });

    //
    const cards = formatTempCards(response);

    setDayCards(cards);

  } catch (error) {
    console.log(error);
  }
  };
  const fetchseverity = async() => {
    try {
      let circlePayload = circle === "All India" ? 'M&G' : circle;
      const response = await postrequest("/fetch_kpi_legend_with_color", {
        circle: circlePayload,
  
      });

      const legend = response.data;

      const severityData = [
        {
          label: "Extreme",
          color: legend.color.extreme_color,

          values: [
            legend.rainfall.extreme,
            legend.wind.extreme,
            legend.humidity.extreme,
            legend.visibility.extreme,
            legend.temperature.extreme,
            legend.min_temp.extreme,
          ],
        },

        {
          label: "High",
          color: legend.color.high_color,

          values: [
            legend.rainfall.high,
            legend.wind.high,
            legend.humidity.high,
            legend.visibility.high,
            legend.temperature.high,
            legend.min_temp.high,
          ],
        },

        {
          label: "Moderate",
          color: legend.color.moderate_color,

          values: [
            legend.rainfall.moderate,
            legend.wind.moderate,
            legend.humidity.moderate,
            legend.visibility.moderate,
            legend.temperature.moderate,
            legend.min_temp.moderate,
          ],
        },
      ];

      setSeverityTable(severityData);
      
    }
    catch (error) {
      console.log("severity api error",error)
    }
     
   }

  useEffect(() => {
    fetchTempCards();
    fetchseverity();
  }, [circle]);


  // format api response for temp cards data..............
const formatTempCards = (data) => {
  return Object.keys(data).slice(1) // skip current day
   .map((dayKey, index) => {
      const day = data[dayKey];

      return {
        id: index + 1,

        day: new Date(day.Humidity.date).toLocaleDateString("en-US", {
          weekday: "short",
        }),

        date: day.Visibility.date,

        rows: [
          {
            v1: day.Rainfall.extreme,
            v2: day.Rainfall.high,
            v3: day.Rainfall.moderate,
          },

          {
            v1: day.Wind.extreme,
            v2: day.Wind.high,
            v3: day.Wind.moderate,
          },

          {
            v1: day.Humidity.extreme,
            v2: day.Humidity.high,
            v3: day.Humidity.moderate,
          },

          {
            v1: day.Visibility.extreme,
            v2: day.Visibility.high,
            v3: day.Visibility.moderate,
          },

          {
            v1: day.Temperature_Max.extreme,
            v2: day.Temperature_Max.high,
            v3: day.Temperature_Max.moderate,
          },

          {
            v1: day.Temperature_Min.extreme,
            v2: day.Temperature_Min.high,
            v3: day.Temperature_Min.moderate,
          },
        ],
      };
    });
};
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>
        District Count of Weather Parameter for Next 6 Days
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={true}>
        <View style={styles.contentRow}>
          <View style={styles.iconColumn}>
            <Text style={styles.dateLabel}>Date</Text>

            {iconRows.map(item => (
              <View key={item.key} style={styles.iconCell}>
                <View style={styles.weatherIcon}>
                  <Image
                    source={item.icon}
                    style={{
                      width: 16,
                      height: 16,
                      tintColor: '#fff',
                    }}
                    resizeMode="contain"
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.cardsContainer}>
            {dayCards.map(card => (
              <View key={card.id} style={styles.dayCard}>
                <Text style={styles.cardHeader}>
                  {card.day}, {card.date}
                </Text>

                {card.rows.map((row, index) => (
                  <View key={index} style={styles.valueRow}>
                    <View
                      style={[
                        styles.valueBox,
                        index === 5 ? styles.tempMinExtreme : styles.extremeBox,
                      ]}
                    >
                      <Text style={styles.valueText}>{row.v1}</Text>
                    </View>

                    <View
                      style={[
                        styles.valueBox,
                        index === 5 ? styles.tempMinHigh : styles.highBox,
                      ]}
                    >
                      <Text style={styles.valueText}>{row.v2}</Text>
                    </View>

                    <View
                      style={[
                        styles.valueBox,
                        index === 5
                          ? styles.tempMinModerate
                          : styles.moderateBox,
                      ]}
                    >
                      <Text style={styles.valueText}>{row.v3}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <ScrollView horizontal>
        <View style={styles.table}>
          {/* HEADER */}

          <View style={styles.headerRow}>
            <Text style={styles.severityHeader}>Severity</Text>

            {[
              { icon: getIcon('Rainfall'), label: 'Rainfall (mm)' },
              { icon: getIcon('Wind'), label: 'Wind (kmph)' },
              { icon: getIcon('Drop'), label: 'Humidity (%)' },
              { icon: getIcon('Eye'), label: 'Visibility(km)' },
              { icon: getIcon('temprature'), label: 'Temp (max)' },
              { icon: getIcon('temprature'), label: 'Temp (min)' },
            ].map((item, index) => (
              <View key={index} style={styles.headerCell}>
                <View style={styles.iconCircle}>
                  <Image
                    source={item.icon}
                    style={{
                      width: 16,
                      height: 16,
                      tintColor: '#fff',
                    }}
                    resizeMode="contain"
                  />
                </View>

                <Text style={styles.headerText}>{item.label}</Text>
              </View>
            ))}
          </View>

          {severityTable.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text
                style={[
                  styles.severity,
                  {
                    backgroundColor: item.color,
                  },
                ]}
              >
                {item.label}
              </Text>

              {item.values.map((value, i) => (
                <Text key={i} style={styles.cell}>
                  {value}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const createStyles = (safeTheme) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: "#ffffff",
      borderRadius: 12,
      padding: 14,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 3,
    },
    title: {
      fontSize: 11,
      fontWeight: "700",
      textAlign: "center",
      marginBottom: 14,
      color: "#222",
    },
    contentRow: {
      flexDirection: "row",
    },
    iconColumn: {
      backgroundColor: "#f5f5f5",
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 8,
      marginRight: 12,
      alignItems: "center",
    },
    dateLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: "#333",
      marginBottom: 10,
    },
    iconCell: {
      marginBottom: 8,
    },
    weatherIcon: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: safeTheme.primary_icon_color,
      alignItems: "center",
      justifyContent: "center",
    },
    cardsContainer: {
      flexDirection: "row",
    },
    dayCard: {
      width: 155,
      backgroundColor: "#f9f9f9",
      borderRadius: 10,
      padding: 12,
      marginRight: 12,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardHeader: {
      textAlign: "center",
      fontSize: 10,
      fontWeight: "600",
      color: "#222",
      marginBottom: 10,
    },
    valueRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    valueBox: {
      width: 35,
      height: 30,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    extremeBox: {
      backgroundColor: safeTheme.extreme_color,
    },
    highBox: {
      backgroundColor:   safeTheme.high_color,
    },
    moderateBox: {
      backgroundColor:   safeTheme.moderate_color,
    },
    tempMinExtreme: {
      backgroundColor: "#3d7fe0", // dark blue
    },

    tempMinHigh: {
      backgroundColor: "#5ca0e4", // medium blue
    },

    tempMinModerate: {
      backgroundColor: "#b1d3ee", // light blue
    },
    valueText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#111",
    },
    table: {
      borderWidth: 1,
      borderColor: "#0d7cc1",
    },

    headerRow: {
      flexDirection: "row",
      backgroundColor: "#cce7ef",
    },

    headerCell: {
      width: 120,
      height: 55,

      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",

      borderWidth: 1,
      borderColor: "#0d7cc1",
    },

    severityHeader: {
      width: 110,
      textAlign: "center",
      fontWeight: "700",
      fontSize: 10,
      borderWidth: 0.5,
      borderColor: "#0d7cc1",
      padding: 18,
    },

    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: safeTheme.primary_button_bg,

      justifyContent: "center",
      alignItems: "center",

      marginRight: 6,
    },

    headerText: {
      fontWeight: "700",
      fontSize: 10,
    },

    row: {
      flexDirection: "row",
    },

    severity: {
      width: 110,
      padding: 14,
      fontWeight: "700",
      fontSize: 10,
      borderWidth: 1,
      borderColor: "#0d7cc1",
    },

    cell: {
      width: 120,
      padding: 12,
      borderWidth: 1,
      borderColor: "#0d7cc1",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      fontSize: 10,
    },

    extreme: {
      backgroundColor: "red",
    },

    high: {
      backgroundColor: "orange",
    },

    moderate: {
      backgroundColor: "yellow",
    },

    blueDark: {
      width: 20,
      height: 20,
      backgroundColor: "#4a90e2",
    },

    blueMedium: {
      width: 20,
      height: 20,
      backgroundColor: "#7fb3ff",
    },

    blueLight: {
      width: 20,
      height: 20,
      backgroundColor: "#b7d4ff",
    },
  });

