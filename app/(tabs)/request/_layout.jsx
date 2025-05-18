// _layout.jsx
import React from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

const RequestLayout = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();

    const getCurrentTab = () => {
        const path = pathname.split("/").pop();
        return path === "send-request" ? "send_request" : "my_requests";
    };
    const activeTab = getCurrentTab();

    const navigateToTab = (tabId) => {
        const tabRoute =
            tabId === "send_request" ? "send-request" : "my-requests";
        router.push(`/request/${tabRoute}`);
    };

    const tabs = [
        { id: "send_request", label: t("request_layout.tabs.send_request") },
        { id: "my_requests", label: t("request_layout.tabs.my_requests") },
    ];

    return (
        <SafeAreaView className="bg-secondary flex-1">
            <View className="px-4 pt-4 flex-1">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-mbold">
                        {t("request_layout.title")}
                    </Text>
                </View>

                <View className="flex-row justify-between mb-4 bg-white rounded-full">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => navigateToTab(tab.id)}
                            className={`flex-1 py-2 rounded-full ${
                                activeTab === tab.id
                                    ? "bg-primary"
                                    : "bg-transparent"
                            }`}
                        >
                            <Text
                                className={`text-center font-mmedium ${
                                    activeTab === tab.id
                                        ? "text-white"
                                        : "text-gray-600"
                                }`}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Slot />
            </View>
        </SafeAreaView>
    );
};

export default RequestLayout;
