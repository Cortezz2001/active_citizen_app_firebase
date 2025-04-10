import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuthContext } from "../../../lib/context";
import CustomAlert from "../../../components/CustomAlertTwoButtons";
import auth from "@react-native-firebase/auth";
import { useFirestore } from "../../../hooks/useFirestore";
import Toast from "react-native-toast-message";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";

const Account = () => {
    const { deleteDocument } = useFirestore();
    const { user, logout } = useAuthContext();
    const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const storage = getStorage();

    // Функция для показа алерта подтверждения удаления
    const handleDeleteAccount = () => {
        setDeleteAlertVisible(true);
    };

    // Функция для удаления всех аватаров пользователя из Storage
    const deleteUserAvatars = async (userId) => {
        try {
            // Создаем ссылку на папку с аватарами пользователя
            const avatarsRef = ref(storage, `avatars/${userId}`);

            // Получаем список всех файлов в папке
            const fileList = await listAll(avatarsRef);

            // Удаляем каждый файл
            const deletePromises = fileList.items.map((fileRef) => {
                return deleteObject(fileRef);
            });

            // Ждем завершения всех операций удаления
            await Promise.all(deletePromises);

            console.log("All user avatars deleted successfully");
        } catch (error) {
            // Если папка не существует или другие ошибки, логируем и продолжаем
            console.log("Error deleting avatars or no avatars found:", error);
            // Не выбрасываем ошибку, чтобы не прерывать процесс удаления аккаунта
        }
    };

    // Функция для фактического удаления аккаунта
    const confirmDeleteAccount = async () => {
        try {
            setIsDeleting(true);

            if (user && user.uid) {
                // 1. Удаляем аватары пользователя из Storage
                await deleteUserAvatars(user.uid);

                // 2. Удаляем данные пользователя из Firestore
                await deleteDocument("users", user.uid);
            }

            // 3. Удаляем аккаунт из Firebase Auth
            await auth().currentUser.delete();

            // Закрываем алерт
            setDeleteAlertVisible(false);

            // Перенаправляем на страницу входа
            router.replace("/sign-in");

            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Your account has been deleted successfully.",
            });
        } catch (error) {
            console.error("Error deleting account:", error);

            // Показываем ошибку пользователю
            Toast.show({
                type: "error",
                text1: "Error",
                text2:
                    error.message ||
                    "Failed to delete account. Please try again.",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    // Profile settings data
    const accountSettingsData = [
        {
            id: 1,
            title: "Edit Profile",
            icon: "edit",
            action: () => router.push("/pages/edit-profile"),
        },
        {
            id: 2,
            title: "Privacy Settings",
            icon: "privacy-tip",
            action: () => router.push("/pages/privacy-settings"),
        },
        {
            id: 3,
            title: "Delete account",
            icon: "delete",
            action: handleDeleteAccount,
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
                        disabled={isDeleting && item.id === 3}
                    >
                        <MaterialIcons
                            name={item.icon}
                            size={24}
                            color={
                                item.title === "Delete account"
                                    ? "#EF4444"
                                    : "#006FFD"
                            }
                        />
                        <Text
                            className={`flex-1 ml-4 font-mmedium text-lg ${
                                item.title === "Delete account"
                                    ? "text-red-500"
                                    : "text-black"
                            }`}
                        >
                            {item.title}
                        </Text>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={
                                item.title === "Delete account"
                                    ? "#EF4444"
                                    : "#006FFD"
                            }
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Custom Alert для подтверждения удаления аккаунта */}
            <CustomAlert
                visible={deleteAlertVisible}
                title="Delete Account"
                message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed."
                primaryButtonText="Delete"
                secondaryButtonText="Cancel"
                onPrimaryButtonPress={confirmDeleteAccount}
                onSecondaryButtonPress={() => setDeleteAlertVisible(false)}
                onClose={() => setDeleteAlertVisible(false)}
                isLoading={isDeleting}
            />
        </ScrollView>
    );
};

export default Account;
