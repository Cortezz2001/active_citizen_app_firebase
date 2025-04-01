import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const Account = () => {
    // Profile settings data
    const accountSettingsData = [
        {
            id: 1,
            title: "Change Password",
            icon: "lock",
            action: () => router.push("/pages/change-password"),
        },
        {
            id: 2,
            title: "Edit Profile",
            icon: "edit",
            action: () => router.push("/pages/edit-profile"),
        },
        {
            id: 3,
            title: "Privacy Settings",
            icon: "privacy-tip",
            action: () => router.push("/pages/privacy-settings"),
        },
    ];

    return (
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <View>
                {accountSettingsData.map((item) => (
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

export default Account;
