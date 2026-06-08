// import { useState, useEffect, useContext } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import SplashScreen from "./src/Screens/SplashScreen.jsx";
// import AppNavigator from "./src/Navigation/AppNavigator";
// import {WeatherProvider,WeatherContext,} from "./src/context/WeatherContext.js";
// import { defaultTheme } from "./src/theme.jsx";

// //  ROOT COMPONENT (ADD THIS)
// function Root() {
//   const { setTheme } = useContext(WeatherContext);
//   const [loadingTheme, setLoadingTheme] = useState(true);

//   useEffect(() => {
//     loadTheme();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadTheme = async () => {
//     try {
//       const res = await fetch(
//         "https://mlinfomap.org/mlwapi/get_mlw_web_theme",
//         {
//           method: "POST",
//         },
//       );

//       const json = await res.json();
//       if (json?.status === "success" && json?.data?.length) {
//         setTheme({
//           ...defaultTheme,
//           ...json.data[0],
//         });
//       } else {
//         setTheme(defaultTheme);
//       }
//     } catch (e) {
//       console.log("Theme API failed");
//       setTheme(defaultTheme);
//     } finally {
//       setLoadingTheme(false);
//     }
//   };

//   //  wait until theme ready
//   if (loadingTheme) return null;

//   return (
//     <NavigationContainer>
//       <AppNavigator />
//     </NavigationContainer>
//   );
// }
// // MAIN APP
// export default function App() {
//   const [showSplash, setShowSplash] = useState(true);

//   if (showSplash) {
//     return <SplashScreen onFinish={() => setShowSplash(false)} />;
//   }

//   return (
//     <WeatherProvider>
//       <Root />
//     </WeatherProvider>
//   );
// }
import { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/Screens/SplashScreen.jsx';
import AppNavigator from './src/Navigation/AppNavigator';
import {
  WeatherProvider,
  WeatherContext,
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