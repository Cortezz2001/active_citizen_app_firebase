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
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";
import LoadingIndicator from "../../components/LoadingIndicator";
import { StatusBar } from "expo-status-bar";

const PermissionsPreferences = () => {
    const { t } = useTranslation();

    // States for permissions
    const [permissions, setPermissions] = useState({
        notifications: false,
        location: false,
        gallery: false,
    });

    // Loading state
    const [isLoading, setIsLoading] = useState(true);

    // Check current permissions on component mount
    useEffect(() => {
        checkAllPermissions();
    }, []);

    const checkAllPermissions = async () => {
        try {
            setIsLoading(true);

            // Check notification permission
            const notificationStatus =
                await Notifications.getPermissionsAsync();

            // Check location permission
            const locationStatus =
                await Location.getForegroundPermissionsAsync();

            // Check gallery permission
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

    // Function to open app settings
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

    // Function to toggle notification permission
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
                    // Если разрешение не получено, показываем Alert с предложением перейти в настройки
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
            // Show alert to disable in settings
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

    // Function to toggle location permission
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

    // Function to toggle gallery permission
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

    // Data for permission settings
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
        <View key={item.id} className="bg-white rounded-lg mb-2 p-4 shadow-md">
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <View className="bg-blue-100 rounded-full p-3 mr-4">
                        <MaterialIcons
                            name={item.icon}
                            size={24}
                            color="#006FFD"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-mmedium text-black mb-1">
                            {item.title}
                        </Text>
                        <Text className="text-sm font-mmedium text-gray-500">
                            {item.description}
                        </Text>
                    </View>
                </View>
                <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: "#E5E5E5", true: "#006FFD" }}
                    thumbColor={item.value ? "#FFFFFF" : "#FFFFFF"}
                    ios_backgroundColor="#E5E5E5"
                    disabled={isLoading}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView className="bg-white flex-1">
            <StatusBar style="dark" />
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
                        {t("permissions_preferences.title")}
                    </Text>
                </View>
            </View>

            <ScrollView
                className="px-4 pt-4 flex-1"
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <LoadingIndicator />
                ) : (
                    <>
                        <View>
                            <Text className="text-base font-mregular text-gray-600 mb-4">
                                {t("permissions_preferences.description")}
                            </Text>
                        </View>
                        <View>
                            {permissionSettings.map(renderPermissionItem)}
                        </View>
                    </>
                )}

                <View className="mt-4 mb-6 p-4 bg-blue-50 rounded-lg">
                    <View className="flex-row items-start">
                        <MaterialIcons
                            name="info"
                            size={20}
                            color="#006FFD"
                            style={{ marginTop: 2, marginRight: 8 }}
                        />
                        <Text className="text-sm font-mregular text-gray-700 flex-1">
                            {t("permissions_preferences.info_note")}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PermissionsPreferences;
