import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

const SplashIntro = ({ onFinish }) => {
  const scale = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 13500,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onFinish, scale]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../../assets/MLLogo.png")}
        style={[styles.logo, { transform: [{ scale }] }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#3a96d3",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 220,
    height: 220,
  },
  text: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "700",
  },
});

export default SplashIntro;
