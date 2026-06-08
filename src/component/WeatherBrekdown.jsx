import React, { useContext, useEffect, useState } from "react";
import { StackedBarChart } from "react-native-chart-kit";

import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { defaultTheme } from "../theme";
import { WeatherContext } from "../context/WeatherContext";
import { postrequest } from "../api/Api";
import TempCard  from "../component/TempCards";

export default function WeatherBreakdown() {
  const { theme } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);
  const [accordian, setAccordian] = useState(true);
  const { circle, reportData ,setReportData} = useContext(WeatherContext);


  const fetchreport = async() => {
    try {
       let circlePayload = circle === "All India" ? "M&G" : circle;
      const response = await postrequest("/fetch_circle_report", {
        circle: circlePayload,
      });
      const data = await response;
      setReportData(data);
      // console.log("Report API Response:", JSON.stringify(data, null, 2));
    }
    catch(error){
      console.log("Report API Error:", error);
    }
  }

  useEffect(() => { fetchreport(), [] }, [circle]);
  
  const chartData = reportData?.day1 && {
    labels: [
      "Rainfall",
      "Wind",
      "Humidity",
      "Visibility",
      "Temp Max",
      "Temp Min",
    ],
    data: [
      [
        reportData.day1.Rainfall.moderate||null,
        reportData.day1.Rainfall.high||null,
        reportData.day1.Rainfall.extreme||null,
      ],

      [
        reportData.day1.Wind.moderate||null,
        reportData.day1.Wind.high||null,
        reportData.day1.Wind.extreme||null,
      ],

      [
        reportData.day1.Humidity.moderate||null,
        reportData.day1.Humidity.high||null,
        reportData.day1.Humidity.extreme||null,
      ],

      [
        reportData.day1.Visibility.moderate||null,
        reportData.day1.Visibility.high||null,
        reportData.day1.Visibility.extreme||null,
      ],

      [
        reportData.day1.Temperature_Max.moderate||null,
        reportData.day1.Temperature_Max.high||null,
        reportData.day1.Temperature_Max.extreme||null,
      ],

      [
        reportData.day1.Temperature_Min.moderate||null,
        reportData.day1.Temperature_Min.high||null,
        reportData.day1.Temperature_Min.extreme||null,
      ],
    ],

    barColors: ["#facc15", "#fb923c", "#ef4444",],
  };
  

  return (
    <View style={styles.section}>
      {/* HOURLY TAB */}
      <Pressable
        style={[styles.accordionTab, accordian && styles.activeAccordionTab]}
        onPress={() => setAccordian(!accordian)}
      >
        <Text
          style={[
            styles.tabTitle,
            { color: accordian ? safeTheme.secondary_text_color : "#fff" },
          ]}
        >
          weather parameter breakdown
        </Text>
        <Text style={styles.arrow}>{accordian ? "▲" : "▼"}</Text>
      </Pressable>
      {accordian && (
        <ScrollView>
          {chartData && (
            <StackedBarChart
              data={chartData}
              width={screenWidth}
              height={260}
              formatYLabel={(value) => parseInt(value).toString()}
              chartConfig={{
              propsForBackgroundLines: { stroke: "transparent"},
                
                backgroundColor: "#fff",
                propsForLabels: {
                  fontSize: 10,
                },
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",

                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                labelColor: (opacity = 1) =>`rgba(80,80,80,${opacity})`,
              }}
              style={{
                borderRadius: 20,
                marginTop: 15,
              }}
              hideLegend={false}
            />
          )}

          <TempCard />
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

    header: {
      flexDirection: "row",

      justifyContent: "space-between",

      alignItems: "center",
    },

    title: {
      fontSize: 18,

      fontWeight: "700",
    },

    infoBox: {
      marginTop: 20,

      gap: 10,
    },
    noData: {
      textAlign: "center",
      marginTop: 10,
      color: safeTheme.secondary_text_color,
    },
  });