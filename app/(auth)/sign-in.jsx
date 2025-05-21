import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import PhoneField from "@/components/PhoneField";
import GoogleButton from "@/components/GoogleButton";
import { useAuth } from "@/hooks/useAuth";
import Toast from "react-native-toast-message";
import { useFirestore } from "../../hooks/useFirestore";
import { useTranslation } from "react-i18next";

export default function SignIn() {
    const { t } = useTranslation();
    const { sendPhoneVerificationCode, signInWithGoogle } = useAuth();
    const [isSubmitting, setSubmitting] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const { getDocument } = useFirestore();

    const checkProfileAndRedirect = async (user) => {
        try {
            const userDoc = await getDocument("users", user.uid);
            if (!userDoc || !userDoc.fname) {
                router.replace("/complete-registration");
            } else {
                router.replace("/home");
            }
        } catch (error) {
            console.error("Error checking profile:", error);
            router.replace("/home");
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle();
            console.log("Sign in success:", result);
            if (result) {
                await checkProfileAndRedirect(result.user);
                Toast.show({
                    type: "success",
                    text1: t("sign_in.toast.success.title"),
                    text2: t("sign_in.toast.success.message"),
                });
            } else {
                Toast.show({
                    type: "error",
                    text1: t("sign_in.toast.error.title"),
                    text2: t("sign_in.toast.error.no_user_data"),
                });
            }
        } catch (error) {
            console.log("Error details:", error);
            Toast.show({
                type: "error",
                text1: t("sign_in.toast.error.authentication_error"),
                text2:
                    error.message ||
                    t("sign_in.toast.error.failed_google_sign_in"),
            });
        }
    };

    const handleSignIn = async () => {
        if (!phoneNumber) {
            Toast.show({
                type: "error",
                text1: t("sign_in.toast.error.title"),
                text2: t("sign_in.toast.error.no_phone_number"),
            });
            return;
        }

        // Basic phone validation
        const phoneRegex = /^\+[0-9]{10,15}$/;
        if (!phoneRegex.test(phoneNumber)) {
            Toast.show({
                type: "error",
                text1: t("sign_in.toast.error.title"),
                text2: t("sign_in.toast.error.invalid_phone_number"),
            });
            return;
        }

        setSubmitting(true);

        try {
            await sendPhoneVerificationCode(phoneNumber);
            router.push({
                pathname: "/sms-code",
                params: { phoneNumber },
            });
        } catch (error) {
            let message = t("sign_in.toast.error.general_error");
            if (error.message.includes("invalid-phone-number")) {
                message = t("sign_in.toast.error.invalid_phone_format");
            }
            Toast.show({
                type: "error",
                text1: t("sign_in.toast.error.title"),
                text2: message,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center px-6">
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                }}
            >
                <Text className="text-3xl font-mbold text-black text-center mb-8">
                    {t("sign_in.title")}
                </Text>

                <Text className="text-black font-msemibold text-left mb-2">
                    {t("sign_in.fields.phone_number.label")}
                </Text>
                <PhoneField
                    value={phoneNumber}
                    handleChangeText={setPhoneNumber}
                    containerStyle="mb-8"
                />

                <CustomButton
                    title={t("sign_in.buttons.login")}
                    handlePress={handleSignIn}
                    containerStyles="rounded-lg py-3 mb-6 bg-primary"
                    textStyles="text-lg"
                    isLoading={isSubmitting}
                />

                <View className="flex-row items-center justify-center mb-6 mt-3">
                    <View className="flex-1 h-[1px] bg-gray-300" />
                    <Text className="text-gray-500 px-2 font-mmedium">
                        {t("sign_in.divider")}
                    </Text>
                    <View className="flex-1 h-[1px] bg-gray-300" />
                </View>
                <GoogleButton onPress={handleGoogleSignIn} />
            </ScrollView>
        </SafeAreaView>
    );
}
