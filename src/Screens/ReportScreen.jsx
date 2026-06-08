import { ScrollView, } from "react-native";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
// import TodayWeather from "../component/TodayWeather";
// import TempCards from "../component/TempCards";
import TodayParameter from "../component/Todayparameter";
import TodayHazard from "../component/TodayHazard";
import WeatherKpi from "../component/WeatherKpi";
import Map from "../component/Map";
import WeatherBreakdown from "../component/WeatherBrekdown";
import WeatherForecast from "../component/weatherForecast";
import BadHazard from "../component/badHazard";
export default function ReportScreen() {
    const webViewRef = useRef(null);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        {/* <TodayWeather/> */}
        <WeatherKpi />
        <Map webViewRef={webViewRef} />
        <WeatherBreakdown />
        {/* <TempCards /> */}
        <TodayParameter />
        <TodayHazard />
        <WeatherForecast />
        {/* <BadHazard/> */}
      </ScrollView>
    </SafeAreaView>
  );
}