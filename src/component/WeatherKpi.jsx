import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { WeatherContext } from "../context/WeatherContext";
import { postrequest } from "../api/Api";
import { HAZARD_ICONS } from '../Icon';
import { defaultTheme } from '../theme';


const radius = 110;
export default function WeatherKpi() {
  const { circle, locationName, theme } = useContext(WeatherContext);
  const [weatherKPIs, setWeatherKPIs] = useState([]);
const [weatherLoading, setWeatherLoading] = useState(true);
const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);

  
  useEffect(() => {
    fetchweatherKPIs();
  }, [circle]);
  
  // call api for min max kpi data..............
  const fetchweatherKPIs = async () => {
    try {
      setWeatherLoading(true);
  
      let circlePayload = circle === 'All India' ? 'M&G' : circle;
      const response = await postrequest('/get_circle_weather_min_max', {
        circle: circlePayload,
      });

      const today = response?.data?.[0] || {};
      const getIcon = name =>
        HAZARD_ICONS.find(item => item.name === name)?.icon;
      const formatted = [
        {
          label: 'Temp',
          min: `${today.temp_min}°C`,
          max: `${today.temp_max}°C`,
          icon: getIcon('temprature'),
        },

        {
          label: 'Humidity',
          min: `${today.humidity_min}%`,
          max: `${today.humidity_max}%`,
          icon: getIcon('Drop'),
        },

        {
          label: 'Rain',
          min: `${today.rain_min} mm`,
          max: `${today.rain_max} mm`,
          icon: getIcon('Rainfall'),
        },

        {
          label: 'Wind',
          min: `${today.wind_min} kmph`,
          max: `${today.wind_max} kmph`,
          icon: getIcon('Wind'),
        },

        {
          label: 'Visibility',
          min: `${today.visibility_min} km`,
          max: `${today.visibility_max} km`,
          icon: getIcon('Eye'), // or Eye if you prefer
        },
      ];

      setWeatherKPIs(formatted);
    } catch (error) {
      console.log('API ERROR', error);
    } 
    setWeatherLoading(false);
};
 return (
   <>
     {/* LOCATION */}
     <Text style={styles.location}>{locationName}</Text>

     <View style={styles.wrapper}>
       <Text style={styles.heading}>TODAY'S WEATHER</Text>

       <View style={styles.outerCircle}>
         {weatherLoading ? (
           <View style={styles.loaderContainer}>
             <ActivityIndicator size="large" color="#08437a" />
             <Text style={{ marginTop: 10 }}>Loading...</Text>
           </View>
         ) : (
           weatherKPIs.map((item, index) => {
             const angle =
               (index * (360 / weatherKPIs.length) - 90) * (Math.PI / 180);

             const x = radius * Math.cos(angle);
             const y = radius * Math.sin(angle);

             return (
               <View
                 key={index}
                 style={[
                   styles.kpiWrapper,
                   {
                     transform: [{ translateX: x }, { translateY: y }],
                   },
                 ]}
               >
                 <View style={styles.kpiBubble}>
                   <Text style={styles.max}>{item.max}</Text>

                   <View style={styles.icon}>
                     <Image
                       source={item.icon}
                       style={{
                         width: 25,
                         height: 25,
                         tintColor: '#fff',
                       }}
                       resizeMode="contain"
                     />
                   </View>

                   <Text style={styles.min}>{item.min}</Text>
                 </View>
               </View>
             );
           })
         )}
       </View>
     </View>
   </>
 );
}
const createStyles = (safeTheme) =>
  StyleSheet.create({
  wrapper: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
  },

  heading: {
    color:safeTheme.text_on_light_bg,
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 40,
  },

  outerCircle: {
    width: 320,
    height: 320,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  kpiWrapper: {
    position: 'absolute',
  },

  kpiBubble: {
    width: 120,
    height: 120,
    borderRadius: 55,
    backgroundColor: safeTheme.hover_card_bg,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },

  max: {
    color: '#d48806',
    fontWeight: '800',
  },

  min: {
    fontWeight: '700',
  },

  icon: {
    width: 40,
    height: 40,
     backgroundColor: safeTheme.primary_button_bg,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  location: {
    color: safeTheme.secondary_text_color,
    fontWeight: '600',
    marginLeft: 10, // add left spacing
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)', // semi-transparent overlay
    zIndex: 999,
  },
});

