import { useThemeColor } from "@/hooks/use-theme-color";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface ThemedDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  style?: any;
}

export default function ThemedDatePicker({
  value,
  onChange,
  placeholder = "Select a date",
  style,
}: ThemedDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const formatDate = (date: Date): string => {
    if (date) {
      // console.log(date, typeof date);
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    return "";
  };

  return (
    <View>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={[
          {
            borderWidth: 1,
            borderRadius: 8,
            fontSize: 18,
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderColor: borderColor,
            color: textColor,
            backgroundColor,
          },
          style,
        ]}
      >
        <Text
          style={[
            {
              color: value ? textColor : "#999",
            },
          ]}
        >
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && showPicker && (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPicker(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "flex-end",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
            }}
          >
            <View style={{ backgroundColor }}>
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                }}
              >
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <ThemedText type="link">Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowPicker(false)}>
                  <ThemedText type="link">Done</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center" }}>
                <DateTimePicker
                  value={new Date(value || new Date())}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  textColor={textColor}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === "android" && showPicker && (
        <DateTimePicker
          value={new Date(value || new Date())}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
}
