import { Pressable, View, StyleSheet, Text, ScrollView } from "react-native";
import { useContext, useState } from "react";
import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme";

export default function BadHazard() {
  const { theme } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const Styles = createStyles(safeTheme);
  const [accordian, setaccordian] = useState(false);

  const hazardButtons = [
    {
      key: "Cyclone",
      label: "Cyclone",
      icon: "",
    },
    {
      key: "Lighting",
      label: "Lighting",
      icon: "",
    },
    {
      key: "Flood",
      label: "Flood",
      icon: "",
    },
    {
      key: "Avalanche",
      label: "Avalanche",
      icon: "",
    },
    {
      key: "Snowfall",
      label: "Snowfall",
      icon: "",
    },
    {
      key: "Fog",
      label: "Fog",
      icon: "",
    },
  ];

  return (
    <View style={Styles.section}>
      <Pressable
        style={Styles.accordionTab}
        onPress={() => setaccordian(!accordian)}
      >
        <Text style={Styles.sectionTitle}> Hazard Forecast </Text>
        <Text style={Styles.arrow}>{accordian ? "▲" : "▼"}</Text>
      </Pressable>

      {accordian && (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            style={Styles.buttonContainer}
          >
            {hazardButtons.map((button) => (
              <Pressable key={button.key} style={Styles.hazardButton}>
                <Text style={Styles.hazardButtonText}>{button.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const createStyles = (safeTheme) =>
  StyleSheet.create({
    section: {
      marginTop: 1,
    },
    accordionTab: {
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: safeTheme.primary_button_bg,
      paddingHorizontal: 15,
      paddingVertical: 15,
      position: "relative",
    },
    arrow: {
      position: "absolute",
      right: 15,
      color: safeTheme.text_on_dark_bg,
    },
    sectionTitle: {
      textAlign: "center",
      fontWeight: "700",
      color: safeTheme.text_on_dark_bg,
    },

    hazardButton: {
      backgroundColor: "#0077b6",
      paddingHorizontal: 7,
      paddingVertical: 9,
      borderRadius: 10,
      marginRight: 6,
      marginLeft: 6,
      width: 100,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    buttonContainer: {
      marginVertical: 10,
    },
  });
