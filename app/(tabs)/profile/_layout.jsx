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

const ProfileLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, refreshUser } = useAuthContext();
    const [alertVisible, setAlertVisible] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || null);

    const { t } = useTranslation();

    // Извлекаем текущую вкладку из пути
    const getCurrentTab = () => {
        const path = pathname.split("/").pop();
        return path === "profile" ? "account" : path; // Возвращаем id вкладки
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
            // Запрашиваем разрешение на доступ к галерее
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

            // Открываем галерею для выбора изображения
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.Images,
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

            // Удаляем старые аватары пользователя
            await deleteOldAvatars(user.uid);

            // Преобразуем URI в blob
            const response = await fetch(uri);
            const blob = await response.blob();

            // Определяем путь в Firebase Storage
            const filename = `avatars/${user.uid}/${Date.now()}.jpg`;
            const storageRef = ref(storage, filename);

            // Загружаем файл
            await uploadBytes(storageRef, blob);

            // Получаем URL загруженного файла
            const downloadURL = await getDownloadURL(storageRef);

            // Обновляем профиль пользователя в Firebase Auth
            await auth().currentUser.updateProfile({
                photoURL: downloadURL,
            });

            // Обновляем локальное состояние и обновляем пользователя
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
            // Получаем ссылку на папку с аватарами пользователя
            const userAvatarsRef = ref(storage, `avatars/${userId}`);

            // Получаем список всех файлов в папке
            const filesList = await listAll(userAvatarsRef);

            // Удаляем каждый файл
            const deletePromises = filesList.items.map((fileRef) => {
                console.log(`Deleting old avatar: ${fileRef.fullPath}`);
                return deleteObject(fileRef);
            });

            // Ждем, пока все файлы будут удалены
            await Promise.all(deletePromises);

            console.log(`All old avatars for user ${userId} have been deleted`);
        } catch (error) {
            console.error("Error deleting old avatars:", error);
            // Не прерываем процесс загрузки нового аватара, если удаление старых не удалось
        }
    };

    const renderProfileHeader = () => (
        <View className="items-center mb-6">
            <TouchableOpacity onPress={pickImage} disabled={uploadingImage}>
                <View className="relative">
                    <Image
                        source={
                            avatarUrl
                                ? { uri: avatarUrl }
                                : require("../../../assets/images/anonymous.png")
                        }
                        className="w-32 h-32 rounded-full border-4 border-primary"
                    />
                    {uploadingImage ? (
                        <View className="absolute inset-0 bg-black bg-opacity-50 rounded-full justify-center items-center">
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    ) : (
                        <View className="absolute bottom-0 right-0 bg-primary rounded-full p-2">
                            <MaterialIcons
                                name="camera-alt"
                                size={20}
                                color="white"
                            />
                        </View>
                    )}
                </View>
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
                    <Text className="text-2xl font-mbold">
                        {t("profile_layout.title")}
                    </Text>
                    <TouchableOpacity onPress={handleSignOut}>
                        <MaterialIcons name="logout" size={24} color="red" />
                    </TouchableOpacity>
                </View>

                {/* Profile Header */}
                {renderProfileHeader()}

                {/* Tab Navigation */}
                <View className="flex-row justify-between mb-4 bg-white rounded-full">
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
                />
            </View>
        </SafeAreaView>
    );
};

export default ProfileLayout;
