import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  
} from 'react-native';
import { useState, useEffect, React } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWeather } from '../api/Api';
import { useContext } from 'react';
import { WeatherContext } from '../context/WeatherContext';
import { defaultTheme } from '../theme';
import { HAZARD_ICONS } from '../Icon';
import { ActivityIndicator } from 'react-native';

export default function TodayWeather() {
  const [user, setUser] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const { data, setData, locationName, theme, region } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);



  const fetchCurrentWeather = async () => {
    try {
      setWeatherLoading(true);

      const userString = await AsyncStorage.getItem('user');
      const parsedUser = userString ? JSON.parse(userString) : null;

      setUser(parsedUser);

      const location = parsedUser?.location;

      if (!location) {
        console.log('Location not found');
        return;
      }

      const response = await fetchWeather(location);
      setData(response);
    } catch (error) {
      console.log('Error:', error.message);
    } finally {
      setWeatherLoading(false);
    }
  };


useEffect(() => {
  fetchCurrentWeather();
}, [locationName]);
  
  const refreshCurrentWeather = async () => {
    if (!user?.location) return;

    try {
      setLoading(true);
      const response = await fetchWeather(user.location);
      setData(response);
    } catch (error) {
      console.log('Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
  const d = new Date(dateString);

  const day = d.toLocaleDateString("en-GB", { weekday: "short" });
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${day}, ${date}, ${time}`;
};
  const getIcon = name => HAZARD_ICONS.find(item => item.name === name)?.icon;
  const currentHour = new Date().getHours();

  const currentHourData = data?.forecast?.forecastday?.[0]?.hour?.[currentHour];

  const rainPercent = currentHourData?.chance_of_rain ?? 0;
  const rainMM = currentHourData?.precip_mm ?? 0;
if (weatherLoading) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <ActivityIndicator size="large" color={safeTheme.primary_icon_color} />
      <Text style={{ marginTop: 10 }}>Loading Weather...</Text>
    </View>
  );
}

return (
  <ScrollView contentContainerStyle={styles.container}>
    {/* LOCATION */}
    <Text style={styles.location}>
      {
  locationName
    ? `${locationName}, ${data?.location?.region || 'Maharashtra'}`
    : 'Location not found'
}
    </Text>

    {/* WEATHER BOX */}
    <View style={styles.box}>
      <Text style={styles.title}>TODAY'S WEATHER</Text>

     <Text style={styles.date}>
  {data?.location?.localtime
    ? formatDate(data.location.localtime)
    : "Time not found"}
</Text>

      <View style={styles.topRow}>
        <Text style={styles.percent}>{rainPercent ?? 0}%</Text>

        <View style={{ marginLeft: 20 }}>
          <Text style={styles.small}>Rain Probability</Text>
          <Text style={styles.bold}>{rainMM ?? 0} mm</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={{
            uri: `https:${data?.current?.condition?.icon}`,
          }}
          style={{ width: 40, height: 40, marginRight: 8 }}
        />

        <Text style={styles.condition}>
          {data?.current?.condition?.text || 'Condition not available'}
        </Text>
      </View>

      <View style={styles.grid}>
        {[
          {
            icon: getIcon('temprature'),
            label: 'Temp',
            value: `${data?.current?.temp_c}°C`,
          },
          {
            icon: getIcon('temprature'),
            label: 'Feels',
            value: `${data?.current?.feelslike_c}°C`,
          },
          {
            icon: getIcon('Wind'),
            label: 'Wind',
            value: `${data?.current?.wind_kph} kmph`,
          },
          {
            icon: getIcon('Compass'),
            label: 'Direction',
            value: data?.current?.wind_dir,
          },
          {
            icon: getIcon('Pressure'),
            label: 'Pressure',
            value: `${data?.current?.pressure_mb} mb`,
          },
          {
            icon: getIcon('Eye'),
            label: 'Visibility',
            value: `${data?.current?.vis_km} km`,
          },
          {
            icon: getIcon('Sunny'),
            label: 'UV',
            value: data?.current?.uv,
          },
          {
            icon: getIcon('Drop'),
            label: 'Humidity',
            value: `${data?.current?.humidity}%`,
          },
        ].map((item, i) => (
          <View key={i} style={styles.card}>
            <Image
              source={item.icon}
              style={{
                width: 25,
                height: 25,
                tintColor: '#FFFFFF',
              }}
              resizeMode="contain"
            />

            <View style={styles.cardContent}>
              <Text style={styles.cardValue}>{item.value}</Text>
              <Text style={styles.cardLabel}>{item.label}</Text>
            </View>
          </View>
        ))}
      </View>

      <Pressable onPress={refreshCurrentWeather}>
        <Text style={styles.refresh}>
          {loading ? 'Refreshing...' : 'Refresh: ↻'}
        </Text>
      </Pressable>
    </View>
  </ScrollView>
);

}

const createStyles = safeTheme =>
  StyleSheet.create({
    /*  SAFE AREA ROOT */
    safe: {
      flex: 1,
      backgroundColor: '#e5e7eb',
    },

    /* CONTENT */
    container: {
      padding: 10,
    },

    location: {
      color: safeTheme.secondary_text_color,
      fontWeight: '600',
      marginBottom: 8,
    },

    box: {
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#cdd4dd',
      borderRadius: 10,
      padding: 14,
    },

    title: {
      fontWeight: '700',
      color: '#374151',
    },

    date: {
      fontSize: 12,
      color: safeTheme.text_on_light_bg,
      marginBottom: 10,
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },

    percent: {
      fontSize: 28,
      fontWeight: '700',
    },

    small: {
      fontSize: 12,
      color: safeTheme.text_on_light_bg,
    },

    bold: {
      fontWeight: '600',
    },

    condition: {
      marginBottom: 10,
      color: safeTheme.text_on_light_bg,
    },

    list: {
      marginTop: 5,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },

    iconCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#e9e5da',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
    },

    label: {
      flex: 1,
      color: '#eef1f7',
    },

    value: {
      fontWeight: '600',
      color: '#e2e3e6',
    },

    refresh: {
      marginTop: 10,
      fontSize: 12,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
      marginTop: 10,
    },

    card: {
      width: '40%',
      backgroundColor: safeTheme.primary_icon_color,
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,

      flexDirection: 'row',
      alignItems: 'center',
    },

    cardContent: {
      marginLeft: 15, // increase from 10 to 15 or 20
      flex: 1,
    },

    cardValue: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },

    cardLabel: {
      color: '#fff',
      fontSize: 12,
    },
  });
