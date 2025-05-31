import React, { useState, useEffect } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuthContext } from "../../../lib/context";
import { useTheme } from "../../../lib/themeContext";
import CustomAlert from "../../../components/CustomAlertTwoButtons";
import * as ImagePicker from "expo-image-picker";
import { storage } from "../../../lib/firebase";
import auth from "@react-native-firebase/auth";
import { useTranslation } from "react-i18next";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    listAll,
    deleteObject,
} from "firebase/storage";
import FastImage from "react-native-fast-image";

const ProfileLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, refreshUser } = useAuthContext();
    const { isDark } = useTheme();
    const [alertVisible, setAlertVisible] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || null);
    const [imageLoading, setImageLoading] = useState(true);

    const { t } = useTranslation();

    // Обновляем avatarUrl при изменении user
    useEffect(() => {
        if (user?.photoURL !== avatarUrl) {
            setAvatarUrl(user?.photoURL || null);
            setImageLoading(true);
        }
    }, [user?.photoURL]);

    // Извлекаем текущую вкладку из пути
    const getCurrentTab = () => {
        const path = pathname.split("/").pop();
        return path === "profile" ? "account" : path;
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

    // Функция для выбора изображения из галереи
    const pickImage = async () => {
        try {
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Toast.show({
                    type: "error",
                    text1: t("profile_layout.toast.error_title"),
                    text2: t("profile_layout.toast.gallery_permission_error"),
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                await uploadAvatar(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error picking image:", error);
            Toast.show({
                type: "error",
                text1: t("profile_layout.toast.error_title"),
                text2: t("profile_layout.toast.image_selection_error"),
            });
        }
    };

    // Функция для загрузки аватара в Firebase Storage
    const uploadAvatar = async (uri) => {
        if (!user || !user.uid) {
            Toast.show({
                type: "error",
                text1: t("profile_layout.toast.error_title"),
                text2: t("profile_layout.toast.auth_error"),
            });
            return;
        }

        try {
            setUploadingImage(true);
            await deleteOldAvatars(user.uid);
            const response = await fetch(uri);
            const blob = await response.blob();
            const filename = `avatars/${user.uid}/${Date.now()}.jpg`;
            const storageRef = ref(storage, filename);
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);
            await auth().currentUser.updateProfile({
                photoURL: downloadURL,
            });

            // Предзагружаем новое изображение в кэш FastImage
            FastImage.preload([{ uri: downloadURL }]);

            setAvatarUrl(downloadURL);
            await refreshUser();
            Toast.show({
                type: "success",
                text1: t("profile_layout.toast.success_title"),
                text2: t("profile_layout.toast.avatar_updated"),
            });
        } catch (error) {
            console.error("Error uploading avatar:", error);
            Toast.show({
                type: "error",
                text1: t("profile_layout.toast.error_title"),
                text2: t("profile_layout.toast.upload_error"),
            });
        } finally {
            setUploadingImage(false);
        }
    };

    // Функция для удаления старых аватаров пользователя
    const deleteOldAvatars = async (userId) => {
        try {
            const userAvatarsRef = ref(storage, `avatars/${userId}`);
            const filesList = await listAll(userAvatarsRef);
            const deletePromises = filesList.items.map((fileRef) => {
                console.log(`Deleting old avatar: ${fileRef.fullPath}`);
                return deleteObject(fileRef);
            });
            await Promise.all(deletePromises);
            console.log(`All old avatars for user ${userId} have been deleted`);
        } catch (error) {
            console.error("Error deleting old avatars:", error);
        }
    };

    // Обработчики для FastImage
    const handleImageLoadStart = () => {
        setImageLoading(true);
    };

    const handleImageLoadEnd = () => {
        setImageLoading(false);
    };

    const handleImageError = (error) => {
        console.error("FastImage loading error:", error);
        setImageLoading(false);
    };

    const renderProfileHeader = () => (
        <View className="items-center mb-6">
            <TouchableOpacity onPress={pickImage} disabled={uploadingImage}>
                <View className="relative">
                    {avatarUrl ? (
                        // Для URL изображений используем FastImage
                        <FastImage
                            source={{
                                uri: avatarUrl,
                                priority: FastImage.priority.high,
                                cache: FastImage.cacheControl.immutable,
                            }}
                            style={{
                                width: 128,
                                height: 128,
                                borderRadius: 64,
                            }}
                            onLoadStart={handleImageLoadStart}
                            onLoadEnd={handleImageLoadEnd}
                            onError={handleImageError}
                            resizeMode={FastImage.resizeMode.cover}
                            fallback={true}
                        />
                    ) : (
                        <Image
                            source={require("../../../assets/images/anonymous.png")}
                            style={{
                                width: 128,
                                height: 128,
                                borderRadius: 64,
                            }}
                            resizeMode="cover"
                        />
                    )}

                    {/* Остальные индикаторы загрузки остаются без изменений */}
                    {imageLoading && avatarUrl && (
                        <View
                            className={`absolute inset-0 ${
                                isDark ? "bg-dark-surface" : "bg-white"
                            } bg-opacity-30 rounded-full justify-center items-center`}
                        >
                            <ActivityIndicator
                                size="large"
                                color={isDark ? "#fff" : "#0066E6"}
                            />
                        </View>
                    )}

                    {uploadingImage && (
                        <View
                            className={`absolute inset-0 ${
                                isDark ? "bg-dark-surface" : "bg-white"
                            } bg-opacity-50 rounded-full justify-center items-center`}
                        >
                            <ActivityIndicator
                                size="large"
                                color={isDark ? "#fff" : "#0066E6"}
                            />
                        </View>
                    )}

                    {!uploadingImage && (
                        <View
                            className={`absolute bottom-0 right-0 ${
                                isDark ? "bg-dark-primary" : "bg-primary"
                            } rounded-full p-2`}
                        >
                            <MaterialIcons
                                name="camera-alt"
                                size={20}
                                color="#fff"
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
            <Text
                className={`text-xl font-mbold mt-4 ${
                    isDark
                        ? "text-dark-text-primary"
                        : "text-light-text-primary"
                }`}
            >
                {user?.displayName || "User"}
            </Text>
            <Text
                className={
                    isDark
                        ? "text-dark-text-secondary"
                        : "text-light-text-secondary"
                }
            >
                {user?.email}
            </Text>
        </View>
    );

    return (
        <SafeAreaView
            className={`flex-1 ${
                isDark ? "bg-dark-background" : "bg-secondary"
            }`}
        >
            <View
                className={`px-4 pt-4 flex-1 ${
                    isDark ? "bg-dark-background" : "bg-secondary"
                }`}
            >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text
                        className={`text-2xl font-mbold ${
                            isDark
                                ? "text-dark-text-primary"
                                : "text-light-text-primary"
                        }`}
                    >
                        {t("profile_layout.title")}
                    </Text>
                    <TouchableOpacity onPress={handleSignOut}>
                        <MaterialIcons
                            name="logout"
                            size={24}
                            color={"#EF4444"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Profile Header */}
                {renderProfileHeader()}

                {/* Tab Navigation */}
                <View
                    className={`flex-row justify-between mb-4 ${
                        isDark ? "bg-dark-background" : "bg-white"
                    } rounded-full`}
                >
                    {[
                        {
                            id: "account",
                            label: t("profile_layout.tabs.account"),
                        },
                        {
                            id: "settings",
                            label: t("profile_layout.tabs.settings"),
                        },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => navigateToTab(tab.id)}
                            className={`flex-1 py-2 rounded-full ${
                                activeTab === tab.id
                                    ? isDark
                                        ? "bg-dark-primary"
                                        : "bg-primary"
                                    : isDark
                                    ? "bg-dark-background"
                                    : "bg-transparent"
                            }`}
                        >
                            <Text
                                className={`text-center font-mmedium ${
                                    activeTab === tab.id
                                        ? "text-white"
                                        : isDark
                                        ? "text-dark-text-secondary"
                                        : "text-light-text-secondary"
                                }`}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Content Slot */}
                <Slot />

                {/* Custom Alert */}
                <CustomAlert
                    visible={alertVisible}
                    title={t("profile_layout.logout_alert.title")}
                    message={t("profile_layout.logout_alert.message")}
                    primaryButtonText={t(
                        "profile_layout.logout_alert.primary_button"
                    )}
                    secondaryButtonText={t(
                        "profile_layout.logout_alert.secondary_button"
                    )}
                    onPrimaryButtonPress={confirmSignOut}
                    onSecondaryButtonPress={() => setAlertVisible(false)}
                    onClose={() => setAlertVisible(false)}
                    isDark={isDark}
                />
            </View>
        </SafeAreaView>
    );
};

export default ProfileLayout;
