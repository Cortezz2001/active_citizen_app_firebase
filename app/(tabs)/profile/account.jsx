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
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../lib/themeContext";

const Account = () => {
    const { t } = useTranslation();
    const { deleteDocument } = useFirestore();
    const { user } = useAuthContext();
    const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const storage = getStorage();
    const { isDark } = useTheme();

    const handleDeleteAccount = () => {
        setDeleteAlertVisible(true);
    };

    const deleteUserAvatars = async (userId) => {
        try {
            const avatarsRef = ref(storage, `avatars/${userId}`);
            const fileList = await listAll(avatarsRef);
            const deletePromises = fileList.items.map((fileRef) => {
                return deleteObject(fileRef);
            });
            await Promise.all(deletePromises);
            console.log("All user avatars deleted successfully");
        } catch (error) {
            console.log("Error deleting avatars or no avatars found:", error);
        }
    };

    const confirmDeleteAccount = async () => {
        try {
            setIsDeleting(true);

            // Сохраняем uid перед удалением аккаунта
            const userUid = user?.uid;

            // Сначала пытаемся удалить аккаунт из Firebase Auth
            await auth().currentUser.delete();

            // Если удаление аккаунта прошло успешно, удаляем данные пользователя
            if (userUid) {
                await deleteUserAvatars(userUid);
                await deleteDocument("users", userUid);
            }

            setDeleteAlertVisible(false);
            router.replace("/sign-in");
            Toast.show({
                type: "success",
                text1: t("account.toast.success_title"),
                text2: t("account.toast.success_message"),
            });
        } catch (error) {
            console.error("Error deleting account:", error);

            // Скрываем модальное окно при любой ошибке
            setDeleteAlertVisible(false);

            if (error.code === "auth/requires-recent-login") {
                Toast.show({
                    type: "error",
                    text1: t("account.toast.reauth_required_title"),
                    text2: t("account.toast.reauth_required_message"),
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: t("account.toast.error_title"),
                    text2: error.message || t("account.toast.error_message"),
                });
            }
        } finally {
            setIsDeleting(false);
        }
    };

    // Profile settings data with IDs and translated labels
    const accountSettingsData = [
        {
            id: "edit_profile",
            title: t("account.settings.edit_profile"),
            icon: "edit",
            action: () => router.push("/pages/edit-profile"),
        },
        {
            id: "privacy_policy",
            title: t("account.settings.privacy_policy"),
            icon: "privacy-tip",
            action: () => router.push("/pages/privacy-policy"),
        },
        {
            id: "delete_account",
            title: t("account.settings.delete_account"),
            icon: "delete",
            action: handleDeleteAccount,
        },
    ];

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            className={`flex-1 ${
                isDark ? "bg-dark-background" : "bg-secondary"
            }`}
        >
            <View>
                {accountSettingsData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className={`rounded-lg mb-4 p-4 shadow-md flex-row items-center ${
                            isDark ? "bg-dark-surface" : "bg-ghostwhite"
                        }`}
                        onPress={item.action}
                        disabled={isDeleting && item.id === "delete_account"}
                    >
                        <MaterialIcons
                            name={item.icon}
                            size={24}
                            color={
                                item.id === "delete_account"
                                    ? "#EF4444"
                                    : isDark
                                    ? "#0066E6"
                                    : "#006FFD"
                            }
                        />
                        <Text
                            className={`flex-1 ml-4 font-mmedium text-lg ${
                                item.id === "delete_account"
                                    ? "text-red-500"
                                    : isDark
                                    ? "text-dark-text-primary"
                                    : "text-light-text-primary"
                            }`}
                        >
                            {item.title}
                        </Text>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={
                                item.id === "delete_account"
                                    ? "#EF4444"
                                    : isDark
                                    ? "#0066E6"
                                    : "#006FFD"
                            }
                        />
                    </TouchableOpacity>
                ))}
            </View>

            <CustomAlert
                visible={deleteAlertVisible}
                title={t("account.delete_alert.title")}
                message={t("account.delete_alert.message")}
                primaryButtonText={t("account.delete_alert.primary_button")}
                secondaryButtonText={t("account.delete_alert.secondary_button")}
                onPrimaryButtonPress={confirmDeleteAccount}
                onSecondaryButtonPress={() => setDeleteAlertVisible(false)}
                onClose={() => setDeleteAlertVisible(false)}
                isLoading={isDeleting}
                isDark={isDark}
            />
        </ScrollView>
    );
};

export default Account;
