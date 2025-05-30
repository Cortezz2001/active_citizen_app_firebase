// FilterButton.jsx
import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const FilterButton = ({
    onPress,
    hasActiveFilters,
    size = 24,
    containerStyles = "",
    activeColor = "#006FFD",
    inactiveColor = "#9CA3AF",
    isDark,
}) => {
    return (
        <TouchableOpacity
            className={`p-2 rounded-full shadow-md border ${
                isDark
                    ? "bg-dark-surface border-dark-border"
                    : "bg-ghostwhite border-gray-200"
            } ${containerStyles}`}
            onPress={onPress}
        >
            <MaterialIcons
                name="filter-list"
                size={size}
                color={
                    hasActiveFilters
                        ? isDark
                            ? "#0066E6"
                            : activeColor
                        : isDark
                        ? "#B3B3B3"
                        : inactiveColor
                }
            />
        </TouchableOpacity>
    );
};

export default FilterButton;
