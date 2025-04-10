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
}) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-center items-center bg-black/50">
                <View className="bg-white rounded-xl p-5 mx-5 w-4/5 items-center shadow-lg">
                    {/* Alert Title */}
                    <Text className="text-lg font-mbold mb-2 text-center">
                        {title}
                    </Text>

                    {/* Alert Message */}
                    <Text className="text-gray-600 text-center font-mregular mb-5">
                        {message}
                    </Text>

                    {/* Buttons */}
                    <View className="flex-row justify-between w-full">
                        <TouchableOpacity
                            className="flex-1 border border-gray-300 rounded-full py-3 mx-1"
                            onPress={onSecondaryButtonPress || onClose}
                            disabled={isLoading}
                        >
                            <Text className="text-primary font-msemibold text-center">
                                {secondaryButtonText || "Cancel"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className={`flex-1 bg-primary rounded-full py-3 mx-1 flex-row justify-center items-center ${
                                isLoading ? "opacity-50" : ""
                            }`}
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
