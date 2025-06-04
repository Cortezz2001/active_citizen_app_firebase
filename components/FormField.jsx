import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const FormField = ({
    title,
    placeholder,
    value,
    handleChangeText,
    containerStyle,
    inputStyle,
    multiline = false,
    numberOfLines = 1,
    textAlignVertical = "center",
    isDark,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className={`mb-2 ${containerStyle}`}>
            <View
                className={`border rounded-lg px-4 py-3 relative ${
                    isDark
                        ? "bg-dark-surface border-dark-border"
                        : "bg-ghostwhite border-gray-300"
                }`}
            >
                <TextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={handleChangeText}
                    secureTextEntry={title === "Password" && !showPassword}
                    multiline={multiline}
                    numberOfLines={numberOfLines}
                    textAlignVertical={textAlignVertical}
                    className={`font-mregular ${inputStyle} ${
                        isDark ? "text-dark-text-primary" : "text-black"
                    }`}
                    placeholderTextColor={isDark ? "#A0A0A0" : "#6B7280"}
                    {...props}
                />
                {title === "Password" && (
                    <TouchableOpacity
                        className="absolute right-4 top-3.5"
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialIcons
                            name={
                                showPassword ? "visibility" : "visibility-off"
                            }
                            size={20}
                            color={isDark ? "#A0A0A0" : "#6B7280"}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

export default FormField;
