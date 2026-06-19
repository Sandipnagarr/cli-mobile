import { Pressable, View, StyleSheet, Text, ScrollView } from "react-native";
import { useContext, useState } from "react";
import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme";
import { useEffect } from "react";
import { postrequest } from "../api/Api"
import { HAZARD_ICONS } from '../Icon';
import { Image } from "react-native";
export default function BadHazard() {
const { theme,circle } = useContext(WeatherContext);
const safeTheme = theme || defaultTheme;
const Styles = createStyles(safeTheme);
const [accordian, showAccordian] = useState(false);
const [hazardData, setHazardData] = useState([]);
const [activeButton, setActiveButton] = useState("Cyclone");
const [legendData, setLegendData] = useState(null);


const hazardIconMap = {
  Cyclone: HAZARD_ICONS.find(i => i.name === "Thunderstorm")?.icon,
  Lightning: HAZARD_ICONS.find(i => i.name === "Lightning")?.icon,
  Flood: HAZARD_ICONS.find(i => i.name === "Flood")?.icon,
  Avalanche: HAZARD_ICONS.find(i => i.name === "Avalanch")?.icon,
  Snowfall: HAZARD_ICONS.find(i => i.name === "Snowfall")?.icon,
  Fog: HAZARD_ICONS.find(i => i.name === "Fog")?.icon,
};
const fetchHazardData = async () => {
  let circlePayload = circle === "All India" ? "M&G" : circle;

  try {

const response = await postrequest(
  "/get-district-wise-hazards",
  {
    circle: circlePayload,
    hazardType: activeButton,
  }
);


setHazardData(response?.data || []);

    setHazardData(response?.data || []);
  } catch (error) {
    console.log(error);
  }
};
const fetchLegendData = async () => {
  try {
    const response = await postrequest("/fetch-kpi-range", {});

    const circleKey =circle === "All India" ? "M&G" : circle;

    const legend =response?.data?.[circleKey]?.[0] || null;

    setLegendData(legend);
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  fetchHazardData();
  fetchLegendData();
}, [circle, activeButton]);

const getColorStyle = color => {
  switch (color?.toLowerCase()) {
    case "extreme":
      return { backgroundColor: "#ff0000" };

    case "high":
      return { backgroundColor: "#ffa500" };

    case "moderate":
      return { backgroundColor: "#e6ff00" };

    case "low":
      return { backgroundColor: "#ffffff" };

    case "other":
      return { backgroundColor: "#ffffff" };

    default:
      return { backgroundColor: "#ffffff" };
  }
};
const legendKeyMap = {
  Cyclone: {
    extreme: "extreme_cyclone",
    high: "high_cyclone",
    moderate: "moderate_cyclone",
    low: "low_cyclone",
  },
  Lightning: {
    extreme: "extreme_lightning",
    high: "high_lightning",
    moderate: "moderate_lightning",
    low: "low_lightning",
  },
  Flood: {
    extreme: "extreme_flood",
    high: "high_flood",
    moderate: "moderate_flood",
    low: "low_flood",
  },
  Avalanche: {
    extreme: "extreme_avalanche",
    high: "high_avalanche",
    moderate: "moderate_avalanche",
    low: "low_avalanche",
  },
  Snowfall: {
    extreme: "extreme_snowfall",
    high: "high_snowfall",
    moderate: "moderate_snowfall",
    low: "low_snowfall",
  },
  Fog: {
    extreme: "extreme_visibility",
    high: "high_visibility",
    moderate: "moderate_visibility",
    low: "low_visibility",
  },
};
const currentLegend = legendKeyMap[activeButton];
const displayHazardData =
  hazardData?.length > 0
    ? hazardData
    : [
        {
          district: "No Data Available",
          Day1: { severity: "No Risk", for_color: "other" },
          Day2: { severity: "No Risk", for_color: "other" },
          Day3: { severity: "No Risk", for_color: "other" },
          Day4: { severity: "No Risk", for_color: "other" },
          Day5: { severity: "No Risk", for_color: "other" },
          Day6: { severity: "No Risk", for_color: "other" },
          Day7: { severity: "No Risk", for_color: "other" },
        },
      ];
  const hazardButtons = [
    {
      key: "Cyclone",
      label: "Cyclone",
      icon: "",
    },
    
    {
  key: "Lightning",
  label: "Lightning",

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
  const headingMap = {
  Flood: 'Flood Forecast - 7 Days (Affected Area %)',
  Cyclone: 'Cyclone Forecast - 7 Days (kmph)',
  Snowfall: 'Snowfall Forecast - 7 Days (cm)',
  Avalanche: 'Avalanche Occurrence Probability Forecast - 7 Days',
  Lightning: 'Lightning Occurrence Probability Forecast - 7 Days',
  Fog: 'Fog Forecast - 7 Days (m)',
};
const getDateLabels = () => {
  const today = new Date();
  const datesRange = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);

    datesRange.push(
      d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      }),
    );
  }

  return datesRange;
};

const datesRange = getDateLabels();
  return (
    <View style={Styles.section}>
      <Pressable
  style={[Styles.accordionTab,accordian && Styles.activeAccordionTab]}
        onPress={() => showAccordian(!accordian)}
      >
        <Text
  style={[
    Styles.tabTitle,
    { color: accordian ? safeTheme.secondary_text_color : '#fff' },
  ]}
> Hazard Forecast </Text>
        <Text style={Styles.arrow}>{accordian ? "▲" : "▼"}</Text>
      </Pressable>

      {accordian && (
       <View>
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    style={Styles.buttonContainer}
  >
    {hazardButtons.map(button => (
      <Pressable
        key={button.key}
        style={[
          Styles.hazardButton,
          activeButton === button.key && {
            backgroundColor: safeTheme.active_button_color,
          },
        ]}
        onPress={() => setActiveButton(button.key)}
      >
       <>
 <Image
  source={hazardIconMap[button.key]}
  resizeMode="contain"
  style={[
    Styles.hazardIcon,
    {
      width: 16,
      height: 16,
      tintColor: '#fff',
        marginRight: 8,
    },
  ]}
/>

  <Text style={Styles.hazardButtonText}>
    {button.label}
  </Text>
</>
      </Pressable>
    ))}
  </ScrollView>

    {/* Heading */}
    <View style={Styles.headingContainer}>
     <Text style={Styles.headingText}>
  {headingMap[activeButton]}
</Text>
    </View>

    {/* Legend */}
<ScrollView
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={Styles.legendRow}
>
  <Text style={Styles.legendTitle}>Legend</Text>

  <View style={Styles.legendItem}>
    <View
      style={[
        Styles.legendBox,
        {
          backgroundColor:
            legendData?.severity_extreme_color || "#ff0000",
        },
      ]}
    />
    <Text style={Styles.legendText}>
      Extreme ({legendData?.[currentLegend?.extreme]})
    </Text>
  </View>

  <View style={Styles.legendItem}>
    <View
      style={[
        Styles.legendBox,
        {
          backgroundColor:
            legendData?.severity_high_color || "#FFA500",
        },
      ]}
    />
    <Text style={Styles.legendText}>
      High ({legendData?.[currentLegend?.high]})
    </Text>
  </View>

  <View style={Styles.legendItem}>
    <View
      style={[
        Styles.legendBox,
        {
          backgroundColor:
            legendData?.severity_moderate_color || "#eeff00",
        },
      ]}
    />
    <Text style={Styles.legendText}>
      Moderate ({legendData?.[currentLegend?.moderate]})
    </Text>
  </View>

  <View style={Styles.legendItem}>
    <View
      style={[
        Styles.legendBox,
        {
          backgroundColor:
            legendData?.severity_low_color || "#ffffff",
        },
      ]}
    />
    <Text style={Styles.legendText}>
      Low ({legendData?.[currentLegend?.low]})
    </Text>
  </View>

  {activeButton === "Fog" && (
    <View style={Styles.legendItem}>
      <View
        style={[
          Styles.legendBox,
          { backgroundColor: "#f5f5f5" },
        ]}
      />
      <Text style={Styles.legendText}>
        Other ({">1"})
      </Text>
    </View>
  )}
</ScrollView>
<ScrollView horizontal>
  <View style={Styles.table}>
    {/* Header Row */}
 <View style={Styles.groupRow}>

  <Text style={Styles.groupShort}>
    Short Range Prediction
  </Text>

  <Text style={Styles.groupLong}>
    Long Range Prediction
  </Text>
</View>
  <View style={Styles.row}>
  <Text style={Styles.headerCell}>
    Districts
  </Text>

  {datesRange.map(date => (
    <Text key={date} style={Styles.headerCell}>
      {date}
    </Text>
  ))}
</View>
{displayHazardData.map(row => (
      <View key={row.district} style={Styles.row}>
        <Text style={Styles.districtCell}>
          {row.district}
        </Text>

        {[1, 2, 3, 4, 5, 6, 7].map(day => {
     const dayData = row[`Day${day}`] || {
  severity: "No Risk",
  for_color: "other",
};

          return (
         <Text
  key={day}
  style={[
    Styles.valueCell,
    getColorStyle(dayData?.for_color),
  ]}
>
  {dayData?.severity || 'No Risk'}
</Text>
          );
        })}
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
      marginTop: 1,
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

    tabTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 14,
      fontWeight: "600",
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

    hazardButtonText: {
      color: "#fff",
      fontWeight: "600",
      fontSize: 12,
    },

    hazardIcon: {
      width: 18,
      height: 18,
      tintColor: "#fff",
      marginRight: 8,
    },

    buttonContainer: {
      marginVertical: 10,
      fontSize:8,
    },

    headingContainer: {
      backgroundColor: "#0080d6",
      paddingVertical: 10,
    },

    headingText: {
      color: "#fff",
      textAlign: "center",
      fontWeight: "700",
      fontSize: 14,
    },

    legendRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: "#f5f5f5",
    },

    legendTitle: {
      fontWeight: "700",
      marginRight: 10,
      fontSize:13
    },

    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      marginRight: 5,
      
    },

    legendBox: {
      width: 12,
      height: 12,
      marginRight: 6,
      borderWidth: 1,
      borderColor: "#000",
    },

    table: {
      borderWidth: 1,
      borderColor: "#0080d6",
      
    },

    groupRow: {
      flexDirection: "row",
    },

    groupDistrict: {
      width: 120,
      borderWidth: 1,
      borderColor: "#0080d6",
      backgroundColor: "#f0f0f0",
      textAlign: "center",
      padding: 8,
      fontWeight: "700",
    },

   groupShort: {
  width: 480,
  borderWidth: 1,
  borderColor: "#0080d6",
  backgroundColor: "#f0f0f0",
  textAlign: "center",
  padding: 8,
  fontSize: 12,
  fontWeight: "600",
},

groupLong: {
  width: 480,
  borderWidth: 1,
  borderColor: "#0080d6",
  backgroundColor: "#f0f0f0",
  textAlign: "center",
  padding: 6,
  fontSize: 12,
  fontWeight: "600",
},

    row: {
      flexDirection: "row",
    },

   headerCell: {
  width: 120,
  borderWidth: 1,
  borderColor: "#0080d6",
  backgroundColor: "#f0f0f0",
  textAlign: "center",
  padding: 8,
  fontWeight: "700",
  fontSize: 11,
},

    districtCell: {
      width: 120,
      borderWidth: 1,
      borderColor: "#0080d6",
      padding: 8,
      fontSize: 10,
    },

    valueCell: {
      width: 120,
      borderWidth: 1,
      borderColor: "#0080d6",
      textAlign: "center",
      padding: 8,
      fontSize: 10,
    },
  });