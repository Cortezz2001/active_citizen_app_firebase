import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const Settings = () => {
    const profileSettingsData = [
        {
            id: 1,
            title: "Notification Preferences",
            icon: "notifications",
            action: () => router.push("/pages/notification-preferences"),
        },
        {
            id: 2,
            title: "Language",
            icon: "language",
            action: () => router.push("/pages/language-settings"),
        },
    ];

    return (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View>
                {profileSettingsData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="bg-white rounded-lg mb-4 p-4 shadow-md flex-row items-center"
                        onPress={item.action}
                    >
                        <MaterialIcons
                            name={item.icon}
                            size={24}
                            color="#006FFD"
                        />
                        <Text className="ml-4 font-mmedium text-lg">
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

export default Settings;
