import React from "react";
import { TouchableOpacity, Image, Text } from "react-native";
import { useTheme } from "../lib/themeContext";

const GoogleButton = ({ onPress }) => {
    const { isDark } = useTheme();
    return (
        <TouchableOpacity
            className={`w-full mt-3 border ${
                isDark
                    ? "bg-dark-card border-dark-border"
                    : "bg-gray-50 border-gray-200"
            } py-3 rounded-lg flex-row justify-center items-center`}
            onPress={onPress}
        >
            <Image
                source={require("@/assets/icons/google.png")}
                className="w-5 h-5 mr-2"
            />
            <Text
                className={`font-mmedium text-lg ${
                    isDark ? "text-dark-text-primary" : "text-black"
                }`}
            >
                Google
            </Text>
        </TouchableOpacity>
    );
};

export default GoogleButton;
