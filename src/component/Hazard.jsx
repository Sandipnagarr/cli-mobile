import React, { useState, useContext, useEffect, useEffectEvent } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView,Image } from "react-native";
import { HAZARD_ICONS } from '../Icon';
import { postrequest } from "../api/Api";


import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme";

export default function Hazard() {
  const [activeHazard, setActiveHazard] = useState(null);
  const [hazardTypes, setHazardTypes] = useState([]);
  const [showHazard, setShowHazard] = useState(false);
  const [severityTypes, setSeverityTypes] = useState([]);
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [showDropdown, setShowDropdown] = useState(false);
  const [hazard, setHazard] = useState([]);
  const { theme, circle } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);
  

  const getIcon = name => {
    return HAZARD_ICONS.find(icon => icon.name === name)?.icon;
  };
const hazardIcons = {
  Rainfall: getIcon('Rainfall'),
  Wind: getIcon('Wind'),
  Humidity: getIcon('Drop'),
  Fog: getIcon('Fog'),
  Temperature: getIcon('temprature'),
  'Heat Wave': getIcon('temprature'),
  Thunderstorm: getIcon('Thunderstorm'),
  Snowfall: getIcon('snowflake'),
};
  // ================================
  // FETCH HAZARD TYPES
  // ================================
  const fetchHazardTypes = useEffectEvent(async () => {
    try {
      const json = await postrequest("get-ndma-hazards-list", {
        params: {
          circle: circle,
        },
      });

      // console.log("HAZARD TYPES:", JSON.stringify(json, null, 2));

      const data = json?.data || [];

      setHazardTypes(data);

      // auto select first tab
      if (data.length > 0) {
        const first = data[0] === "Rainfall" ? "Rain" : data[0];

        setActiveHazard(first);
      }
    } catch (error) {
      console.log("Hazard type error:", error);
    }
  });

  // ================================
  // FETCH SEVERITY
  // ================================
  const fetchSeverity = useEffectEvent(async () => {
    try {
      const json = await postrequest("get-ndma-severity-list", {
        params: {
          circle: circle,
          hazardType: activeHazard,
        },
      });

      // console.log("SEVERITY RESPONSE:", JSON.stringify(json, null, 2));

      const data = json?.data || [];

      const severityList = ["All"];

      data.forEach((item) => {
        if (item?.severity) {
          severityList.push(item.severity);
        }
      });

      setSeverityTypes(severityList);
    } catch (error) {
      console.log("Severity error:", error);
    }
  
  });

  // ================================
  // FETCH HAZARD DATA
  // ================================
  const fetchHazardCurrentDay = useEffectEvent(async () => {
    try {
      const json = await postrequest("get-ndma-today-disasters", {
        params: {
          hazardType: activeHazard,
          severityType: selectedSeverity,
          circle: circle,
        },
      });

      // console.log("FULL RESPONSE: disaster", JSON.stringify(json, null, 2));

      const features = json?.data?.features || [];

      const hazardData = features.map((item) => ({
        id: item.id,
        district: item.properties?.district,
        state: item.properties?.state_ut,
        event: item.properties?.disaster_type,
        severity: item.properties?.severity,
        effective: item.properties?.effective_start_time,
        expires: item.properties?.effective_end_time,
        description: item.properties?.warning_message,
        geom: item.geometry,
        raw: item,
      }));

      setHazard(hazardData);
    } catch (error) {
      console.log("Hazard fetch error:", error);
    }
  });

  // ================================
  // EFFECTS
  // ================================
  useEffect(() => {
    fetchHazardTypes();
  }, [circle]);

  useEffect(() => {
    if (!activeHazard) return;

    fetchSeverity();
  }, [activeHazard, circle]);

  useEffect(() => {
    if (!activeHazard) return;

    fetchHazardCurrentDay();
  }, [activeHazard, selectedSeverity, circle]);

  return (
    <View style={styles.hazardCard}>
      {/* HEADER */}
      <Pressable
        style={[styles.accordionTab, showHazard && styles.activeAccordionTab]}
        onPress={() => setShowHazard(!showHazard)}
      >
        <Text
          style={[
            styles.tabTitle,
            {
              color: showHazard ? safeTheme.secondary_text_color : "#fff",
            },
          ]}
        >
          Weather Hazards
        </Text>

        <Text style={styles.arrow}>{showHazard ? "▲" : "▼"}</Text>
      </Pressable>

      {/* BODY */}
      {showHazard && (
        <View style={{ padding: 10 }}>
          {/* HAZARD TYPE */}
          <Text style={styles.label}>Hazard Type</Text>

          <View style={styles.hazardTabs}>
            {hazardTypes.map((item) => {
              const selected =
                activeHazard === (item === "Rainfall" ? "Rain" : item);

              return (
                <Pressable
                  key={item}
                  onPress={() =>
                    setActiveHazard(item === "Rainfall" ? "Rain" : item)
                  }
                  style={[
                    styles.hazardButton,
                    selected && styles.activeHazardButton,
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Image
                      source={hazardIcons[item]}
                      style={{
                        width: 14,
                        height: 14,
                        tintColor: '#fff',
                      }}
                      resizeMode="contain"
                    />

                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                      }}
                    >
                      {item}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* SEVERITY */}
          <Text style={styles.label}>Severity</Text>

          <Pressable
            style={styles.dropdown}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text
              style={{
                color: safeTheme.secondary_text_color,
              }}
            >
              {selectedSeverity} ▼
            </Text>
          </Pressable>

          {showDropdown && (
            <View style={styles.dropdownList}>
              {severityTypes.map((item, index) => (
                <Pressable
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSeverity(item);

                    setShowDropdown(false);
                  }}
                >
                  <Text
                    style={{
                      color: safeTheme.secondary_text_color,
                    }}
                  >
                    {item}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* TABLE */}
          <ScrollView horizontal>
            <View>
              {/* HEADER */}
              <View style={styles.tableHeader}>
                <Text style={styles.th}>S.No</Text>
                <Text style={styles.th}>District</Text>
                <Text style={styles.th}>State</Text>
                <Text style={styles.th}>Type</Text>
                <Text style={styles.th}>Severity</Text>
                <Text style={styles.th}>Effective</Text>
                <Text style={styles.th}>Expires</Text>
                <Text style={styles.th}>Description</Text>
              </View>

              {/* ROWS */}
              {hazard.map((item, index) => (
                <View
                  key={item.id || index}
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor:
                        item.raw?.properties?.severity_color || "#fff",
                    },
                  ]}
                >
                  <Text style={styles.td}>{index + 1}</Text>
                  <Text style={styles.td}>{item.district}</Text>
                  <Text style={styles.td}>{item.state}</Text>
                  <Text style={styles.td}>{item.event}</Text>
                  <Text style={styles.td}>{item.severity}</Text>
                  <Text style={styles.td}>{item.effective}</Text>
                  <Text style={styles.td}>{item.expires}</Text>
                  <Text style={styles.td}>{item.description}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* NO DATA */}
          {hazard.length === 0 && (
            <Text style={styles.noData}>
              No data found for selected filters.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}


const createStyles = (safeTheme) =>
  StyleSheet.create({
    accordionTab: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: safeTheme.primary_button_bg,
    },

    activeAccordionTab: {
      backgroundColor: safeTheme.accordion_active_bg,
    },

    tabTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 16,
      fontWeight: "600",
    },

    arrow: {
      position: "absolute",
      right: 15,
      color: "#fff",
    },

    hazardCard: {
      backgroundColor: "#fff",
      borderColor: safeTheme.primary_border_color,
      borderWidth: 1,
      overflow: "hidden",
    },

    label: {
      marginBottom: 6,
      fontWeight: "600",
      color: safeTheme.secondary_text_color,
    },

    hazardTabs: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 12,
    },

    hazardButton: {
      backgroundColor: safeTheme.primary_button_bg,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
    },

    activeHazardButton: {
      backgroundColor: safeTheme.active_button_color,
    },

    dropdown: {
      borderWidth: 1,
      borderColor: safeTheme.primary_border_color,
      padding: 10,
      borderRadius: 6,
      marginBottom: 10,
    },

    dropdownList: {
      borderWidth: 1,
      borderColor: safeTheme.primary_border_color,
      borderRadius: 6,
      marginBottom: 10,
    },

    dropdownItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderColor: safeTheme.primary_border_color,
    },

    tableHeader: {
      flexDirection: "row",
      backgroundColor: safeTheme.primary_button_bg,
    },

    tableRow: {
      flexDirection: "row",

      borderBottomWidth: 1,
      borderRightWidth: 1,

      borderColor: "#d1d5db",
    },

    th: {
      width: 120,

      fontWeight: "bold",

      fontSize: 12,

      color: "#fff",

      paddingVertical: 10,
      paddingHorizontal: 8,
    },

    td: {
      width: 120,

      fontSize: 10,

      paddingVertical: 10,
      paddingHorizontal: 8,

      borderLeftWidth: 1,
      borderTopWidth: 1,

      borderColor: "#d1d5db",

      color: safeTheme.secondary_text_color,
    },

    noData: {
      textAlign: "center",
      marginTop: 10,
      color: safeTheme.secondary_text_color,
    },
  });
