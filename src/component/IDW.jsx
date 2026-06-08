import React, { useContext } from "react";
import { View, Text, Pressable, StyleSheet,Image, ScrollView } from "react-native";
import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme";
import { HAZARD_ICONS } from '../Icon';

const IDW_MESSAGE_TYPES = {
  rainfall: "RAIN_IDW",
  wind: "WIND_IDW",
  humidity: "HUMIDITY_IDW",
  visibility: "VISIBILITY_IDW",
  temperature: "TEMPERATURE_IDW",
};

export default function IDW({ webViewRef, setLoading, activeType = null }) {
  const { theme } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);

  const handlePress = (type) => {
    if (!webViewRef.current) return;

    const messageType = IDW_MESSAGE_TYPES[type];
    if (!messageType) return;

    setLoading(true);
    webViewRef.current.postMessage(JSON.stringify({ type: messageType }));


    
  };
  const getIcon = name => {
    return HAZARD_ICONS.find(item => item.name === name)?.icon;
  };
  const IDW_OPTIONS = [
    {
      key: 'rainfall',
      label: 'Rainfall',
      icon: getIcon('Rainfall'),
    },
    {
      key: 'wind',
      label: 'Wind',
      icon: getIcon('Wind'),
    },
    {
      key: 'humidity',
      label: 'Humidity',
      icon: getIcon('Drop'),
    },
    {
      key: 'visibility',
      label: 'Visibility',
      icon: getIcon('Eye'),
    },
    {
      key: 'temperature',
      label: 'Temperature',
      icon: getIcon('temprature'),
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 8 }}
    >
      {' '}
      <View style={styles.container}>
        {IDW_OPTIONS.map(option => (
          <Pressable
            key={option.key}
            style={[
              styles.button,
              activeType === option.key && styles.activeButton,
            ]}
            onPress={() => handlePress(option.key)}
          >
            <Image
              source={option.icon}
              style={{
                width: 18,
                height: 18,
                tintColor: '#fff',
              }}
              resizeMode="contain"
            />
            <Text style={styles.text}> {option.label}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      padding: 8,
    },
    button: {
      backgroundColor: theme.primary_button_bg,
      padding: 8,
      margin: 2,
      borderRadius: 6,
      flexDirection: "row",
      alignItems: "center",
    },
    text: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 11,
    },
    activeButton: {
      backgroundColor: theme.secondary_button_bg || "#381405",
    },
  });
