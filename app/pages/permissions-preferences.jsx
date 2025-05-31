import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    ScrollView,
    Alert,
    Linking,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar"; // Added StatusBar
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/themeContext"; // Import useTheme
import Toast from "react-native-toast-message";
import LoadingIndicator from "../../components/LoadingIndicator";

const PermissionsPreferences = () => {
    const { t } = useTranslation();
    const { isDark } = useTheme(); // Access theme state

    const [permissions, setPermissions] = useState({
        notifications: false,
        location: false,
        gallery: false,
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkAllPermissions();
    }, []);

    const checkAllPermissions = async () => {
        try {
            setIsLoading(true);

            const notificationStatus =
                await Notifications.getPermissionsAsync();
            const locationStatus =
                await Location.getForegroundPermissionsAsync();
            const galleryStatus =
                await ImagePicker.getMediaLibraryPermissionsAsync();

            setPermissions({
                notifications: notificationStatus.status === "granted",
                location: locationStatus.status === "granted",
                gallery: galleryStatus.status === "granted",
            });
        } catch (error) {
            console.error("Error checking permissions:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const openAppSettings = async () => {
        try {
            if (Platform.OS === "ios") {
                await Linking.openURL("app-settings:");
            } else {
                await Linking.openSettings();
            }
        } catch (error) {
            console.error("Error opening app settings:", error);
            Toast.show({
                type: "error",
                text1: t("permissions_preferences.toast.error.title"),
                text2: t("permissions_preferences.toast.error.open_settings"),
            });
        }
    };

    const toggleNotificationPermission = async (value) => {
        if (value) {
            try {
                const { status } =
                    await Notifications.requestPermissionsAsync();
                if (status === "granted") {
                    setPermissions((prev) => ({
                        ...prev,
                        notifications: true,
                    }));
                    Toast.show({
                        type: "success",
                        text1: t("permissions_preferences.toast.success.title"),
                        text2: t(
                            "permissions_preferences.toast.success.notifications"
                        ),
                    });
                } else {
                    Alert.alert(
                        t(
                            "permissions_preferences.notifications.disable_alert.title"
                        ),
                        t(
                            "permissions_preferences.notifications.disable_alert.message"
                        ),
                        [
                            {
                                text: t(
                                    "permissions_preferences.notifications.disable_alert.cancel"
                                ),
                                style: "cancel",
                            },
                            {
                                text: t(
                                    "permissions_preferences.notifications.disable_alert.settings"
                                ),
                                onPress: openAppSettings,
                            },
                        ]
                    );
                }
            } catch (error) {
                console.error(
                    "Error requesting notification permission:",
                    error
                );
                Toast.show({
                    type: "error",
                    text1: t("permissions_preferences.toast.error.title"),
                    text2: t(
                        "permissions_preferences.toast.error.notifications"
                    ),
                });
            }
        } else {
            Alert.alert(
                t("permissions_preferences.notifications.disable_alert.title"),
                t(
                    "permissions_preferences.notifications.disable_alert.message"
                ),
                [
                    {
                        text: t(
                            "permissions_preferences.notifications.disable_alert.cancel"
                        ),
                        style: "cancel",
                    },
                    {
                        text: t(
                            "permissions_preferences.notifications.disable_alert.settings"
                        ),
                        onPress: openAppSettings,
                    },
                ]
            );
        }
    };

    const toggleLocationPermission = async (value) => {
        if (value) {
            try {
                const { status } =
                    await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    setPermissions((prev) => ({ ...prev, location: true }));
                    Toast.show({
                        type: "success",
                        text1: t("permissions_preferences.toast.success.title"),
                        text2: t(
                            "permissions_preferences.toast.success.location"
                        ),
                    });
                } else {
                    Toast.show({
                        type: "error",
                        text1: t("permissions_preferences.toast.error.title"),
                        text2: t(
                            "permissions_preferences.toast.error.location"
                        ),
                    });
                }
            } catch (error) {
                console.error("Error requesting location permission:", error);
            }
        } else {
            Alert.alert(
                t("permissions_preferences.location.disable_alert.title"),
                t("permissions_preferences.location.disable_alert.message"),
                [
                    {
                        text: t(
                            "permissions_preferences.location.disable_alert.cancel"
                        ),
                        style: "cancel",
                    },
                    {
                        text: t(
                            "permissions_preferences.location.disable_alert.settings"
                        ),
                        onPress: openAppSettings,
                    },
                ]
            );
        }
    };

    const toggleGalleryPermission = async (value) => {
        if (value) {
            try {
                const { status } =
                    await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status === "granted") {
                    setPermissions((prev) => ({ ...prev, gallery: true }));
                    Toast.show({
                        type: "success",
                        text1: t("permissions_preferences.toast.success.title"),
                        text2: t(
                            "permissions_preferences.toast.success.gallery"
                        ),
                    });
                } else {
                    Toast.show({
                        type: "error",
                        text1: t("permissions_preferences.toast.error.title"),
                        text2: t("permissions_preferences.toast.error.gallery"),
                    });
                }
            } catch (error) {
                console.error("Error requesting gallery permission:", error);
            }
        } else {
            Alert.alert(
                t("permissions_preferences.gallery.disable_alert.title"),
                t("permissions_preferences.gallery.disable_alert.message"),
                [
                    {
                        text: t(
                            "permissions_preferences.gallery.disable_alert.cancel"
                        ),
                        style: "cancel",
                    },
                    {
                        text: t(
                            "permissions_preferences.gallery.disable_alert.settings"
                        ),
                        onPress: openAppSettings,
                    },
                ]
            );
        }
    };

    const permissionSettings = [
        {
            id: "notifications",
            title: t("permissions_preferences.notifications.title"),
            description: t("permissions_preferences.notifications.description"),
            icon: "notifications",
            value: permissions.notifications,
            onToggle: toggleNotificationPermission,
        },
        {
            id: "location",
            title: t("permissions_preferences.location.title"),
            description: t("permissions_preferences.location.description"),
            icon: "location-on",
            value: permissions.location,
            onToggle: toggleLocationPermission,
        },
        {
            id: "gallery",
            title: t("permissions_preferences.gallery.title"),
            description: t("permissions_preferences.gallery.description"),
            icon: "photo-library",
            value: permissions.gallery,
            onToggle: toggleGalleryPermission,
        },
    ];

    const renderPermissionItem = (item) => (
        <View
            key={item.id}
            className={`rounded-lg mb-2 p-4 shadow-md ${
                isDark ? "bg-dark-surface" : "bg-white"
            }`}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <View
                        className={`rounded-full p-3 mr-4 ${
                            isDark ? "bg-dark-card" : "bg-blue-100"
                        }`}
                    >
                        <MaterialIcons
                            name={item.icon}
                            size={24}
                            color={isDark ? "#0066E6" : "#006FFD"}
                        />
                    </View>
                    <View className="flex-1">
                        <Text
                            className={`text-lg font-mmedium mb-1 ${
                                isDark ? "text-dark-text-primary" : "text-black"
                            }`}
                        >
                            {item.title}
                        </Text>
                        <Text
                            className={`text-sm font-mmedium ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-500"
                            }`}
                        >
                            {item.description}
                        </Text>
                    </View>
                </View>
                <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{
                        false: isDark ? "#3A3A3A" : "#E5E5E5",
                        true: isDark ? "#0066E6" : "#006FFD",
                    }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor={isDark ? "#3A3A3A" : "#E5E5E5"}
                    disabled={isLoading}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView
            className={`bg-${isDark ? "dark-background" : "white"} flex-1`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />
            <View
                className={`px-6 pt-4 pb-2 flex-row items-center border-b ${
                    isDark
                        ? "border-dark-border bg-dark-background"
                        : "border-gray-200 bg-white"
                }`}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={isDark ? "#FFFFFF" : "black"}
                    />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text
                        className={`text-2xl font-mbold ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                    >
                        {t("permissions_preferences.title")}
                    </Text>
                </View>
            </View>

            <ScrollView
                className={`px-6 pt-4 ${
                    isDark ? "bg-dark-background" : "bg-white"
                }`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                }}
            >
                {isLoading ? (
                    <LoadingIndicator isDark={isDark} />
                ) : (
                    <>
                        <View>
                            <Text
                                className={`text-base font-mregular mb-4 ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-600"
                                }`}
                            >
                                {t("permissions_preferences.description")}
                            </Text>
                        </View>
                        <View>
                            {permissionSettings.map(renderPermissionItem)}
                        </View>
                        <View
                            className={`mt-2 mb-6 p-4 rounded-lg ${
                                isDark ? "bg-dark-surface" : "bg-blue-50"
                            }`}
                        >
                            <View className="flex-row items-start">
                                <MaterialIcons
                                    name="info"
                                    size={20}
                                    color={isDark ? "#0066E6" : "#006FFD"}
                                    style={{ marginTop: 2, marginRight: 8 }}
                                />
                                <Text
                                    className={`text-sm font-mregular flex-1 ${
                                        isDark
                                            ? "text-dark-text-secondary"
                                            : "text-gray-700"
                                    }`}
                                >
                                    {t("permissions_preferences.info_note")}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default PermissionsPreferences;
