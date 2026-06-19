import { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/Screens/SplashScreen.jsx';
import AppNavigator from './src/Navigation/AppNavigator';
import {WeatherProvider,WeatherContext,
} from './src/context/WeatherContext.js';
import { defaultTheme } from './src/theme.jsx';

function Root() {
  const { setTheme } = useContext(WeatherContext);
  const [loadingTheme, setLoadingTheme] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const res = await fetch(
        'https://mlinfomap.org/mlwapi/get_mlw_web_theme',
        {
          method: 'POST',
        },
      );

      const json = await res.json();

      if (json?.status === 'success' && json?.data?.length) {
        setTheme({
          ...defaultTheme,
          ...json.data[0],
        });
      } else {
        setTheme(defaultTheme);
      }
    } catch (e) {
      console.log('Theme API failed');
      setTheme(defaultTheme);
    } finally {
      setLoadingTheme(false);
    }
  };

  if (loadingTheme) {
    return null;
  }

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaProvider>
      <WeatherProvider>
        <Root />
      </WeatherProvider>
    </SafeAreaProvider>
  );
}


/**
 * 17/06/2026
Implemented dynamic legend colors and ranges using the KPI Range API
Added dynamic weather parameters (Rainfall, Accu Rainfall, Wind, Humidity, Visibility, Temperature).
Replaced hardcoded severity colors with API-driven colors.
Fixed Today's Hazard data mapping and icon display logic.
Enhanced User Profile screen with avatar, user details, and theme support.
Updated bottom navigation to show dynamic location/region name.
Generated a new Android release keystore for app signing.
Configured release signing settings in Gradle (build.gradle and gradle.properties).
Resolved :app:validateSigningRelease FAILED error caused by missing keystore.
**/


/** 
18/06/2026
/*** * 
Fixed location and region state handling in map-based location selection.
Implemented region data transfer from OpenLayers WebView to React Native.
Debugged and resolved location display issues in weather screens.
Enhanced WebView message communication between map and mobile application.
Added support for district-wise map navigation and zoom functionality.
Implemented IDW layer controls for Rainfall, Wind, Humidity, Visibility, and Temperature.
Added active state management for IDW layer selection buttons.
Fixed IDW loading and state synchronization between WebView and React Native.
Resolved setActiveIdwType is not a function runtime issue.
Updated DistrictScreen integration for weather map controls.
Audited project dependencies using depcheck.
Verified usage and installation status of React Native navigation dependencies.
Restored and validated react-native-gesture-handler dependency after reinstallation.
Investigated and cleaned unused package references in the project.
Integrated hazard district API with frontend components.
Processed and mapped hazard API response data for UI rendering.
Configured dynamic hazard icon rendering based on hazard type.
Implemented district-wise hazard risk display functionality.
Developed accumulated rainfall forecast data integration.
Created dynamic accumulated rainfall table generation from API data.
Implemented dynamic date range calculations for rainfall forecast periods.
Enhanced weather forecast table rendering logic.
Added severity-based color coding for forecast values.
Integrated KPI legend configuration with forecast components.
Implemented dynamic legend rendering using API-driven severity ranges.
Updated weather forecast units for rainfall, wind, humidity, visibility, and temperature.
Improved forecast table UI styling and layout consistency.
Fixed data rendering issues in accumulated rainfall forecast view.
Validated district-wise weather forecast data mapping and display.
Performed end-to-end testing of weather, hazard, and forecast modules.
 */