import { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';

import { defaultTheme } from "../theme";
import { WeatherContext } from "../context/WeatherContext";
import { postrequest } from "../api/Api";
import { HAZARD_ICONS } from '../Icon';

export default function TodayHazard() {
  const { theme, circle } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);
  const [accordian, showAccordian] = useState(false);
const [hazardData, setHazardData] = useState({});

const getIcon = name => {
  return HAZARD_ICONS.find(item => item.name === name)?.icon;
};

const hazardIcons = {
  Cyclone: getIcon('Wind'), // use wind image
  Lightning: getIcon('Lightning'),
  Flood: getIcon('Flood'),
  Avalanche: getIcon('Avalanch'),
  Snowfall: getIcon('Snowfall'),
  Fog: getIcon('Fog'),
};

  const fetchhazarddata = async () => {
    try {
      let circlePayload = circle === "All India" ? "M&G" : circle;

      const response = await postrequest("/get-hazard-affected-district", {
        circle: circlePayload,
      });
   


setHazardData(response.data?.[0] || {});
    } catch (error) {
      console.log("hazard error", error);
    }
  };
const currentDate = new Date().toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
  useEffect(() => {
    fetchhazarddata();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circle]);

  return (
    <View style={styles.section}>
      <Pressable
        style={[styles.accordionTab, accordian && styles.activeAccordionTab]}
        onPress={() => showAccordian(!accordian)}
      >
        <Text
          style={[
            styles.tabTitle,
            { color: accordian ? safeTheme.secondary_text_color : '#fff' },
          ]}
        >
          Today's Risk of District for Hazard
        </Text>

        <Text style={styles.arrow}>{accordian ? '▲' : '▼'}</Text>
      </Pressable>

      {accordian && (
        <View>
        <Text style={styles.sectionTitle}>
  Distribution of districts under varying Hazard category for today {currentDate}.
</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator>
            <View style={styles.table}>
              <View style={styles.headerRow}>
                <Text style={styles.parameterHeader}>Hazard</Text>

                <Text style={[styles.header, styles.extremeHeader]}>
                  Extreme
                </Text>

                <Text style={[styles.header, styles.highHeader]}>High</Text>

                <Text style={[styles.header, styles.moderateHeader]}>
                  Moderate
                </Text>

                <Text style={[styles.header, styles.lowHeader]}>Low</Text>
              </View>

              {Object.keys(hazardData)
                .filter(hazard => hazard !== 'Cloudburst')
                .map((hazard, index) => (
                  <View key={index} style={styles.row}>
                    <View style={styles.parameterCell}>
                      <View style={styles.iconCircle}>
                        <Image
                          source={hazardIcons[hazard]}
                          style={{
                            width: 15,
                            height: 15,
                            tintColor: '#fff',
                          }}
                          resizeMode="contain"
                        />
                      </View>

                      <Text style={styles.parameterText}>{hazard}</Text>
                    </View>

                    <Text style={styles.valueCell}>
                      {hazardData[hazard]?.Extreme?.join(', ') || 'Nil'}
                    </Text>

                    <Text style={styles.valueCell}>
                      {hazardData[hazard]?.High?.join(', ') || 'Nil'}
                    </Text>

                    <Text style={styles.valueCell}>
                      {hazardData[hazard]?.Moderate?.join(', ') || 'Nil'}
                    </Text>

                    <Text style={styles.valueCell}>
                      {hazardData[hazard]?.Low?.join(', ') || 'Nil'}
                    </Text>
                  </View>
                ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const createStyles = (safeTheme) =>
  StyleSheet.create({
    section: {
      marginTop: 0,
    },

    accordionTab: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: safeTheme.primary_button_bg,
      padding: 15,
    },

    activeAccordionTab: {
      backgroundColor: safeTheme.accordion_active_bg,
    },

    table: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: "#0080d6",
    },

    headerRow: {
      flexDirection: "row",
      borderColor: "#0080d6",
    },

    row: {
      flexDirection: "row",
      borderColor: "#0080d6",
    },

    parameterHeader: {
      width: 180,
      borderWidth: 1,
      padding: 10,
      borderColor: "#0080d6",
    },

    header: {
      width: 220,
      borderWidth: 1,
      padding: 10,
      textAlign: "center",
      fontSize: 10,
      fontWeight: "700",
      borderColor: "#0080d6",
    },

    extremeHeader: {
      backgroundColor: "red",
    },

    highHeader: {
      backgroundColor: "orange",
    },

    moderateHeader: {
      backgroundColor: "yellow",
    },

    lowHeader: {
      backgroundColor: "#fff",
    },

    parameterCell: {
      width: 180,
      borderWidth: 1,
      padding: 10,
      flexDirection: "row",
      gap: 10,
      alignItems: "center",
      borderColor: "#0080d6",
    },

    valueCell: {
      width: 220,
      borderWidth: 1,
      padding: 15,
      textAlign: "center",
      fontSize: 8,
      borderColor: "#0080d6",
    },

    iconCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: "#0080d6",
      justifyContent: "center",
      alignItems: "center",
    },
    sectionTitle: {
      fontSize: 10,
      alignSelf: "center",
      fontWeight: "700",
      marginTop: 10,
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
    parameterText: {
      fontSize:10
    }
  });
