import React from "react";
import { useRef,useState } from "react";
import { ScrollView, View } from 'react-native';
import Hazard from "../component/Hazard";
import Map from "../component/Map";
import SearchBar from "../component/searchbar";
import TodayWeather from "../component/TodayWeather";
import IDW from "../component/IDW";
import ForecastCards from "./forcastcards";

export default function HomeScreen() {
const [idwLoading, setIdwLoading] = useState(false);
const [activeIdwType, setActiveIdwType] = useState(null);
  const webViewRef = useRef(null);
  return (
    <View style={{ flex: 1 }}>
      <ScrollView>
        <TodayWeather />
        <SearchBar webViewRef={webViewRef} />
        <IDW
          webViewRef={webViewRef}
          activeType={activeIdwType}
          loading={idwLoading}
          setLoading={setIdwLoading}
        />
        <Map webViewRef={webViewRef} setActiveIdwType={setActiveIdwType} />
        <ForecastCards />
        <Hazard />
      </ScrollView>
    </View>
  );
}
