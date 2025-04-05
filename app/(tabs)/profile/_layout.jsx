import React, { useState, useEffect } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthContext } from "../../../lib/context";
import CustomAlert from "../../../components/CustomAlertTwoButtons";

const ProfileLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthContext();
    const [alertVisible, setAlertVisible] = useState(false);

    // Извлекаем текущую вкладку из пути
    const getCurrentTab = () => {
        const path = pathname.split("/").pop();
        return path === "profile"
            ? "Account"
            : path.charAt(0).toUpperCase() + path.slice(1);
    };
    const activeTab = getCurrentTab();

    // Функция для перехода между вкладками
    const navigateToTab = (tab) => {
        const tabRoute = tab.toLowerCase();
        router.push(`/profile/${tabRoute}`);
    };

    const handleSignOut = () => {
        setAlertVisible(true);
    };

    const confirmSignOut = () => {
        logout();
        router.replace("/sign-in");
        setAlertVisible(false);
    };

    const renderProfileHeader = () => (
        <View className="items-center mb-6">
            <TouchableOpacity>
                <Image
                    source={
                        user?.photoURL
                            ? { uri: user.photoURL }
                            : require("../../../assets/images/anonymous.png")
                    }
                    className="w-32 h-32 rounded-full border-4 border-primary"
                />
            </TouchableOpacity>
            <Text className="text-xl font-mbold mt-4">
                {user?.displayName || "User"}
            </Text>
            <Text className="text-gray-500">{user?.email}</Text>
        </View>
    );

    return (
        <SafeAreaView className="bg-secondary flex-1">
            <View className="px-4 pt-4 flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-mbold">Profile</Text>
                    <TouchableOpacity onPress={handleSignOut}>
                        <MaterialIcons name="logout" size={24} color="red" />
                    </TouchableOpacity>
                </View>

                {/* Profile Header */}
                {renderProfileHeader()}

                {/* Tab Navigation */}
                <View className="flex-row justify-between mb-4 bg-white rounded-full">
                    {["Account", "Settings"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => navigateToTab(tab)}
                            className={`flex-1 py-2 rounded-full ${
                                activeTab === tab
                                    ? "bg-primary"
                                    : "bg-transparent"
                            }`}
                        >
                            <Text
                                className={`text-center font-mmedium ${
                                    activeTab === tab
                                        ? "text-white"
                                        : "text-gray-600"
                                }`}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content Slot */}
                <Slot />

                {/* Custom Alert */}
                <CustomAlert
                    visible={alertVisible}
                    title="Log out"
                    message="Are you sure you want to log out? You'll need to login again to use the app."
                    primaryButtonText="Log out"
                    secondaryButtonText="Cancel"
                    onPrimaryButtonPress={confirmSignOut}
                    onSecondaryButtonPress={() => setAlertVisible(false)}
                    onClose={() => setAlertVisible(false)}
                />
            </View>
        </SafeAreaView>
    );
};

export default ProfileLayout;
