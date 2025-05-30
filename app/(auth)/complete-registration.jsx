import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFirestore } from "../../hooks/useFirestore";
import auth from "@react-native-firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import CustomButton from "@/components/CustomButton";
import Toast from "react-native-toast-message";
import { useAuthContext } from "../../lib/context";
import { MaterialIcons } from "@expo/vector-icons";
import FormField from "@/components/FormField";
import DropdownField from "@/components/DropdownField";
import { useTranslation } from "react-i18next";
import { getCityNameByKey, getCityDropdownData } from "../../lib/cities";
import {
    getGenderNameByKey,
    getGenderDropdownData,
    getGenderKeyByName,
} from "../../lib/genders";
import { useData } from "../../lib/datacontext";
import { useTheme } from "../../lib/themeContext"; // Import useTheme

const CompleteRegistration = () => {
    const { t, i18n } = useTranslation();
    const { user, logout, refreshUser } = useAuthContext();
    const { setDocument } = useFirestore();
    const { refreshAllData } = useData();
    const { isDark } = useTheme(); // Get current theme
    const currentLanguage = i18n.language || "en";

    // Get cities in the current language for the dropdown
    const cityOptions = getCityDropdownData(currentLanguage).map(
        (city) => city.value
    );

    // Get genders in the current language for the dropdown
    const genderOptions = getGenderDropdownData(currentLanguage).map(
        (gender) => gender.value
    );

    const [form, setForm] = useState({
        fname: "",
        lname: "",
        cityKey: "",
        genderKey: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        const { fname, lname, cityKey, genderKey } = form;

        if (!fname || !lname || !cityKey || !genderKey) {
            Toast.show({
                type: "error",
                text1: t("complete_registration.toast.error.title"),
                text2: t(
                    "complete_registration.toast.error.all_fields_required"
                ),
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const displayName = `${fname} ${lname.charAt(0)}.`;
            await auth().currentUser.updateProfile({ displayName });
            await setDocument("users", user.uid, {
                fname,
                lname,
                cityKey,
                genderKey,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            await refreshUser();
            refreshAllData();

            Toast.show({
                type: "success",
                text1: t("complete_registration.toast.success.title"),
                text2: t("complete_registration.toast.success.message"),
            });

            router.replace("/home");
        } catch (err) {
            console.error("Error completing profile:", err);
            Toast.show({
                type: "error",
                text1: t("complete_registration.toast.error.title"),
                text2: t(
                    "complete_registration.toast.error.registration_failed"
                ),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await logout();
            router.replace("/sign-in");
        } catch (error) {
            console.error("Error signing out:", error);
            Toast.show({
                type: "error",
                text1: t("complete_registration.toast.error.title"),
                text2: t("complete_registration.toast.error.sign_out_failed"),
            });
        }
    };

    // Handle city selection from dropdown
    const handleCitySelect = (selectedCityName) => {
        const cityData = getCityDropdownData(currentLanguage).find(
            (city) => city.value === selectedCityName
        );

        if (cityData) {
            setForm({ ...form, cityKey: cityData.key });
        }
    };

    // Handle gender selection from dropdown
    const handleGenderSelect = (selectedGenderName) => {
        const genderData = getGenderDropdownData(currentLanguage).find(
            (gender) => gender.value === selectedGenderName
        );

        if (genderData) {
            setForm({ ...form, genderKey: genderData.key });
        }
    };

    // Get the display name for the current city key in the current language
    const displayCityName = form.cityKey
        ? getCityNameByKey(form.cityKey, currentLanguage)
        : "";

    // Get the display name for the current gender key in the current language
    const displayGenderName = form.genderKey
        ? getGenderNameByKey(form.genderKey, currentLanguage)
        : "";

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-white"}`}
        >
            <View className="px-6 pt-4 flex-row mb-2">
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="flex-row items-center"
                    accessibilityLabel={t("complete_registration.back_button")}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={isDark ? "#0066E6" : "#3b82f6"}
                    />
                    <Text
                        className={`ml-1 font-msemibold ${
                            isDark ? "text-dark-primary" : "text-primary"
                        }`}
                    >
                        {t("complete_registration.back_button")}
                    </Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                className="px-6"
                contentContainerStyle={{
                    justifyContent: "center",
                    paddingVertical: 30,
                }}
                showsVerticalScrollIndicator={false}
            >
                <Text
                    className={`text-3xl font-mbold text-center mt-2 mb-10 ${
                        isDark ? "text-dark-text-primary" : "text-black"
                    }`}
                >
                    {t("complete_registration.title")}
                </Text>
                <View className="flex-1 justify-center">
                    <Text
                        className={`font-msemibold text-left mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("complete_registration.fields.first_name.label")}{" "}
                        <Text className="text-red-500">
                            {t("complete_registration.required_indicator")}
                        </Text>
                    </Text>
                    <FormField
                        title={t(
                            "complete_registration.fields.first_name.label"
                        )}
                        placeholder={t(
                            "complete_registration.fields.first_name.placeholder"
                        )}
                        value={form.fname}
                        handleChangeText={(e) => setForm({ ...form, fname: e })}
                        containerStyle="mb-4"
                        isDark={isDark}
                    />

                    <Text
                        className={`font-msemibold text-left mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("complete_registration.fields.last_name.label")}{" "}
                        <Text className="text-red-500">
                            {t("complete_registration.required_indicator")}
                        </Text>
                    </Text>
                    <FormField
                        title={t(
                            "complete_registration.fields.last_name.label"
                        )}
                        placeholder={t(
                            "complete_registration.fields.last_name.placeholder"
                        )}
                        value={form.lname}
                        handleChangeText={(e) => setForm({ ...form, lname: e })}
                        containerStyle="mb-4"
                        isDark={isDark}
                    />

                    <Text
                        className={`font-msemibold text-left mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("complete_registration.fields.city.label")}{" "}
                        <Text className="text-red-500">
                            {t("complete_registration.required_indicator")}
                        </Text>
                    </Text>
                    <DropdownField
                        title={t("complete_registration.fields.city.label")}
                        placeholder={t(
                            "complete_registration.fields.city.placeholder"
                        )}
                        value={displayCityName}
                        options={cityOptions}
                        onSelect={handleCitySelect}
                        containerStyle="mb-4"
                        isDark={isDark}
                    />

                    <Text
                        className={`font-msemibold text-left mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("complete_registration.fields.gender.label")}{" "}
                        <Text className="text-red-500">
                            {t("complete_registration.required_indicator")}
                        </Text>
                    </Text>
                    <DropdownField
                        title={t("complete_registration.fields.gender.label")}
                        placeholder={t(
                            "complete_registration.fields.gender.placeholder"
                        )}
                        value={displayGenderName}
                        options={genderOptions}
                        onSelect={handleGenderSelect}
                        containerStyle="mb-6"
                        isDark={isDark}
                    />

                    <CustomButton
                        title={t("complete_registration.buttons.complete")}
                        handlePress={handleComplete}
                        containerStyles={`rounded-lg py-3 ${
                            isDark ? "bg-dark-primary" : "bg-primary"
                        } mt-4`}
                        textStyles={
                            isDark ? "text-dark-text-primary" : "text-white"
                        }
                        isLoading={isSubmitting}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CompleteRegistration;
