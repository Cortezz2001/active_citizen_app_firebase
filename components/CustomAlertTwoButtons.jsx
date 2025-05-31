import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
} from "react-native";

const CustomAlert = ({
    visible,
    title,
    message,
    primaryButtonText,
    secondaryButtonText,
    onPrimaryButtonPress,
    onSecondaryButtonPress,
    onClose,
    isLoading,
    isDark,
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View
                    className={`rounded-xl p-5 mx-5 w-4/5 items-center shadow-lg border ${
                        isDark
                            ? "bg-dark-surface border-dark-border"
                            : "bg-ghostwhite border-light-border"
                    }`}
                >
                    {/* Alert Title */}
                    <Text
                        className={`text-lg font-mbold mb-2 text-center ${
                            isDark
                                ? "text-dark-text-primary"
                                : "text-light-text-primary"
                        }`}
                    >
                        {title}
                    </Text>

                    {/* Alert Message */}
                    <Text
                        className={`text-center font-mregular mb-5 ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-light-text-secondary"
                        }`}
                    >
                        {message}
                    </Text>

                    {/* Buttons */}
                    <View className="flex-row justify-between w-full">
                        <TouchableOpacity
                            className={`flex-1 border rounded-full py-3 mx-1 ${
                                isDark
                                    ? "border-dark-border"
                                    : "border-gray-300"
                            }`}
                            onPress={onSecondaryButtonPress || onClose}
                            disabled={isLoading}
                        >
                            <Text
                                className={`${
                                    isDark
                                        ? "text-dark-primary"
                                        : "text-light-primary"
                                } font-msemibold text-center`}
                            >
                                {secondaryButtonText || "Cancel"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`flex-1  rounded-full py-3 mx-1 flex-row justify-center items-center ${
                                isLoading ? "opacity-50" : ""
                            } ${isDark ? "bg-dark-primary" : "bg-primary"}`}
                            onPress={onPrimaryButtonPress}
                            disabled={isLoading}
                        >
                            <Text className="text-white font-msemibold text-center">
                                {primaryButtonText || "OK"}
                            </Text>
                            {isLoading && (
                                <ActivityIndicator
                                    animating={isLoading}
                                    color="#fff"
                                    size="small"
                                    className="ml-2"
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;
