import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFirestore } from "../../hooks/useFirestore";
import auth from "@react-native-firebase/auth";
import { serverTimestamp, Timestamp } from "firebase/firestore";
import CustomButton from "@/components/CustomButton";
import Toast from "react-native-toast-message";
import { useAuthContext } from "../../lib/context";
import { MaterialIcons } from "@expo/vector-icons";
import FormField from "@/components/FormField";
import DropdownField from "@/components/DropdownField";
import LoadingIndicator from "../../components/LoadingIndicator";
import { useTranslation } from "react-i18next";
import { getCityNameByKey, getCityDropdownData } from "../../lib/cities";
import {
    getGenderNameByKey,
    getGenderDropdownData,
    getGenderKeyByName,
} from "../../lib/genders";
import { useData } from "../../lib/datacontext";
import { useTheme } from "../../lib/themeContext";

const EditProfile = () => {
    const { t, i18n } = useTranslation();
    const { user, refreshUser } = useAuthContext();
    const { getDocument, updateDocument } = useFirestore();
    const currentLanguage = i18n.language || "en";
    const { refreshAllData } = useData();
    const { isDark } = useTheme();

    const [form, setForm] = useState({
        fname: "",
        lname: "",
        cityKey: "",
        genderKey: "",
        lastCityChange: null,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isCityChangeRestricted, setIsCityChangeRestricted] = useState(false);
    const [cityChangeAvailableDate, setCityChangeAvailableDate] =
        useState(null);

    const cityOptions = getCityDropdownData(currentLanguage).map(
        (city) => city.value
    );

    const genderOptions = getGenderDropdownData(currentLanguage).map(
        (gender) => gender.value
    );

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (user && user.uid) {
                    const userData = await getDocument("users", user.uid);
                    if (userData) {
                        const lastCityChange = userData.lastCityChange || null;
                        setForm({
                            fname: userData.fname || "",
                            lname: userData.lname || "",
                            cityKey: userData.cityKey || "",
                            genderKey:
                                userData.genderKey || userData.gender || "",
                            lastCityChange,
                        });

                        // Check if city change is restricted
                        if (lastCityChange) {
                            const now = new Date();
                            const lastChangeDate = lastCityChange.toDate();
                            const daysSinceLastChange =
                                (now - lastChangeDate) / (1000 * 60 * 60 * 24);

                            if (daysSinceLastChange < 90) {
                                setIsCityChangeRestricted(true);
                                const availableDate = new Date(lastChangeDate);
                                availableDate.setDate(
                                    lastChangeDate.getDate() + 90
                                );
                                setCityChangeAvailableDate(
                                    availableDate.toLocaleDateString(
                                        currentLanguage
                                    )
                                );
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                Toast.show({
                    type: "error",
                    text1: t("edit_profile.toast.error.title"),
                    text2: t("edit_profile.toast.error.load_error"),
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [user, t, currentLanguage]);

    const handleUpdate = async () => {
        const { fname, lname, cityKey, genderKey, lastCityChange } = form;

        if (!fname || !lname || !cityKey || !genderKey) {
            Toast.show({
                type: "error",
                text1: t("edit_profile.toast.error.title"),
                text2: t("edit_profile.toast.error.all_fields_required"),
            });
            return;
        }

        const userData = await getDocument("users", user.uid);
        const currentCityKey = userData?.cityKey || "";
        const isCityChanged = cityKey !== currentCityKey;

        if (isCityChanged && lastCityChange) {
            const now = new Date();
            const lastChangeDate = lastCityChange.toDate();
            const daysSinceLastChange =
                (now - lastChangeDate) / (1000 * 60 * 60 * 24);

            if (daysSinceLastChange < 90) {
                Toast.show({
                    type: "error",
                    text1: t("edit_profile.toast.error.title"),
                    text2: t("edit_profile.toast.error.city_cooldown", {
                        date: cityChangeAvailableDate,
                    }),
                });
                return;
            }
        }

        setIsSubmitting(true);

        try {
            const displayName = `${fname} ${lname.charAt(0)}.`;
            await auth().currentUser.updateProfile({ displayName });
            const updateData = {
                fname,
                lname,
                cityKey,
                genderKey,
                updatedAt: serverTimestamp(),
            };

            if (isCityChanged) {
                updateData.lastCityChange = serverTimestamp();
            }

            await updateDocument("users", user.uid, updateData);

            await refreshUser();
            refreshAllData();
            Toast.show({
                type: "success",
                text1: t("edit_profile.toast.success.title"),
                text2: t("edit_profile.toast.success.update_success"),
            });

            router.back();
        } catch (err) {
            console.error("Error updating profile:", err);
            Toast.show({
                type: "error",
                text1: t("edit_profile.toast.error.title"),
                text2: t("edit_profile.toast.error.update_error"),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCitySelect = (selectedCityName) => {
        const cityData = getCityDropdownData(currentLanguage).find(
            (city) => city.value === selectedCityName
        );

        if (cityData) {
            setForm({ ...form, cityKey: cityData.key });
        }
    };

    const handleGenderSelect = (selectedGenderName) => {
        const genderData = getGenderDropdownData(currentLanguage).find(
            (gender) => gender.value === selectedGenderName
        );

        if (genderData) {
            setForm({ ...form, genderKey: genderData.key });
        }
    };

    const displayCityName = form.cityKey
        ? getCityNameByKey(form.cityKey, currentLanguage)
        : "";

    const displayGenderName = form.genderKey
        ? getGenderNameByKey(form.genderKey, currentLanguage)
        : "";

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-white"}`}
        >
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
                    accessibilityLabel={t("edit_profile.back_button")}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={isDark ? "#FFFFFF" : "black"}
                    />
                </TouchableOpacity>
                <Text
                    className={`text-2xl font-mbold ${
                        isDark ? "text-dark-text-primary" : "text-black"
                    }`}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {t("edit_profile.title")}
                </Text>
            </View>
            {isLoading ? (
                <LoadingIndicator isDark={isDark} />
            ) : (
                <ScrollView
                    className={`flex-1 px-6 ${
                        isDark ? "bg-dark-background" : "bg-white"
                    }`}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 30,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="w-full max-w-md">
                        <Text
                            className={`font-msemibold text-left mb-2 ${
                                isDark ? "text-dark-text-primary" : "text-black"
                            }`}
                        >
                            {t("edit_profile.fields.first_name.label")}{" "}
                            <Text className="text-red-500">*</Text>
                        </Text>
                        <FormField
                            title={t("edit_profile.fields.first_name.label")}
                            placeholder={t(
                                "edit_profile.fields.first_name.placeholder"
                            )}
                            value={form.fname}
                            handleChangeText={(e) =>
                                setForm({ ...form, fname: e })
                            }
                            containerStyle={`mb-4`}
                            isDark={isDark}
                        />

                        <Text
                            className={`font-msemibold text-left mb-2 ${
                                isDark ? "text-dark-text-primary" : "text-black"
                            }`}
                        >
                            {t("edit_profile.fields.last_name.label")}{" "}
                            <Text className="text-red-500">*</Text>
                        </Text>
                        <FormField
                            title={t("edit_profile.fields.last_name.label")}
                            placeholder={t(
                                "edit_profile.fields.last_name.placeholder"
                            )}
                            value={form.lname}
                            handleChangeText={(e) =>
                                setForm({ ...form, lname: e })
                            }
                            containerStyle={`mb-4 `}
                            isDark={isDark}
                        />

                        <Text
                            className={`font-msemibold text-left mb-2 ${
                                isDark ? "text-dark-text-primary" : "text-black"
                            }`}
                        >
                            {t("edit_profile.fields.city.label")}{" "}
                            <Text className="text-red-500">*</Text>
                        </Text>
                        <DropdownField
                            title={t("edit_profile.fields.city.label")}
                            placeholder={t(
                                "edit_profile.fields.city.placeholder"
                            )}
                            value={displayCityName}
                            options={cityOptions}
                            onSelect={handleCitySelect}
                            containerStyle={`mb-4 `}
                            isDark={isDark}
                            disabled={isCityChangeRestricted}
                        />
                        {isCityChangeRestricted && (
                            <Text
                                className={`font-mregular text-sm mb-4 text-red-500 `}
                            >
                                {t(
                                    "edit_profile.fields.city.cooldown_message",
                                    {
                                        date: cityChangeAvailableDate,
                                    }
                                )}
                            </Text>
                        )}

                        <Text
                            className={`font-msemibold text-left mb-2 ${
                                isDark ? "text-dark-text-primary" : "text-black"
                            }`}
                        >
                            {t("edit_profile.fields.gender.label")}{" "}
                            <Text className="text-red-500">*</Text>
                        </Text>
                        <DropdownField
                            title={t("edit_profile.fields.gender.label")}
                            placeholder={t(
                                "edit_profile.fields.gender.placeholder"
                            )}
                            value={displayGenderName}
                            options={genderOptions}
                            onSelect={handleGenderSelect}
                            containerStyle={`mb-6`}
                            isDark={isDark}
                        />

                        <CustomButton
                            title={t("edit_profile.buttons.update")}
                            handlePress={handleUpdate}
                            containerStyles={`rounded-lg py-3 mt-4`}
                            isLoading={isSubmitting}
                            isDark={isDark}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default EditProfile;
