// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import AppHeader from '../Navigation/AppHeader.jsx';
// import {Image} from "react-native"
// import HomeScreen from "../Screens/HomeScreen.jsx";
// import ReportScreen from "../Screens/ReportScreen.jsx";
// import UserScreen from "../Screens/UserScreen.jsx";
// // import CycloneScreen from "../Screens/CycloneScreen.jsx";
// import DistrictScreen from "../Screens/DistrictScreen.jsx";
//  import { HAZARD_ICONS } from '../Icon';
// import { SafeAreaView } from "react-native-safe-area-context";

// const Tab = createBottomTabNavigator();
//  const getIcon = name => HAZARD_ICONS.find(item => item.name === name)?.icon;
// const tabIcons = {
//   Dashboard: getIcon('Dashboard'),
//   District: getIcon('District'),
//   Report: getIcon('Report'),
//   User: getIcon('User'),
// };


//    export default function TabNavigator({ onLogout }) {
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <AppHeader />

//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           lazy: true,
//           headerShown: false,
//           tabBarActiveTintColor: '#0f766e',
//           tabBarInactiveTintColor: '#64748b',
//           tabBarStyle: {
//             height: 68,
//             paddingTop: 8,
//             paddingBottom: 8,
//             backgroundColor: '#ffffff',
//             borderTopWidth: 1,
//             borderTopColor: '#dbeafe',
//           },
//           tabBarLabelStyle: {
//             fontSize: 12,
//             fontWeight: '600',
//           },
//           tabBarIcon: ({ size }) => (
//             <Image
//               source={tabIcons[route.name]}
//               style={{
//                 width: size + 10,
//                 height: size + 10,
//               }}
//               resizeMode="contain"
//             />
//           ),
//         })}
//       >
//         <Tab.Screen name="Dashboard" component={HomeScreen} />
//         <Tab.Screen name="District" component={DistrictScreen} />
//         <Tab.Screen name="Report" component={ReportScreen} />
//         <Tab.Screen name="User">
//           {props => <UserScreen {...props} onLogout={onLogout} />}
//         </Tab.Screen>
//       </Tab.Navigator>
//     </SafeAreaView>
//   );
// }


import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View } from 'react-native';
import AppHeader from '../Navigation/AppHeader';
import HomeScreen from '../Screens/HomeScreen.jsx';
import ReportScreen from '../Screens/ReportScreen.jsx';
import UserScreen from '../Screens/UserScreen.jsx';
import DistrictScreen from '../Screens/DistrictScreen.jsx';
import { HAZARD_ICONS } from '../Icon';

const Tab = createBottomTabNavigator();

const getIcon = name => HAZARD_ICONS.find(item => item.name === name)?.icon;

const tabIcons = {
  Dashboard: getIcon('Dashboard'),
  District: getIcon('District'),
  Report: getIcon('Report'),
  User: getIcon('User'),
};

export default function TabNavigator({ onLogout }) {
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          lazy: true,
          headerShown: false,

          tabBarStyle: {
            height: 68,
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#dbeafe',
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },

          tabBarIcon: ({ size }) => (
            <Image
              source={tabIcons[route.name]}
              style={{
                width: size + 10,
                height: size + 10,
              }}
              resizeMode="contain"
            />
          ),
        })}
      >
        <Tab.Screen name="Dashboard" component={HomeScreen} />
        <Tab.Screen name="District" component={DistrictScreen} />
        <Tab.Screen name="Report" component={ReportScreen} />

        <Tab.Screen name="User">
          {props => <UserScreen {...props} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}