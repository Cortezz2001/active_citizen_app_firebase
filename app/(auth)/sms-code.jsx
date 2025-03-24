import { View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import CustomButton from "@/components/CustomButton";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { TextInput } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import Toast from "react-native-toast-message";

export default function SmsCode() {
    const { phoneNumber } = useLocalSearchParams();
    const { verifyPhoneCode, sendPhoneVerificationCode } = useAuth();
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

    // const checkProfileAndRedirect = async (user) => {
    //     try {
    //         const userDoc = await getDocument("users", user.uid);
    //         if (!userDoc || !userDoc.fname) {
    //             router.replace("/complete-registration");
    //         } else {
    //             router.replace("/home");
    //         }
    //     } catch (error) {
    //         console.error("Error checking profile:", error);
    //         router.replace("/home");
    //     }
    // };

    const handleCodeChange = (text, index) => {
        // Разрешаем только цифры
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
                text1: "Error",
                text2: "Please enter the 6-digit verification code",
            });
            return;
        }

        setSubmitting(true);

        try {
            await verifyPhoneCode(code);
            router.replace("/complete-registration");
            Toast.show({
                type: "success",
                text1: "Success",
                text2: "Successfully signed in!",
            });
        } catch (error) {
            let message = "Failed to verify the code. Please try again.";
            if (error.message.includes("invalid-verification-code")) {
                message = "Invalid verification code. Please try again.";
            }
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Invalid verification code. Please try again.",
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
                text1: "Success",
                text2: "A new verification code has been sent",
            });
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to resend verification code",
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white justify-center px-6">
            <StatusBar style="dark" />
            <View className="items-center">
                <Text className="text-2xl font-mbold text-black text-center mb-2">
                    Enter confirmation code
                </Text>
                <Text className="text-sm text-gray-500 text-center mb-8">
                    A 6-digit code was sent to{"\n"}
                    {phoneNumber}
                </Text>

                <View className="flex-row justify-around w-full px-4 mb-8">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <View
                            key={index}
                            className="w-11 h-12 border-2 rounded-lg justify-around items-center border-gray-300"
                            style={{
                                borderColor: verificationCode[index]
                                    ? "#3b82f6"
                                    : "#d1d5db",
                            }}
                        >
                            <TextInput
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                className="text-black text-xl font-semibold text-center w-full h-full"
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
                >
                    <Text
                        className={`text-center ${
                            resendDisabled ? "text-gray-400" : "text-blue-500"
                        } font-mmedium`}
                    >
                        {resendDisabled
                            ? `Resend code (${timer}s)`
                            : "Resend code"}
                    </Text>
                </TouchableOpacity>

                <CustomButton
                    title="Continue"
                    handlePress={handleVerify}
                    containerStyles="rounded-lg py-3 bg-primary w-full"
                    isLoading={isSubmitting}
                />
            </View>
        </SafeAreaView>
    );
}
