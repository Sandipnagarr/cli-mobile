import React, { useContext, useEffect,useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WeatherContext } from "../context/WeatherContext";
import { fetchWeather } from "../api/Api";

// const injectedConsoleBridge = `   // this would be removed if we're not using the logs//
//   (function() {
//     const oldLog = console.log;
//     console.log = function(...args) {
//       window.ReactNativeWebView.postMessage(args.join(" "));
//       oldLog.apply(console, args);
//     };
//   })();
//   true;
// `;

const IDW_ACTIVE_BUTTONS = {
  RAIN_IDW: "rainfall",
  WIND_IDW: "wind",
  HUMIDITY_IDW: "humidity",
  VISIBILITY_IDW: "visibility",
  TEMPERATURE_IDW: "temperature",
};

function buildMapHtml(token) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol@7.5.2/ol.css">
<script src="https://cdn.jsdelivr.net/npm/ol@7.5.2/dist/ol.js"></script>

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ol-ext/dist/ol-ext.min.css">
<script src="https://cdn.jsdelivr.net/npm/ol-ext/dist/ol-ext.min.js"></script>

<style>
html, body { margin: 0; padding: 0; height: 100%; }
#map { width: 100%; height: 100%; }

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dropdown-container {
  background: rgba(255, 255, 255, 0.96);
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  padding: 6px;
}

.dropdown-container select {
  min-width: 140px;
  border: 0;
  outline: none;
  background: transparent;
  padding: 6px;
}

.layer-control {
  position: relative;
}

.layer-button {
  width: 100%;
  border: 0;
  outline: none;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  padding: 10px 14px;
  font-weight: 600;
  text-align: left;
}

.layers-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 100px;
  max-width: 100px;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  padding: 12px;
}

.layers-title {
  font: 600 13px/1.2 "Segoe UI", sans-serif;
  color: #0f172a;
  margin-bottom: 10px;
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font: 500 12px/1.3 "Segoe UI", sans-serif;
  color: #1f2937;
}

.layer-item input {
  margin: 0;
}

.layer-empty {
  font: 500 12px/1.3 "Segoe UI", sans-serif;
  color: #64748b;
}


.legend-container {
  position: absolute;
  

  bottom: 20px;
  left: 10px;

  z-index: 999;

  background: rgba(255,255,255,0.95);

  padding: 10px;

  border-radius: 10px;

  min-width: 140px;

  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}

.label-gradient {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 6px;
}

.color-gradient {
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(
    to left,
    blue,
    cyan,
    lime,
    yellow,
    orange,
    red
  );
}
</style>
</head>

<body>

<div id="popup" style="
  position:absolute;
  background:white;
  border-radius:8px;
  border:1px solid #ccc;
  min-width:150px;
  display:none;
  z-index:1000;
  box-shadow:0 4px 12px rgba(0,0,0,0.2);
">

  <div style="display:flex; justify-content:flex-end; padding:4px;">
    <span onclick="hidePopup()" style="cursor:pointer; font-weight:bold; color:red;">✖</span>
  </div>

  <div id="popup-content" style="padding:8px;"></div>
</div>

<div class="map-controls">
  <div class="dropdown-container">
    <select id="stateSelect" onchange="onStateChange()">
      <option>Loading...</option>
    </select>
  </div>

  <div class="layer-control">
    <button id="layerToggleButton" class="layer-button" type="button">
      Layers
    </button>

    <div id="layersPanel" class="layers-panel" style="display:none;">
      <div class="layers-title">Layers</div>
      <div id="layersList" class="layers-list"></div>
    </div>
  </div>
</div>

<div id="map"></div>
<div
  id="legendContainer"
  class="legend-container"
  style="display:none;"
>
  <div class="label-gradient"></div>
  <div class="color-gradient"></div>

</div>

<script>
const TOKEN = "${token}";
const DEFAULT_PADDING = [20, 20, 20, 20];


let map;
// -------------------popup-----
let popupContainer;
let popupContent;
let popupOverlay;
let popupWeatherRequestId = 0;
let layerToggleButton;
let layersPanel;
let layersList;
let isLayerPanelOpen = false;
// ----------------------------

const searchSource = new ol.source.Vector();
const indiaSource = new ol.source.Vector();
const stateSource = new ol.source.Vector();
const districtSource = new ol.source.Vector();
const vectorSourceTemp = new ol.source.Vector();
const vectorSourceRain = new ol.source.Vector();
const vectorSourceWind = new ol.source.Vector();
const vectorSourceHumidity = new ol.source.Vector();
const vectorSourceFog = new ol.source.Vector();


const WEATHER_IDW_CONFIG = {
  RAIN_IDW: {
    label: "Rainfall",
    key: "rain",
    valueFields: ["chance_of_rain"]
  },
  WIND_IDW: {
    label: "Wind",
    key: "wind",
    valueFields: ["wind_kph", "wind_speed", "wind"]
  },
  HUMIDITY_IDW: {
    label: "Humidity",
    key: "humidity",
    valueFields: ["humidity"]
  },
  VISIBILITY_IDW: {
    label: "Visibility",
    key: "fog",
    valueFields: ["vis_km", "visibility"]
  },
  TEMPERATURE_IDW: {
    label: "Temperature",
    key: "temp",
    valueFields: ["temp_c", "temperature"]
  }
};


let activeWeatherIDWType = null;
let lastWeatherIDWType = null;
let processedWeatherGrid = null;
let processedWeatherHourKey = null;
const discoveredLayerKeys = {
  india: true,
  state: true,
  district: true,
  search: false,
  weatherIdw: false
};

const searchLayer = new ol.layer.Vector({
  source: searchSource
});

const indiaLayer = new ol.layer.Vector({
  source: indiaSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: "rgba(175, 16, 238, 0.95)",
      width: 2
    }),
    fill: new ol.style.Fill({
      color: "rgba(175, 16, 238, 0.04)"
    })
  })
});

const stateLayer = new ol.layer.Vector({
  source: stateSource,

  style: function (feature) {

    const stateName =feature.get("state_ut") ||"STATE";
    const geom = feature.getGeometry();

    let center;

    if (geom.getType() === "Polygon") {

      center = geom
        .getInteriorPoint()
        .getCoordinates();

    } else if (geom.getType() === "MultiPolygon") {

      const polys = geom.getPolygons();

      let largest = polys[0];
      let maxArea = polys[0].getArea();

      polys.forEach((poly) => {
        const area = poly.getArea();

        if (area > maxArea) {
          largest = poly;
          maxArea = area;
        }
      });

      center = largest
        .getInteriorPoint()
        .getCoordinates();
    }

    return [

      // boundary style
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: "rgba(4, 48, 85, 0.85)",
          width: 2
        }),

        fill: new ol.style.Fill({
          color: "rgba(0, 102, 255, 0.06)"
        })
      }),

      // label style
      new ol.style.Style({
        geometry: new ol.geom.Point(center),
        text: new ol.style.Text({
          text: stateName,
          font: "bold 12px sans-serif",
          fill: new ol.style.Fill({
            color: "#000"
          }),

          stroke: new ol.style.Stroke({
            color: "#fff",
            width: 4
          }),

          overflow: true
        })
      })
    ];
  }
});

const districtLayer = new ol.layer.Vector({
  source: districtSource,

  style: function (feature) {
  const districtName=feature.get("district") || "District";
   const zoom = map.getView().getZoom();

    // boundary style
    const baseStyle = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "rgba(16, 98, 59, 0.55)",
        width: 1
      }),

      fill: new ol.style.Fill({
        color: "rgba(16, 98, 59, 0.02)"
      })
    });

    // show label only after zoom 8
    if (zoom <= 8) {
      return baseStyle;
    }

    const geom = feature.getGeometry();

    let center;

    if (geom.getType() === "Polygon") {

      center = geom
        .getInteriorPoint()
        .getCoordinates();

    } else if (geom.getType() === "MultiPolygon") {

      const polys = geom.getPolygons();

      let largest = polys[0];
      let maxArea = polys[0].getArea();

      polys.forEach((poly) => {
        const area = poly.getArea();

        if (area > maxArea) {
          largest = poly;
          maxArea = area;
        }
      });

      center = largest
        .getInteriorPoint()
        .getCoordinates();
    }

    return [

      baseStyle,

      // label style
      new ol.style.Style({
        geometry: new ol.geom.Point(center),

        text: new ol.style.Text({
          text: districtName,

          font: '600 12px "Segoe UI", sans-serif',

          fill: new ol.style.Fill({
            color: "#000"
          }),

          stroke: new ol.style.Stroke({
            color: "#fff",
            width: 4
          }),

          overflow: true
        })
      })
    ];
  }
});

const idwLayer = new ol.layer.Image({
  source: new ol.source.IDW({
    source: vectorSourceRain,
    weight: "count"
  }),
  opacity: 0.75,
  visible: false   //  ADD THIS
});

function postToReactNative(payload) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
  }
}

function hasValidExtent(extent) {
  return Array.isArray(extent) && extent.length === 4 && extent.every(Number.isFinite);
}

function getWeatherIDWLabel() {
  const weatherType = activeWeatherIDWType || lastWeatherIDWType;
  const idwConfig = weatherType
    ? WEATHER_IDW_CONFIG[weatherType] || WEATHER_IDW_CONFIG.RAIN_IDW
    : null;

  return idwConfig ? idwConfig.label + " IDW" : "Weather IDW";
}

function markLayerDiscovered(key) {
  discoveredLayerKeys[key] = true;
}

function notifyIDWStateChange() {
  postToReactNative({
    type: "IDW_STATE_CHANGE",
    activeType: activeWeatherIDWType,
    visible: idwLayer.getVisible()
  });
}

function setLayerPanelOpen(nextOpen) {
  isLayerPanelOpen = nextOpen;

  if (!layersPanel || !layerToggleButton) return;

  layersPanel.style.display = nextOpen ? "block" : "none";
  layerToggleButton.setAttribute("aria-expanded", nextOpen ? "true" : "false");
}

function getTrackedLayers() {
  return [
    {
      key: "india",
      label: "India Boundary",
      active: indiaLayer.getVisible() && indiaSource.getFeatures().length > 0,
      setActive: (nextVisible) => {
        indiaLayer.setVisible(nextVisible);
        map.render();
      }
    },
    {
      key: "state",
      label: "State Boundary",
      active: stateLayer.getVisible() && stateSource.getFeatures().length > 0,
      setActive: (nextVisible) => {
        stateLayer.setVisible(nextVisible);
        map.render();
      }
    },
    {
      key: "district",
      label: "District Boundary",
      active: districtLayer.getVisible() && districtSource.getFeatures().length > 0,
      setActive: (nextVisible) => {
        districtLayer.setVisible(nextVisible);
        map.render();
      }
    },
    {
      key: "search",
      label: "Search Marker",
      active: searchLayer.getVisible() && searchSource.getFeatures().length > 0,
      setActive: (nextVisible) => {
        searchLayer.setVisible(nextVisible);
        if (!nextVisible) {
          hidePopup();
        }
        map.render();
      }
    },
    {
      key: "weatherIdw",
      label: getWeatherIDWLabel(),
      active: idwLayer.getVisible() && !!activeWeatherIDWType,
      setActive: (nextVisible) => {
        if (!nextVisible) {
          deactivateWeatherIDW();
          return;
        }

        const weatherType = activeWeatherIDWType || lastWeatherIDWType;
        if (!weatherType) return;

        activateWeatherIDW(weatherType);
      }
    }
  ];
}

function renderLayerList() {
  if (!layersList) return;

  const trackedLayers = getTrackedLayers().filter((layerItem) => discoveredLayerKeys[layerItem.key]);

  if (!trackedLayers.length) {
    layersList.innerHTML = "<div class='layer-empty'>No layers available</div>";
    return;
  }

  layersList.innerHTML = trackedLayers
    .map((layerItem) => (
      "<label class='layer-item'>"
        + "<input type='checkbox' data-layer-key='" + layerItem.key + "'"
        + (layerItem.active ? " checked" : "")
        + " />"
        + "<span>" + layerItem.label + "</span>"
      + "</label>"
    ))
    .join("");

  layersList.querySelectorAll("input[data-layer-key]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const layerKey = event.target.getAttribute("data-layer-key");
      const layerConfig = getTrackedLayers().find((item) => item.key === layerKey);

      if (!layerConfig) return;

      layerConfig.setActive(event.target.checked);
      renderLayerList();
    });
  });
}

function fitSource(source) {
  const extent = source.getExtent();
  if (!hasValidExtent(extent)) return;

  map.getView().fit(extent, {
    duration: 800,
    padding: DEFAULT_PADDING
  });
}

function getBoundaryPolygons() {
  const polygons = [];

  indiaSource.getFeatures().forEach(feature => {
    const geometry = feature.getGeometry();
    if (!geometry) return;

    const type = geometry.getType();

    if (type === "Polygon") {
      polygons.push(geometry);
      return;
    }

    if (type === "MultiPolygon") {
      geometry.getPolygons().forEach(poly => polygons.push(poly));
    }
  });

  return polygons;
}

function cropIDWPointsToIndia(vectorSource) {
  const polygons = getBoundaryPolygons();
  if (!polygons.length) return;

  vectorSource.getFeatures().slice().forEach(feature => {
    const coord = feature.getGeometry().getCoordinates();
    const inside = polygons.some(poly => poly.intersectsCoordinate(coord));

    if (!inside) {
      vectorSource.removeFeature(feature);
    }
  });
}

function clipIDWToIndia(event) {
  const ctx = event.context;
  const polygons = getBoundaryPolygons();

  if (!ctx || !map || !polygons.length) return;

  const pixelRatio = event.frameState.pixelRatio || 1;

  ctx.save();
  ctx.beginPath();

  polygons.forEach(poly => {
    poly.getLinearRings().forEach(ring => {
      ring.getCoordinates().forEach((coord, index) => {
        const pixel = map.getPixelFromCoordinate(coord);
        if (!pixel) return;

        const x = pixel[0] * pixelRatio;
        const y = pixel[1] * pixelRatio;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.closePath();
    });
  });

  try {
    ctx.clip("evenodd");
  } catch (error) {
    ctx.clip();
  }
}

idwLayer.on("prerender", clipIDWToIndia);
idwLayer.on("postrender", (event) => {
  if (event.context) {
    try {
      event.context.restore();
    } catch (error) {
      // no-op
    }
  }
});

function loadCircles() {
  return fetch("https://mlinfomap.org/mlwapi/get_circle_list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + TOKEN
    },
    body: JSON.stringify({ circle: "All India" })
  })
  .then((res) => res.json())
  .then((res) => {
    const select = document.getElementById("stateSelect");
    const circleOptions = res.data || [];

    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "All India";
    defaultOption.text = "All India";
    select.appendChild(defaultOption);

    circleOptions.forEach((optionData) => {
      const option = document.createElement("option");
      option.value = optionData.label;
      option.text = optionData.full_name;
      option.setAttribute("data-coords", optionData.value || "");
      option.setAttribute("data-location-name",
        optionData.location_name || optionData.full_name || optionData.label
      );
      select.appendChild(option);
    });
  })
  .catch((error) => {
    console.log("Circle API ERROR", error);
  });
}

function loadBoundary() {
  return fetch("https://mlinfomap.org/mlwapi/get_india_boundary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + TOKEN
    },
    body: JSON.stringify({ circle: "All India" })
  })
  .then((res) => res.json())
  .then((res) => {
    const data = res.data || res;
    const features = new ol.format.GeoJSON().readFeatures(data, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857"
    });

    indiaSource.clear();
    indiaSource.addFeatures(features);
    markLayerDiscovered("india");

    const extent = indiaSource.getExtent();
    if (hasValidExtent(extent)) {
      idwLayer.setExtent(extent);
      fitSource(indiaSource);
    }

    idwLayer.changed();
    map.render();
    renderLayerList();
  })
  .catch((error) => {
    console.log("Boundary API ERROR", error);
  });
}

function loadState(circle) {
  return fetch("https://mlinfomap.org/mlwapi/get_state_boundary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + TOKEN
    },
    body: JSON.stringify({ circle: circle })
  })
  .then((res) => res.json())
  .then((res) => {
    if (res.msg) {
      console.log("State API ERROR", res.msg);
      return;
    }

    const data = res.data || res;
    const features = new ol.format.GeoJSON().readFeatures(data, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857"
    });

    stateSource.clear();
    stateSource.addFeatures(features);
    markLayerDiscovered("state");
    fitSource(stateSource);
    renderLayerList();
  })
  .catch((error) => {
    console.log("State API ERROR", error);
  });
}

function loadDistrict(circle = "All India") {
  return fetch("https://mlinfomap.org/mlwapi/get_district_boundary", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + TOKEN
    },
    body: JSON.stringify({ circle: circle })
  })
  .then((res) => res.json())
  .then((res) => {
    if (res.msg) {
      console.log("District API ERROR", res.msg);
      return;
    }

    const data = res.data || res;
    const features = new ol.format.GeoJSON().readFeatures(data, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:3857"
    });

    districtSource.clear();
    districtSource.addFeatures(features);
    markLayerDiscovered("district");
    renderLayerList();
  })
  .catch((error) => {
    console.log("District API ERROR", error);
  });
}
function zoomToDistrict(districtName) {

  let matchedFeature = null;

  districtSource.getFeatures().forEach((feature) => {

    const district =
      feature.get("district");

    if (
      district &&
      district.toLowerCase() ===
      districtName.toLowerCase()
    ) {

      matchedFeature = feature;
    }
  });

  if (!matchedFeature) return;

  // Highlight Style
  matchedFeature.setStyle(
    new ol.style.Style({

      stroke: new ol.style.Stroke({
        color: "#ff0000",
        width: 3,
      }),

      fill: new ol.style.Fill({
        color: "rgba(255,0,0,0.2)",
      }),
    })
  );

  // Zoom
  const extent =
    matchedFeature
      .getGeometry()
      .getExtent();

  map.getView().fit(extent, {
    duration: 1000,
    padding: [50, 50, 50, 50],
    maxZoom: 10,
  });
}
function getWeatherMetricValue(item, valueFields) {
  for (let index = 0; index < valueFields.length; index += 1) {
    const metricValue = parseFloat(item[valueFields[index]]);

    if (Number.isFinite(metricValue)) {
      return metricValue;
    }
  }

  return null;
}

function getSelectedDateHour() {
  const now = new Date();

  return (
    now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0") + " " +
    String(now.getHours()).padStart(2, "0") + ":00"
  );
}

function getMinMax(data, valueFields) {
  const values = data
    .map((item) => getWeatherMetricValue(item, valueFields))
    .filter((value) => Number.isFinite(value));

  if (!values.length) {
    return { min: 0, max: 0 };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values)
  };
}

function safePercent(value, max) {
  return max === 0 ? 0 : Math.ceil((value / max) * 100);
}

function createFeature(coord, total, count) {
  return new ol.Feature({
    geometry: new ol.geom.Point(coord),
    total: total,
    count: count
  });
}

function createIDW(vectorSource) {
  return new ol.source.IDW({
    source: vectorSource,
    weight: "count"
  });
}

function processWeatherData(data) {
  const temp = getMinMax(data, WEATHER_IDW_CONFIG.TEMPERATURE_IDW.valueFields);
  const rain = getMinMax(data, WEATHER_IDW_CONFIG.RAIN_IDW.valueFields);
  const wind = getMinMax(data, WEATHER_IDW_CONFIG.WIND_IDW.valueFields);
  const humidity = getMinMax(data, WEATHER_IDW_CONFIG.HUMIDITY_IDW.valueFields);
  const fog = getMinMax(data, WEATHER_IDW_CONFIG.VISIBILITY_IDW.valueFields);
  const absTmin = Math.abs(temp.min);

  [
    vectorSourceTemp,
    vectorSourceRain,
    vectorSourceWind,
    vectorSourceHumidity,
    vectorSourceFog
  ].forEach((source) => source.clear());

  data.forEach((item) => {
    const lon = parseFloat(item.longitude || item.lon);
    const lat = parseFloat(item.latitude || item.lat);

    if (isNaN(lon) || isNaN(lat)) return;

    const coord = ol.proj.fromLonLat([lon, lat]);
    const tempValue = getWeatherMetricValue(
      item,
      WEATHER_IDW_CONFIG.TEMPERATURE_IDW.valueFields
    );
    const rainValue = getWeatherMetricValue(
      item,
      WEATHER_IDW_CONFIG.RAIN_IDW.valueFields
    );
    const windValue = getWeatherMetricValue(
      item,
      WEATHER_IDW_CONFIG.WIND_IDW.valueFields
    );
    const humidityValue = getWeatherMetricValue(
      item,
      WEATHER_IDW_CONFIG.HUMIDITY_IDW.valueFields
    );
    const fogValue = getWeatherMetricValue(
      item,
      WEATHER_IDW_CONFIG.VISIBILITY_IDW.valueFields
    );

    if (Number.isFinite(tempValue)) {
      const adjustedTemp = tempValue + absTmin;

      vectorSourceTemp.addFeature(
        createFeature(
          coord,
          adjustedTemp,
          safePercent(adjustedTemp, temp.max + absTmin)
        )
      );
    }

    if (Number.isFinite(rainValue)) {
      vectorSourceRain.addFeature(
        createFeature(
          coord,
          rainValue,
          safePercent(rainValue, rain.max)
        )
      );
    }

    if (Number.isFinite(windValue)) {
      vectorSourceWind.addFeature(
        createFeature(
          coord,
          windValue,
          safePercent(windValue, wind.max)
        )
      );
    }

    if (Number.isFinite(humidityValue)) {
      vectorSourceHumidity.addFeature(
        createFeature(
          coord,
          humidityValue,
          safePercent(humidityValue, humidity.max)
        )
      );
    }

    if (Number.isFinite(fogValue)) {
      vectorSourceFog.addFeature(
        createFeature(
          coord,
          fogValue,
          safePercent(fog.max - fogValue, fog.max)
        )
      );
    }
  });

  [
    vectorSourceTemp,
    vectorSourceRain,
    vectorSourceWind,
    vectorSourceHumidity,
    vectorSourceFog
  ].forEach((source) => cropIDWPointsToIndia(source));

  return {
    temp: createIDW(vectorSourceTemp),
    rain: createIDW(vectorSourceRain),
    wind: createIDW(vectorSourceWind),
    humidity: createIDW(vectorSourceHumidity),
    fog: createIDW(vectorSourceFog),
    meta: {
      temp: temp,
      rain: rain,
      wind: wind,
      humidity: humidity,
      fog: fog
    }
  };
}

function applyProcessedData(grid, type) {
  const idwConfig = WEATHER_IDW_CONFIG[type] || WEATHER_IDW_CONFIG.RAIN_IDW;

  idwLayer.setSource(grid[idwConfig.key]);
  idwLayer.changed();
  map.render();
}

function loadWeatherIDW(type = "RAIN_IDW") {
  const idwConfig = WEATHER_IDW_CONFIG[type] || WEATHER_IDW_CONFIG.RAIN_IDW;
  const selectedDate = getSelectedDateHour();

  if (processedWeatherGrid && processedWeatherHourKey === selectedDate) {
    applyProcessedData(processedWeatherGrid, type);
    console.log(
      idwConfig.label + " IDW features:",
      getSourceForType(type).getFeatures().length
    );
    return Promise.resolve(processedWeatherGrid);
  }

  return fetch("https://mlinfomap.org/mlwapi/get-current-weather", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + TOKEN
    },
    body: JSON.stringify({
      params: {
        selectedDate: selectedDate
      }
    })
  })

  .then((res) => res.json())
  .then((res) => {
    if (!res?.data || res.data.length === 0) {
      [
        vectorSourceTemp,
        vectorSourceRain,
        vectorSourceWind,
        vectorSourceHumidity,
        vectorSourceFog
      ].forEach((source) => source.clear());
      processedWeatherGrid = null;
      processedWeatherHourKey = null;
      idwLayer.changed();
      map.render();
      return;
    }

    processedWeatherGrid = processWeatherData(res.data);
    processedWeatherHourKey = selectedDate;
    applyProcessedData(processedWeatherGrid, type);

    return processedWeatherGrid;
  })
  .catch((error) => {
    console.log(idwConfig.label + " IDW ERROR", error);
  });
}

function getSourceForType(type) {
  const idwConfig = WEATHER_IDW_CONFIG[type] || WEATHER_IDW_CONFIG.RAIN_IDW;
  const sourceMap = {
    temp: vectorSourceTemp,
    rain: vectorSourceRain,
    wind: vectorSourceWind,
    humidity: vectorSourceHumidity,
    fog: vectorSourceFog
  };

  return sourceMap[idwConfig.key] || vectorSourceRain;
}

function activateWeatherIDW(type) {

  const normalizedType =
    WEATHER_IDW_CONFIG[type]
      ? type
      : "RAIN_IDW";

  activeWeatherIDWType = normalizedType;
  lastWeatherIDWType = normalizedType;

  markLayerDiscovered("weatherIdw");

  idwLayer.setVisible(true);

  notifyIDWStateChange();

  renderLayerList();

  map.render();

  return loadWeatherIDW(normalizedType)

    .finally(() => {

      const legendContainer =
        document.getElementById("legendContainer");

      const labelContainer =
        document.querySelector(".label-gradient");

      legendContainer.style.display = "block";

      // RAIN
      if (normalizedType === "RAIN_IDW") {

        labelContainer.innerHTML =

          "<span>100%</span>" +
          "<span>75%</span>" +
          "<span>50%</span>" +
          "<span>25%</span>" +
          "<span>0%</span>";
      }

      // TEMPERATURE
      else if (
        normalizedType === "TEMPERATURE_IDW"
      ) {

        const tempMeta =
          processedWeatherGrid?.meta?.temp;

        labelContainer.innerHTML =

          "<span>" +
          (tempMeta?.max ?? 0) +
          " °C</span>" +

          "<span>" +
          (tempMeta?.min ?? 0) +
          " °C</span>";
      }

      // WIND
      else if (
        normalizedType === "WIND_IDW"
      ) {

        const windMeta =
          processedWeatherGrid?.meta?.wind;

        labelContainer.innerHTML =

          "<span>" +
          (windMeta?.max ?? 0) +
          " kph</span>" +

          "<span>" +
          (windMeta?.min ?? 0) +
          " kph</span>";
      }

      // HUMIDITY
      else if (
        normalizedType === "HUMIDITY_IDW"
      ) {

        const humidityMeta =
          processedWeatherGrid?.meta?.humidity;

        labelContainer.innerHTML =

          "<span>" +
          (humidityMeta?.max ?? 0) +
          " %</span>" +

          "<span>" +
          (humidityMeta?.min ?? 0) +
          " %</span>";
      }

      // VISIBILITY / FOG
      else if (
        normalizedType === "VISIBILITY_IDW"
      ) {

        const fogMeta =
          processedWeatherGrid?.meta?.fog;

        // reverse like Angular
        labelContainer.innerHTML =

          "<span>" +
          (fogMeta?.min ?? 0) +
          " Km</span>" +

          "<span>" +
          (fogMeta?.max ?? 0) +
          " Km</span>";
      }

      notifyIDWStateChange();

      renderLayerList();

      postToReactNative({
        type: "IDW_LOADED"
      });

    });

}

function deactivateWeatherIDW() {
  activeWeatherIDWType = null;
  idwLayer.setVisible(false);
  document.getElementById("legendContainer").style.display = "none";
  notifyIDWStateChange();
  renderLayerList();
  map.render();
  postToReactNative({ type: "IDW_LOADED" });
}

function toggleWeatherIDW(type) {
  const normalizedType = WEATHER_IDW_CONFIG[type] ? type : "RAIN_IDW";
  const isVisible = idwLayer.getVisible();
  const isSameType = activeWeatherIDWType === normalizedType;

  if (isVisible && isSameType) {
    deactivateWeatherIDW();
    return;
  }

  activateWeatherIDW(normalizedType);
}

function showSearchLocation(lon, lat) {
  if (isNaN(lon) || isNaN(lat)) return;

  const coords = ol.proj.fromLonLat([lon, lat]);

  hidePopup(); //----popup------
  searchSource.clear();
  searchLayer.setVisible(true);

  const marker = new ol.Feature({
    geometry: new ol.geom.Point(coords)
  });

  marker.setStyle(
    new ol.style.Style({
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({ color: "#ef4444" }),
        stroke: new ol.style.Stroke({ color: "#ffffff", width: 2 })
      })
    })
  );

  searchSource.addFeature(marker);
  markLayerDiscovered("search");
  renderLayerList();

  map.getView().animate({
    center: coords,
    zoom: 8,
    duration: 800
  });
}
// ---------popup--------------------------------------------------
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPopupTitle(feature) {
  if (!feature || typeof feature.getProperties !== "function") {
    return "Selected location";
  }

  const properties = feature.getProperties();
  const titleCandidates = [
    properties.location_name,
    properties.full_name,
    properties.district_name,
    properties.district,
    properties.state_name,
    properties.state,
    properties.name,
    properties.NAME_2,
    properties.NAME_1,
    properties.label
  ];
  console.log("properties name",titleCandidates);

  return (
    titleCandidates.find(
      (value) => typeof value === "string" && value.trim().length > 0
    ) || "Selected location"
  );
}

function hidePopup() {
  if (!popupContainer || !popupOverlay) return;

  popupWeatherRequestId += 1;
  popupContainer.style.display = "none";
  popupOverlay.setPosition(undefined);
}

function showPopupMessage(coordinate, message) {
  if (!popupContainer || !popupContent || !popupOverlay) return;

  popupContent.innerHTML =
    "<div style='padding:8px; font-family:Segoe UI; font-size:12px;'>"
    + escapeHtml(message)
    + "</div>";

  popupContainer.style.display = "block";
  popupOverlay.setPosition(coordinate);
}

function getFeatureLabel(feature, keys) {
  if (!feature || typeof feature.getProperties !== "function") {
    return "";
  }

  const properties = feature.getProperties();

  return (
    keys
      .map((key) => properties[key])
      .find((value) => typeof value === "string" && value.trim().length > 0) || ""
  );
}

function showPopup(coordinate, feature, weather) {
console.log(
  "POPUP FEATURE:",
  JSON.stringify(
    feature?.getProperties(),
    null,
    2
  )
);
console.log(
  "POPUP WEATHER:",
  JSON.stringify(
    weather,
    null,
    2
  )
);

  if (!popupContainer || !popupContent || !popupOverlay) return;

  if (!weather?.current || !weather?.forecast?.forecastday?.[0]?.hour) {
    showPopupMessage(coordinate, "Weather data not available");
    return;
  }

  const current = weather.current;
  const hours = weather.forecast.forecastday[0].hour || [];
  const localHour = parseInt(
    ((weather.location?.localtime || "").split(" ")[1] || "").split(":")[0],
    10
  );
  const nowHour = Number.isFinite(localHour) ? localHour : new Date().getHours();
  const currentHour = hours[nowHour] || hours[0] || {};
  const locationName =weather.location?.name || getPopupTitle(feature);
  const stateName = weather.location?.region||"N/A";
  const districtName =feature?.get("district")||weather.location?.name
  const iconUrl = current?.condition?.icon ? "https:" + current.condition.icon : "";
  const rainChance = Number.isFinite(Number(currentHour.chance_of_rain))
    ? currentHour.chance_of_rain
    : 0;
  const rainAmount = Number.isFinite(Number(currentHour.precip_mm))
    ? currentHour.precip_mm
    : 0;
  const timeLabel =
    typeof currentHour.time === "string" && currentHour.time.includes(" ")
      ? currentHour.time.split(" ")[1]
      : String(nowHour).padStart(2, "0") + ":00";

  const next6 = [];
  for (let i = 1; i <= 6; i++) {
    if (hours[nowHour + i]) {
      next6.push(hours[nowHour + i]);
    }
  }

  //  build table rows safely
  let rows = "";
  next6.forEach((h, i) => {
    const bg = i % 2 === 0 ? "#fde2d2" : "#fdece5";
    const rainColor = h.chance_of_rain > 0 ? "#d9534f" : "#28a745";
    const mmColor = h.precip_mm > 0 ? "#d9534f" : "#28a745";

    rows +=
      "<tr style='background:" + bg + ";'>" +
        "<td>" + h.time.split(" ")[1] + "</td>" +
        "<td style='color:" + rainColor + ";'>" + h.chance_of_rain + "</td>" +
        "<td style='color:" + mmColor + ";'>" + h.precip_mm + "</td>" +
      "</tr>";
  });

  popupContent.innerHTML =
    "<div style='font-family:Segoe UI; font-size:12px;'>"

    + "<div style='border-bottom:1px solid #ddd; margin-bottom:6px;'>"
    + "<div><b>Location:</b> " + escapeHtml(locationName) + "</div>"
    + "<div><b>State:</b> " + escapeHtml(stateName) + "</div>"
    + "<div><b>District:</b> " + escapeHtml(districtName) + "</div>"
    + "</div>"

    + "<div style='display:flex; gap:10px; align-items:center;'>"

      + "<div style='text-align:center; border-right:1px solid #ccc; padding-right:8px;'>"
      + (iconUrl ? "<img src='" + escapeHtml(iconUrl) + "' width='36'/>" : "")
      + "<div style='font-size:18px; font-weight:bold;'>"
      + rainChance + "%"
      + "</div>"
      + "<div style='font-size:11px;'>"
      + escapeHtml(current?.condition?.text || "Condition not available")
      + "</div>"
      + "</div>"

      + "<div>"
      + "<div style='font-weight:bold;'>" + escapeHtml(timeLabel) + "</div>"
      + "<div style='color:#666;'>Rain Probability</div>"
      + "<div><b>" + rainAmount + " mm</b></div>"
      + "</div>"

    + "</div>"

    + "<div style='margin-top:8px;'>"
    + "<table style='width:100%; font-size:11px; border-collapse:collapse;'>"

    + "<tr style='background:#f77f00; color:white;'>"
    + "<th>Hours</th><th>%</th><th>mm</th>"
    + "</tr>"

    + rows

    + "</table>"
    + "</div>"

    + "</div>";

  popupContainer.style.display = "block";
  popupOverlay.setPosition(coordinate);
}

function loadPopupWeather(coordinate, lon, lat, feature) {
  const requestId = popupWeatherRequestId + 1;
  popupWeatherRequestId = requestId;

  showPopupMessage(coordinate, "Loading weather...");

  return fetch("https://mlinfomap.org/mlwapi/get_weather", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + TOKEN
    },
    body: JSON.stringify({
      q: lat + "," + lon
    })
  })
  .then(async (res) => ({
    ok: res.ok,
    payload: await res.json()
  }))
  .then(({ ok, payload }) => {
    if (requestId !== popupWeatherRequestId) return;

    if (!ok || !payload?.current || !payload?.forecast?.forecastday?.length) {
      showPopupMessage(
        coordinate,
        payload?.msg || payload?.message || "Weather data not available"
      );
      return;
    }

    showPopup(coordinate, feature, payload);
  })
  .catch((error) => {
    if (requestId !== popupWeatherRequestId) return;

    console.log("Popup weather error", error);
    showPopupMessage(coordinate, "Unable to load weather");
  });
}

function onStateChange() {
  const select = document.getElementById("stateSelect");
  const option = select.options[select.selectedIndex];
  const selected = select.value;
  const coords = option.getAttribute("data-coords");
  const name = option.getAttribute("data-location-name") || selected;

  hidePopup();//------popup------------------------------------------
  stateSource.clear();
  districtSource.clear();
  renderLayerList();

  if (coords) {
    postToReactNative({
      type: "LOCATION_CHANGE",
      coords: coords,
      name: name,
      circle: selected,
    });
  }

  if (selected === "All India") {
    loadDistrict("All India");
    loadState("All India")
    fitSource(indiaSource);
    return;
  }

  loadState(selected);
  loadDistrict(selected);
}

function handleNativeMessage(event) {
  try {
    const message = JSON.parse(event.data);

    //  WEATHER DATA
    if (message.type === "WEATHER_DATA") {
      window.weatherData = message.payload;
      console.log("Weather received:", window.weatherData);
      return;
    }

    //  SEARCH
    if (message.type === "SEARCH_LOCATION") {
      showSearchLocation(parseFloat(message.lon), parseFloat(message.lat));
      return;
    }

    // IDW
    if (WEATHER_IDW_CONFIG[message.type]) {
      toggleWeatherIDW(message.type);
    }
  if (message.type === "ZOOM_TO_DISTRICT") {
  zoomToDistrict(message.district);
  return;
}

  } catch (error) {
    console.log("Bridge message error", error);
  }
}

indiaLayer.setZIndex(20);
window.addEventListener("message", handleNativeMessage);
document.addEventListener("message", handleNativeMessage);
window.onload = function () {
  map = new ol.Map({
    target: "map",
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
        }),
        idwLayer,
        indiaLayer,
        districtLayer,
        stateLayer,
        searchLayer
        ],
        
        view: new ol.View({
          center: ol.proj.fromLonLat([77.2090, 28.6139]),
          zoom: 5
          })
          });

  layerToggleButton = document.getElementById("layerToggleButton");
  layersPanel = document.getElementById("layersPanel");
  layersList = document.getElementById("layersList");

  if (layerToggleButton) {
    layerToggleButton.addEventListener("click", function (event) {
      event.stopPropagation();
      const nextOpen = !isLayerPanelOpen;
      setLayerPanelOpen(nextOpen);

      if (nextOpen) {
        renderLayerList();
      }
    });
  }

  if (layersPanel) {
    layersPanel.addEventListener("click", function (event) {
      event.stopPropagation();
    });
  }

  document.addEventListener("click", function () {
    if (isLayerPanelOpen) {
      setLayerPanelOpen(false);
    }
  });
  renderLayerList();
// -------------popup container----------------------
  popupContainer = document.getElementById("popup");
  popupContent = document.getElementById("popup-content");
  popupOverlay = new ol.Overlay({
    element: popupContainer,
    positioning: "bottom-center",
    offset: [0, -12],
    autoPan: {
      animation: {
        duration: 250
      }
    }
  });

  map.addOverlay(popupOverlay);
  map.on("click", function (event) {
    const feature = map.forEachFeatureAtPixel(event.pixel, function (item) {
      return item;
    });
    const lonLat = ol.proj.toLonLat(event.coordinate);

    loadPopupWeather(event.coordinate, lonLat[0], lonLat[1], feature);
  });
  map.on("pointerdrag", hidePopup); //popup container------------------------------------

  Promise.all([
    loadBoundary(),
    loadDistrict("All India"),
    loadCircles(),
    loadState("All India"),
  ]).then(() => {
    loadWeatherIDW("RAIN_IDW");
  });
};
</script>

</body>
</html>
`;
}

export default function Map({ webViewRef, setActiveIdwType, setIdwLoading}) {
  const {
    setData,
    location,
    setLocation,
    setLocationName,
    data,
    setCircle,
    setCircleSelected,
  } = useContext(WeatherContext);

  
  const [token, setToken] = useState(null);
  const [webViewSource, setWebViewSource] = useState(null);
  useEffect(() => {
    AsyncStorage.getItem("token").then(setToken);
  }, []);
  useEffect(() => {
    if (!token) return;
    setWebViewSource({ html: buildMapHtml(token) });
  }, [token]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem("user");
        const parsedUser = userString ? JSON.parse(userString) : null;

        if (parsedUser?.location) {
          setLocation(parsedUser.location);
          setLocationName(parsedUser.location_name);
          setCircle(parsedUser.indus_circle);
        }
      } catch (error) {
        console.log("User load error:", error);
      }
    };

    loadUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLocation, setLocationName]);

  useEffect(() => {
    if (!location) return;

    const getWeather = async () => {
      try {
        setData(null);
        const response = await fetchWeather(location);
        setData(response);
      } catch (error) {
        console.log("Weather error:", error);
      }
    };

    getWeather();
  }, [location, setData]);
  useEffect(() => {
    if (data && webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: "WEATHER_DATA",
          payload: data,
        }),
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  
const handleWebViewMessage = (event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);

      if (msg.type === "LOCATION_CHANGE") {
        setLocation(msg.coords);
        setLocationName(msg.name);
        setCircle(msg.circle);
        setCircleSelected(true);
      }
      if (msg.type === "IDW_STATE_CHANGE") {
        setActiveIdwType(IDW_ACTIVE_BUTTONS[msg.activeType] || null);
      }
      if (msg.type === "IDW_LOADED") {
        setIdwLoading(false);
      }
    } catch (error) {
      console.log("WEBVIEW:", event.nativeEvent.data);
    }
  };

  if (!token || !webViewSource) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={webViewSource}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleWebViewMessage}
        // injectedJavaScript={injectedConsoleBridge}
        style={{ height: 600 }}
      />
    </>
  );
}