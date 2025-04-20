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

const Account = () => {
    const { t } = useTranslation();
    const { deleteDocument } = useFirestore();
    const { user, logout } = useAuthContext();
    const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const storage = getStorage();

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
            if (user && user.uid) {
                await deleteUserAvatars(user.uid);
                await deleteDocument("users", user.uid);
            }
            await auth().currentUser.delete();
            setDeleteAlertVisible(false);
            router.replace("/sign-in");
            Toast.show({
                type: "success",
                text1: t("account.toast.success_title"),
                text2: t("account.toast.success_message"),
            });
        } catch (error) {
            console.error("Error deleting account:", error);
            Toast.show({
                type: "error",
                text1: t("account.toast.error_title"),
                text2: error.message || t("account.toast.error_message"),
            });
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
            id: "privacy_settings",
            title: t("account.settings.privacy_settings"),
            icon: "privacy-tip",
            action: () => router.push("/pages/privacy-settings"),
        },
        {
            id: "delete_account",
            title: t("account.settings.delete_account"),
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
                        disabled={isDeleting && item.id === "delete_account"}
                    >
                        <MaterialIcons
                            name={item.icon}
                            size={24}
                            color={
                                item.id === "delete_account"
                                    ? "#EF4444"
                                    : "#006FFD"
                            }
                        />
                        <Text
                            className={`flex-1 ml-4 font-mmedium text-lg ${
                                item.id === "delete_account"
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
                                item.id === "delete_account"
                                    ? "#EF4444"
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
            />
        </ScrollView>
    );
};

export default Account;
