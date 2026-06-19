import React, { useRef, useState } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Map from "../component/Map";
import IDW from "../component/IDW";
import ForecastCards from "./forcastcards";
import TodayWeather from "../component/TodayWeather";
import Districtselection from "../component/Districtselection";

export default function DistrictScreen() {
  const webViewRef = useRef(null);

  const [idwLoading, setIdwLoading] = useState(false);
  const [activeIdwType, setActiveIdwType] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <TodayWeather />

        <Districtselection webViewRef={webViewRef} />

        <IDW
          webViewRef={webViewRef}
          activeType={activeIdwType}
          loading={idwLoading}
          setLoading={setIdwLoading}
        />

        <Map
          webViewRef={webViewRef}
          setActiveIdwType={setActiveIdwType}
          setIdwLoading={setIdwLoading}
        />

        <ForecastCards />
      </ScrollView>
    </SafeAreaView>
  );
}