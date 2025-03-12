import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthContext } from "../../lib/context";
import { router } from "expo-router";
import { images } from "../../constants";
import CustomAlert from "../../components/CustomAlertTwoButtons";

const Profile = () => {
    const { user, logout } = useAuthContext();
    const [activeTab, setActiveTab] = useState("Account");
    const [editMode, setEditMode] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);

    // Profile settings data
    const accountSettingsData = [
        {
            id: 1,
            title: "Change Password",
            icon: "lock",
            action: () => console.log("Change Password"),
        },
        {
            id: 2,
            title: "Edit Profile",
            icon: "edit",
            action: () => setEditMode(true),
        },
        {
            id: 3,
            title: "Privacy Settings",
            icon: "privacy-tip",
            action: () => console.log("Privacy Settings"),
        },
    ];

    const profileSettingsData = [
        {
            id: 1,
            title: "Notification Preferences",
            icon: "notifications",
            action: () => console.log("Notifications"),
        },
        {
            id: 2,
            title: "Language",
            icon: "language",
            action: () => console.log("Language"),
        },
    ];

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
                            : require("../../assets/images/anonymous.png")
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

    const renderContent = () => {
        switch (activeTab) {
            case "Account":
                return (
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
                );
            case "Settings":
                return (
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
                );
        }
    };

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
                <View className="flex-row justify-between mb-4 bg-white rounded-full p-1">
                    {["Account", "Settings"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
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

                {/* Content Scroll View */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                >
                    {renderContent()}
                </ScrollView>

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

export default Profile;
