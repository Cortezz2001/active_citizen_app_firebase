import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../lib/themeContext";

const ThemeToggleButton = ({ isDark }) => {
    const { toggleTheme } = useTheme();

    return (
        <>
            <TouchableOpacity
                onPress={toggleTheme}
                className={`p-2 rounded-full border ${
                    isDark
                        ? "bg-dark-surface border-dark-border"
                        : "bg-ghostwhite border-light-border"
                }`}
            >
                <MaterialIcons
                    name={isDark ? "light-mode" : "dark-mode"}
                    size={24}
                    color={isDark ? "#FFFFFF" : "#000000"}
                />
            </TouchableOpacity>
        </>
    );
};

export default ThemeToggleButton;
