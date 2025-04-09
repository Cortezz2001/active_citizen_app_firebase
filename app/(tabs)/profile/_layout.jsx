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
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import auth from "@react-native-firebase/auth";

const ProfileLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout, refreshUser } = useAuthContext();
    const [alertVisible, setAlertVisible] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(user?.photoURL || null);
    const storage = getStorage();

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

    // Функция для выбора изображения из галереи
    const pickImage = async () => {
        try {
            // Запрашиваем разрешение на доступ к галерее
            const { status } =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== "granted") {
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: "Необходимо разрешение на доступ к галерее для смены аватара.",
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
                text1: "Error",
                text2: "Произошла ошибка при выборе изображения.",
            });
        }
    };

    // Функция для загрузки аватара в Firebase Storage
    const uploadAvatar = async (uri) => {
        if (!user || !user.uid) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Вы должны быть авторизованы для смены аватара.",
            });
            return;
        }

        try {
            setUploadingImage(true);

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
        } catch (error) {
            console.error("Error uploading avatar:", error);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Произошла ошибка при загрузке аватара.",
            });
        } finally {
            setUploadingImage(false);
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
