import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const NotificationPreferences = () => {
    return (
        <SafeAreaView className="bg-secondary flex-1">
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                >
                    <MaterialIcons name="arrow-back" size={24} />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text
                        className="text-2xl font-mbold text-black"
                        numberOfLines={2}
                        adjustsFontSizeToFit
                    >
                        Notification Preferences
                    </Text>
                </View>
            </View>
            <View className="px-4 pt-4 flex-1">
                <View className="flex-1 justify-center items-center">
                    <Text className="text-xl">
                        Notification Preferences Page
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default NotificationPreferences;
