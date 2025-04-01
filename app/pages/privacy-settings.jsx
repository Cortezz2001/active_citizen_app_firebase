import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const PrivacySettings = () => {
    return (
        <SafeAreaView className="bg-secondary flex-1">
            <View className="px-4 pt-4 flex-1">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color="#000"
                        />
                    </TouchableOpacity>
                    <Text className="text-2xl font-mbold ml-4">
                        Privacy Settings
                    </Text>
                </View>

                <View className="flex-1 justify-center items-center">
                    <Text className="text-xl">Privacy Settings Page</Text>
                </View>
            </View>
        </SafeAreaView>
    );
};

export default PrivacySettings;
