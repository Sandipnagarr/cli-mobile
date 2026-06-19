import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext } from 'react';
import { Image, View, Text } from 'react-native';
import AppHeader from '../Navigation/AppHeader';
import HomeScreen from '../Screens/HomeScreen.jsx';
import ReportScreen from '../Screens/ReportScreen.jsx';
import UserScreen from '../Screens/UserScreen.jsx';
import DistrictScreen from '../Screens/DistrictScreen.jsx';
import { HAZARD_ICONS } from '../Icon';
import { WeatherContext } from '../context/WeatherContext.js';

const Tab = createBottomTabNavigator();
const getIcon = name => HAZARD_ICONS.find(item => item.name === name)?.icon;
const tabIcons = {
  Dashboard: getIcon('Dashboard'),
  District: getIcon('District'),
  Report: getIcon('Report'),
  User: getIcon('User'),
};

export default function TabNavigator({ onLogout }) {
  const { data } = useContext(WeatherContext);
  return (
    <View style={{ flex: 1 }}>
      <AppHeader />

      <Tab.Navigator
        screenOptions={({ route }) => ({
          lazy: true,
          headerShown: false,
          tabBarActiveTintColor: '#1eaae6',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            height: 68,
            paddingTop: 8,
            paddingBottom: 8,
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#dbeafe',
          },

          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },

          tabBarIcon: ({ focused, size }) => (
            <View
              style={{
                backgroundColor: focused ? 'rgb(148, 195, 233)' : 'transparent',
                width: 55,
                height: 35,
                borderRadius: 8, // rectangle with rounded corners
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image
                source={tabIcons[route.name]}
                style={{
                  width: size,
                  height: size,
                  tintColor: focused ? '#fff' : '#6b7280',
                }}
                resizeMode="contain"
              />
            </View>
          ),
        })}
      >
        <Tab.Screen name="Dashboard" component={HomeScreen} />
        <Tab.Screen name="District" component={DistrictScreen} />
        <Tab.Screen
          name="Report"
          component={ReportScreen}
          // name="Report"
          // component={ReportScreen}
          // options={{
          //   tabBarLabel:data?.location?.region   || "Location",
          // }}
        />

        <Tab.Screen name="User">
          {props => <UserScreen {...props} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}
