import { useState, useContext, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Image } from "react-native";
import { defaultTheme } from "../theme";
import { WeatherContext } from "../context/WeatherContext";     
import { postrequest } from "../api/Api";
import { HAZARD_ICONS } from '../Icon';

export default function TodayParameter() { 
  const { theme,circle } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);
   const [accordian, showAccordian] = useState(false);
   const[disttrictdata,setdistrictdata]=useState([]);
    


    const fetchreportdata = async () => {
      try {
        let circlePayload = circle === "All India" ? "M&G" : circle;
        const response = await postrequest(
          "/fetch_district_names_severity_wise",
          {
            circle: circlePayload,
          },
        );

        setdistrictdata(response)
      } catch (error) {
        console.log("report api error", error);
      }
    };
    useEffect(() => {
      fetchreportdata();
    }, [circle])
   const getIcon = name => {
      return HAZARD_ICONS.find(item => item.name === name)?.icon;
    };
const weatherParams = [
  {
    icon: getIcon('Rainfall'),
    key: 'Rainfall',
    label: 'Rainfall',
  },
  {
    icon: getIcon('Wind'),
    key: 'Wind',
    label: 'Wind',
  },
  {
    icon: getIcon('Drop'),
    key: 'Humidity',
    label: 'Humidity',
  },
  {
    icon: getIcon('Eye'),
    key: 'Visibility',
    label: 'Visibility',
  },
  {
    icon: getIcon('temprature'),
    key: 'Temperature_Max',
    label: 'Temp (max)',
  },
  {
    icon: getIcon('temprature'),
    key: 'Temperature_Min',
    label: 'Temp (min)',
  },
];
const currentDate = new Date().toLocaleDateString('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
    return (

        <View style={styles.section}>
          <Pressable
            style={[
              styles.accordionTab,
              accordian && styles.activeAccordionTab,
            ]}
            onPress={() => showAccordian(!accordian)}
          >
            <Text
              style={[
                styles.tabTitle,
                { color: accordian ? safeTheme.secondary_text_color : "#fff" },
              ]}
            >
              Today Risk of Districts for Weather Parameters
            </Text>
              <Text style={styles.arrow}>{accordian ? "▲" : "▼"}</Text>
          </Pressable>

          {accordian && (
            <View>
              <Text style={styles.sectionTitle}>
                Distribution of districts under varying Hazard category for
                today {currentDate}
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator>
                <View style={styles.table}>
                  {/* HEADER */}

                  <View style={styles.headerRow}>
                    <Text style={styles.parameterHeader}>
                      Weather Parameters
                    </Text>

                    <Text style={[styles.header, styles.extremeHeader]}>
                      Extreme
                    </Text>

                    <Text style={[styles.header, styles.highHeader]}>High</Text>

                    <Text style={[styles.header, styles.moderateHeader]}>
                      Moderate
                    </Text>

                    <Text style={[styles.header, styles.lowHeader]}>Low</Text>
                  </View>

                  {weatherParams.map((item, index) => {
                    const data = disttrictdata[item.key]?.day1;

                    return (
                      <View key={index} style={styles.row}>
                        <View style={styles.parameterCell}>
                          <View style={styles.iconCircle}>
                            <Image
                              source={item.icon}
                              style={{
                                width: 14,
                                height: 14,
                                tintColor: '#fff',
                              }}
                              resizeMode="contain"
                            />
                          </View>

                          <Text style={styles.parameterText}>{item.name}</Text>
                          <Text style={styles.parameterText}>{item.label}</Text>

                        </View>

                        {/* Extreme */}

                        <Text style={styles.valueCell}>
                          {data?.extreme_districts?.join(', ') || 'Nil'}
                        </Text>

                        {/* High */}

                        <Text style={styles.valueCell}>
                          {data?.high_districts?.join(', ') || 'Nil'}
                        </Text>

                        {/* Moderate */}

                        <Text style={styles.valueCell}>
                          {data?.moderate_districts?.join(', ') || 'Nil'}
                        </Text>

                        {/* Low */}

                        <Text style={styles.valueCell}>
                          {data?.low_districts?.join(', ') || 'Nil'}
                        </Text>
                      </View>
                    );
                  })}

                  {/* Bottom legend */}

                  <View style={styles.footerRow}>
                    <Text style={styles.footerCell}>Weather Parameter</Text>

                    <Text style={[styles.footerCell, styles.tempExtreme]}>
                      Extreme
                    </Text>

                    <Text style={[styles.footerCell, styles.tempHigh]}>
                      High
                    </Text>

                    <Text style={[styles.footerCell, styles.tempModerate]}>
                      Moderate
                    </Text>

                    <Text style={[styles.footerCell, styles.tempLow]}>Low</Text>
                  </View>
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
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 15,
      backgroundColor: safeTheme.primary_button_bg,
      marginBottom: 1,
    },

    activeAccordionTab: {
      backgroundColor: safeTheme.accordion_active_bg,
      
    },
    table: {
      borderWidth: 1,
      borderColor: "#0080d6",
      marginTop: 10,
      marginBottom:10,
    },

    headerRow: {
      flexDirection: "row",
    },

    row: {
      flexDirection: "row",
    },

    parameterHeader: {
      width: 180,
      padding: 10,
      borderWidth: 1,
      borderColor: "#0080d6",
      fontSize: 10,
      fontWeight: "700",
    },

    header: {
      width: 220,
      padding: 10,
      textAlign: "center",
      borderWidth: 1,
      borderColor: "#0080d6",
      fontSize: 10,
      fontWeight: "700",
    },

    extremeHeader: {
      backgroundColor: safeTheme.extreme_color,
    },

    highHeader: {
      backgroundColor:   safeTheme.high_color,
    },

    moderateHeader: {
      backgroundColor:  safeTheme.moderate_color,
    },

    lowHeader: {
      backgroundColor: "#fff",
    },

    parameterCell: {
      width: 180,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 10,
      borderWidth: 1,
      borderColor: "#0080d6",
    },
    valueCell: {
      width: 220,
      fontSize: 10,
      padding: 15,
      textAlign: "center",
      borderWidth: 1,
      borderColor: "#0080d6",
    },

    iconCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
         backgroundColor: safeTheme.primary_button_bg,

      justifyContent: "center",
      alignItems: "center",
    },

    footerRow: {
      flexDirection: "row",
    },

    footerCell: {
      width: 180,
      padding: 10,
      borderWidth: 1,
      borderColor: "#0080d6",
      textAlign: "center",
      fontSize: 10,
    },

    tempExtreme: {
      backgroundColor: "#3d8ce1",
      width: 220,
    },

    tempHigh: {
      backgroundColor: "#74acec",
      width: 220,
    },

    tempModerate: {
      backgroundColor: "#bad3fd",
      width: 220,
    },
    sectionTitle: {
      fontSize: 11,
      alignSelf: "center",
      fontWeight: "700",
      marginTop: 10,
    },
    tempLow: {
      width: 220,
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
  });