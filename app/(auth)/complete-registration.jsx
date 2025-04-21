import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
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
import { useTranslation } from "react-i18next";

const CompleteRegistration = () => {
    const { t } = useTranslation();
    const { user, logout, refreshUser } = useAuthContext();
    const { setDocument } = useFirestore();

    const [form, setForm] = useState({
        fname: "",
        lname: "",
        city: "",
        gender: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleComplete = async () => {
        const { fname, lname, city, gender } = form;

        if (!fname || !lname || !city || !gender) {
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
                city,
                gender,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            await refreshUser();

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

    const genderOptions = [
        t("complete_registration.fields.gender.options.male"),
        t("complete_registration.fields.gender.options.female"),
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
        .map((cityKey) =>
            t(`complete_registration.fields.city.options.${cityKey}`)
        )
        .sort();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 flex-row mb-2">
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="flex-row items-center"
                    accessibilityLabel={t("complete_registration.back_button")}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color="#3b82f6"
                    />
                    <Text className="ml-1 text-primary font-msemibold">
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
                <Text className="text-3xl font-mbold text-black text-center mt-2 mb-10">
                    {t("complete_registration.title")}
                </Text>
                <View className="flex-1 justify-center">
                    <Text className="text-black font-msemibold text-left mb-2">
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
                    />

                    <Text className="text-black font-msemibold text-left mb-2">
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
                    />

                    <Text className="text-black font-msemibold text-left mb-2">
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
                        value={form.city}
                        options={kazakhstanCities}
                        onSelect={(city) => setForm({ ...form, city })}
                        containerStyle="mb-4"
                    />

                    <Text className="text-black font-msemibold text-left mb-2">
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
                        value={form.gender}
                        options={genderOptions}
                        onSelect={(gender) => setForm({ ...form, gender })}
                        containerStyle="mb-6"
                    />

                    <CustomButton
                        title={t("complete_registration.buttons.complete")}
                        handlePress={handleComplete}
                        containerStyles="rounded-lg py-3 bg-primary mt-4"
                        isLoading={isSubmitting}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default CompleteRegistration;
