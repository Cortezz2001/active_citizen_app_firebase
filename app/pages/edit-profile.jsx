import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
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
import LoadingIndicator from "../../components/LoadingIndicator";
import { useTranslation } from "react-i18next";

const EditProfile = () => {
    const { t } = useTranslation();
    const { user, refreshUser } = useAuthContext();
    const { getDocument, updateDocument } = useFirestore();

    const [form, setForm] = useState({
        fname: "",
        lname: "",
        city: "",
        gender: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (user && user.uid) {
                    const userData = await getDocument("users", user.uid);
                    if (userData) {
                        setForm({
                            fname: userData.fname || "",
                            lname: userData.lname || "",
                            city: userData.city || "",
                            gender: userData.gender || "",
                        });
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
    }, [user, t]);

    const handleUpdate = async () => {
        const { fname, lname, city, gender } = form;

        if (!fname || !lname || !city || !gender) {
            Toast.show({
                type: "error",
                text1: t("edit_profile.toast.error.title"),
                text2: t("edit_profile.toast.error.all_fields_required"),
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const displayName = `${fname} ${lname.charAt(0)}.`;
            await auth().currentUser.updateProfile({ displayName });
            await updateDocument("users", user.uid, {
                fname,
                lname,
                city,
                gender,
                updatedAt: serverTimestamp(),
            });

            await refreshUser();

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

    const genderOptions = [
        t("edit_profile.fields.gender.options.male"),
        t("edit_profile.fields.gender.options.female"),
    ];
    const kazakhstanCities = [
        "almaty",
        "astana",
        "shymkent",
        "karaganda",
        "aktobe",
        "taraz",
        "pavlodar",
        "ust_kamenogorsk",
        "semey",
        "atyrau",
        "kyzylorda",
        "kostanay",
        "uralsk",
        "petropavlovsk",
        "aktau",
        "temirtau",
        "turkestan",
        "kokshetau",
        "taldykorgan",
        "ekibastuz",
        "zhezkazgan",
        "balkhash",
        "kentau",
        "rudny",
        "zhanaozen",
    ]
        .map((cityKey) => t(`edit_profile.fields.city.options.${cityKey}`))
        .sort();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                    accessibilityLabel={t("edit_profile.back_button")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text
                    className="text-2xl font-mbold text-black"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {t("edit_profile.title")}
                </Text>
            </View>

            {isLoading ? (
                <LoadingIndicator />
            ) : (
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 24,
                        paddingVertical: 30,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <View className="w-full max-w-md">
                        <Text className="text-black font-msemibold text-left mb-2">
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
                            containerStyle="mb-4 bg-ghostwhite"
                        />

                        <Text className="text-black font-msemibold text-left mb-2">
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
                            containerStyle="mb-4 bg-ghostwhite"
                        />

                        <Text className="text-black font-msemibold text-left mb-2">
                            {t("edit_profile.fields.city.label")}{" "}
                            <Text className="text-red-500">*</Text>
                        </Text>
                        <DropdownField
                            title={t("edit_profile.fields.city.label")}
                            placeholder={t(
                                "edit_profile.fields.city.placeholder"
                            )}
                            value={form.city}
                            options={kazakhstanCities}
                            onSelect={(city) => setForm({ ...form, city })}
                            containerStyle="mb-4 bg-ghostwhite"
                        />

                        <Text className="text-black font-msemibold text-left mb-2">
                            {t("edit_profile.fields.gender.label")}{" "}
                            <Text className="text-red-500">*</Text>
                        </Text>
                        <DropdownField
                            title={t("edit_profile.fields.gender.label")}
                            placeholder={t(
                                "edit_profile.fields.gender.placeholder"
                            )}
                            value={form.gender}
                            options={genderOptions}
                            onSelect={(gender) => setForm({ ...form, gender })}
                            containerStyle="mb-6 bg-ghostwhite"
                        />

                        <CustomButton
                            title={t("edit_profile.buttons.update")}
                            handlePress={handleUpdate}
                            containerStyles="rounded-lg py-3 bg-primary mt-4"
                            isLoading={isSubmitting}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default EditProfile;
