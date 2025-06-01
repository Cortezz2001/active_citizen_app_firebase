import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { TextInput } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/themeContext";

export default function SmsCode() {
    const { t } = useTranslation();
    const { phoneNumber } = useLocalSearchParams();
    const { verifyPhoneCode, sendPhoneVerificationCode, hasProfile, user } =
        useAuth();
    const [isSubmitting, setSubmitting] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [timer, setTimer] = useState(60);
    const [verificationCode, setVerificationCode] = useState([
        "",
        "",
        "",
        "",
        "",
        "",
    ]);
    const inputRefs = useRef([]);
    const { isDark } = useTheme();
    const [phoneVerificationResult, setPhoneVerificationResult] =
        useState(null);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }

        const interval = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(interval);
                    setResendDisabled(false);
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (phoneVerificationResult && user && hasProfile !== null) {
            console.log("Redirecting based on hasProfile:", hasProfile);
            if (hasProfile === false) {
                router.replace("/complete-registration");
            } else {
                router.replace("/home");
                setTimeout(() => {
                    Toast.show({
                        type: "success",
                        text1: t("sms_code.toast.success.title"),
                        text2: t("sms_code.toast.success.verified"),
                    });
                }, 500);
            }
            setPhoneVerificationResult(null); // Reset after handling
        }
    }, [user, hasProfile, phoneVerificationResult]);

    const handleCodeChange = (text, index) => {
        // Allow only digits
        if (/^[0-9]*$/.test(text)) {
            const newCode = [...verificationCode];
            newCode[index] = text;
            setVerificationCode(newCode);

            if (text && index < 5 && inputRefs.current[index + 1]) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyPress = (e, index) => {
        if (
            e.nativeEvent.key === "Backspace" &&
            !verificationCode[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = async () => {
        const code = verificationCode.join("");

        if (code.length !== 6) {
            Toast.show({
                type: "error",
                text1: t("sms_code.toast.error.title"),
                text2: t("sms_code.toast.error.incomplete_code"),
            });
            return;
        }

        setSubmitting(true);

        try {
            const result = await verifyPhoneCode(code);
            setPhoneVerificationResult(result);
        } catch (error) {
            let message = t("sms_code.toast.error.invalid_code");
            if (error.message.includes("invalid-verification-code")) {
                message = t("sms_code.toast.error.invalid_code");
            }
            Toast.show({
                type: "error",
                text1: t("sms_code.toast.error.title"),
                text2: message,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleResend = async () => {
        try {
            await sendPhoneVerificationCode(phoneNumber);
            setResendDisabled(true);
            setTimer(60);

            const interval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(interval);
                        setResendDisabled(false);
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            Toast.show({
                type: "success",
                text1: t("sms_code.toast.success.title"),
                text2: t("sms_code.toast.success.code_sent"),
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: t("sms_code.toast.error.title"),
                text2: t("sms_code.toast.error.resend_failed"),
            });
        }
    };

    return (
        <SafeAreaView
            className={`flex-1 justify-center px-6 ${
                isDark ? "bg-dark-background" : "bg-white"
            }`}
        >
            <View className="items-center">
                <Text
                    className={`text-2xl font-mbold text-center mb-2 ${
                        isDark ? "text-dark-text-primary" : "text-black"
                    }`}
                >
                    {t("sms_code.title")}
                </Text>
                <Text
                    className={`text-sm text-center mb-8 ${
                        isDark ? "text-dark-text-secondary" : "text-gray-500"
                    }`}
                >
                    {t("sms_code.instruction")} {"\n"}
                    {phoneNumber}
                </Text>

                <View className="flex-row justify-around w-full px-4 mb-8">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <View
                            key={index}
                            className={`w-11 h-12 border-2 rounded-lg justify-around items-center ${
                                isDark ? "border-gray-600" : "border-gray-300"
                            }`}
                            style={{
                                borderColor: verificationCode[index]
                                    ? isDark
                                        ? "#0066E6"
                                        : "#3b82f6"
                                    : isDark
                                    ? "#4B5563"
                                    : "#d1d5db",
                            }}
                        >
                            <TextInput
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                className={`text-xl font-semibold text-center w-full h-full ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-black"
                                }`}
                                maxLength={1}
                                keyboardType="number-pad"
                                value={verificationCode[index]}
                                onChangeText={(text) =>
                                    handleCodeChange(text, index)
                                }
                                onKeyPress={(e) => handleKeyPress(e, index)}
                            />
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={handleResend}
                    disabled={resendDisabled}
                    className="mb-8"
                    accessibilityLabel={
                        resendDisabled
                            ? t("sms_code.resend.disabled", { timer })
                            : t("sms_code.resend.enabled")
                    }
                >
                    <Text
                        className={`text-center font-mmedium ${
                            resendDisabled
                                ? isDark
                                    ? "text-gray-500"
                                    : "text-gray-400"
                                : isDark
                                ? "text-dark-primary"
                                : "text-blue-500"
                        }`}
                    >
                        {resendDisabled
                            ? t("sms_code.resend.disabled", { timer })
                            : t("sms_code.resend.enabled")}
                    </Text>
                </TouchableOpacity>

                <CustomButton
                    title={t("sms_code.buttons.continue")}
                    handlePress={handleVerify}
                    containerStyles={`rounded-lg py-3 w-full`}
                    isLoading={isSubmitting}
                    isDark={isDark}
                />
            </View>
        </SafeAreaView>
    );
}
6;
