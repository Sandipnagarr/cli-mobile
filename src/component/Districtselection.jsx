import React, { useContext, useEffect, useState } from "react";

import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";

import { Picker } from "@react-native-picker/picker";

import { WeatherContext } from "../context/WeatherContext";
import { defaultTheme } from "../theme";
import { postrequest } from "../api/Api";

export default function Districtselection({ webViewRef }) {
  const { theme, circle, circleSelected } = useContext(WeatherContext);
  const safeTheme = theme || defaultTheme;
  const styles = createStyles(safeTheme);
  const [districtList, setDistrictList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [emails, setEmails] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [reportType, setReportType] = useState("once");
  const [dropdownVisible, setDropdownVisible] = useState(false);
const isButtonDisabled = !circleSelected;
  useEffect(() => {
    fetchDistricts();
  }, [circle]);

  const fetchDistricts = async () => {
    try {
      const response = await postrequest("get_district_list", {
        circle: circle,
      });

      if (response?.status === "success" && Array.isArray(response.data)) {
        setDistrictList(response.data);
      } else {
        setDistrictList([]);
      }
    } catch (error) {
      console.log("District API Error:", error);

      setDistrictList([]);
    }
  };

  const districtNames = districtList.map((item) => item.district);

  const allSelected = selectedDistricts.length === districtNames.length;

  const toggleDistrict = (district) => {
    if (selectedDistricts.includes(district)) {
      setSelectedDistricts(selectedDistricts.filter((d) => d !== district));
    } else {
      setSelectedDistricts([...selectedDistricts, district]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDistricts.length === districtNames.length) {
      setSelectedDistricts([]);
    } else {
      setSelectedDistricts(districtNames);
    }
  };

  const handleSend = () => {
    console.log({
      emails,
      selectedDistricts,
      reportType,
    });

    setModalVisible(false);
  };

  return (
    <View>
      {/* Top Section */}
      <View style={styles.searchContainer}>
        {/* District Dropdown */}
        <View style={styles.dropdownContainer}>
          <Picker
            selectedValue={selectedDistrict}
            onValueChange={(itemValue) => {
              setSelectedDistrict(itemValue);

              webViewRef.current?.postMessage(
                JSON.stringify({
                  type: "ZOOM_TO_DISTRICT",
                  district: itemValue,
                }),
              );
            }}
          >
            <Picker.Item label="Select District" value="" />

            {districtList.map((item, index) => (
              <Picker.Item
                key={index}
                label={item.district}
                value={item.district}
              />
            ))}
          </Picker>
        </View>

        {/* Button */}
        <TouchableOpacity
          disabled={isButtonDisabled}
          style={[styles.button, isButtonDisabled && styles.disabledButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Send Report</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Popup */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.popupContainer}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 30,
              }}
            >
              <View style={styles.card}>
                {/* Header */}
                <Text style={styles.heading}>
                  Extreme Affected District Report
                </Text>

                {/* Email */}
                <Text style={styles.label}>Email Address(es)</Text>

                <TextInput
                  placeholder="abc@gmail.com, xyz@gmail.com"
                  placeholderTextColor="#94a3b8"
                  value={emails}
                  onChangeText={setEmails}
                  style={styles.input}
                  multiline
                />

                {/* District */}
                <Text style={[styles.label, { marginTop: 22 }]}>
                  Select Districts
                </Text>

                {/* Dropdown */}
                <TouchableOpacity
                  style={styles.dropdown}
                  activeOpacity={0.8}
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                  <Text style={styles.dropdownText}>
                    {selectedDistricts.length > 0
                      ? `${selectedDistricts.length} District Selected`
                      : "Choose Districts"}
                  </Text>

                  <Text style={styles.dropdownArrow}>
                    {dropdownVisible ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>

                {/* Dropdown List */}
                {dropdownVisible && (
                  <ScrollView
                    style={styles.dropdownList}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                  >
                    {/* Select All */}
                    <TouchableOpacity
                      style={styles.optionItem}
                      onPress={handleSelectAll}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          allSelected && styles.checkboxSelected,
                        ]}
                      >
                        {allSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>

                      <Text style={styles.optionText}>
                        {allSelected ? "Unselect All" : "Select All"}
                      </Text>
                    </TouchableOpacity>

                    {/* Districts */}
                    {districtNames.map((district, index) => {
                      const selected = selectedDistricts.includes(district);

                      return (
                        <TouchableOpacity
                          key={index}
                          style={styles.optionItem}
                          onPress={() => toggleDistrict(district)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              selected && styles.checkboxSelected,
                            ]}
                          >
                            {selected && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </View>

                          <Text style={styles.optionText}>{district}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                )}

                {/* Report Type */}
                <Text style={[styles.label, { marginTop: 28 }]}>
                  Report Type
                </Text>

                {[
                  {
                    key: "once",
                    label: "Send Once Only",
                  },
                  {
                    key: "daily",
                    label: "Repeat Report Once a Day",
                  },
                  {
                    key: "deviation",
                    label: "Repeat Deviation Report (9 am - 10 pm)",
                  },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.radioContainer}
                    onPress={() => setReportType(item.key)}
                  >
                    <View
                      style={[
                        styles.radioOuter,
                        reportType === item.key && styles.radioOuterSelected,
                      ]}
                    >
                      {reportType === item.key && (
                        <View style={styles.radioInner} />
                      )}
                    </View>

                    <Text style={styles.radioText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}

                {/* Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.sendButton}
                    activeOpacity={0.9}
                    onPress={handleSend}
                  >
                    <Text style={styles.sendButtonText}>Send</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (safeTheme) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      marginBottom: 10,
      gap: 10,
    },

    dropdownContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#d1d5db",
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "#fff",
    },

    button: {
      flex: 1,
      backgroundColor: safeTheme.primary_button_bg,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 15,
      elevation: 3,
    },

    disabledButton: {
      backgroundColor: "#94a3b8",
    },

    buttonText: {
      color: "#fff",
      fontWeight: "700",
      fontSize: 15,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 10,
    },

    popupContainer: {
      width: "100%",
      height: "92%",
      backgroundColor: "#fff",
      borderRadius: 24,
      overflow: "hidden",
    },

    closeButton: {
      position: "absolute",
      top: 12,
      right: 12,
      zIndex: 999,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#f1f5f9",
      justifyContent: "center",
      alignItems: "center",
    },

    closeText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#334155",
    },

    card: {
      margin: 10,
      backgroundColor: "#ffffff",
      borderRadius: 24,
      padding: 20,
    },

    heading: {
      fontSize: 20,
      fontWeight: "800",
      color: "#0f172a",
    },

    label: {
      fontSize: 15,
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: 10,
    },

    input: {
      backgroundColor: "#f8fafc",
      borderWidth: 1,
      borderColor: safeTheme.primary_border_color,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: "#0f172a",
    },

    dropdown: {
      backgroundColor: "#ffffff",
      borderWidth: 1,
      borderColor: safeTheme.primary_border_color,
      borderRadius: 18,
      paddingHorizontal: 16,
      paddingVertical: 15,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 5,
    },

    dropdownText: {
      fontSize: 15,
      color: "#0f172a",
      fontWeight: "600",
    },

    dropdownArrow: {
      fontSize: 14,
      color: "#475569",
    },

    dropdownList: {
      marginTop: 10,
      backgroundColor: "#ffffff",
      borderRadius: 18,
      borderWidth: 1,
      borderColor: safeTheme.primary_border_color,
      maxHeight: 240,
      padding: 10,
      elevation: 6,
    },

    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#f1f5f9",
    },

    checkbox: {
      width: 22,
      height: 22,
      borderWidth: 2,
      borderColor: safeTheme.primary_border_color,
      borderRadius: 6,
      marginRight: 12,
      alignItems: "center",
      justifyContent: "center",
    },

    checkboxSelected: {
      backgroundColor: safeTheme.primary_button_bg,
      borderColor: safeTheme.primary_button_bg,
    },

    checkmark: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 12,
    },

    optionText: {
      fontSize: 15,
      color: "#0f172a",
      fontWeight: "600",
    },

    radioContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f8fafc",
      padding: 14,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: safeTheme.primary_border_color,
    },

    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: "#94a3b8",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },

    radioOuterSelected: {
      borderColor: safeTheme.primary_button_bg,
    },

    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: safeTheme.primary_button_bg,
    },

    radioText: {
      fontSize: 15,
      color: "#0f172a",
      fontWeight: "600",
      flex: 1,
    },

    buttonRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 25,
    },

    cancelButton: {
      flex: 1,
      backgroundColor: "#e2e8f0",
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: "center",
    },

    cancelButtonText: {
      color: "#334155",
      fontWeight: "700",
      fontSize: 15,
    },

    sendButton: {
      flex: 1,
      backgroundColor: safeTheme.primary_button_bg,
      borderRadius: 16,
      paddingVertical: 15,
      alignItems: "center",
    },

    sendButtonText: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "800",
    },
  });
