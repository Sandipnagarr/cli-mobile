// import { SafeAreaView } from 'react-native-safe-area-context';
// import { View, Text, Image, StyleSheet } from 'react-native';


// export default function AppHeader() {
//   return (
//     <SafeAreaView edges={['top']} style={styles.safeArea}>
//       <View style={styles.header}>
//         <Image
//           source={require('../../assets/MLLogo.png')}
//                   style={styles.logo
                      
//                   }
             
//         />

//         <Text style={styles.title}>ML Weather</Text>
//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   safeArea: {
//     backgroundColor: '#08437a',
//   },

//   header: {
//     height: 60,
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     backgroundColor: '#7a0854',
//   },

//   logo: {
//     width: 32,
//     height: 32,
//     marginRight: 10,
//     tintColor: '#fff',
//   },

//   title: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
// });
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Image, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { WeatherContext } from '../context/WeatherContext';
import { useContext } from 'react';


export default function AppHeader() {
    const { theme } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <LinearGradient
        colors={['#63bbee', '#5a9fdf']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Image
          source={require('../../assets/MLLogo.png')}
          style={styles.logo}
        />

        <Text style={styles.title}>Weather Intelligence & Alert System</Text>
      </LinearGradient>
    </SafeAreaView>
  );
}
const createStyles = safeTheme =>
  StyleSheet.create({


  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  logo: {
    width: 32,
    height: 32,
    marginRight: 10,

  },

  title: {
    color: safeTheme.header_text_color,
    fontSize: 15,
    fontWeight: 'bold',
  },
});