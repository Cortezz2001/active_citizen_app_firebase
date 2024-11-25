import React from "react";
import { TouchableOpacity, Image, Text } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { router } from "expo-router";

const GoogleButton = () => {
    const { signInWithGoogle } = useAuth();

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithGoogle();
            console.log("Sign in success:", result);
            router.replace("/home");
        } catch (error) {
            console.log("Error details:", error);
            Alert.alert(
                "Authentication Error",
                error.message || "Failed to sign in with Google"
            );
        }
    };

    return (
        <TouchableOpacity
            className="w-full mt-3 bg-white border border-gray-300 py-3 rounded-lg flex-row justify-center items-center"
            onPress={handleGoogleSignIn}
        >
            <Image
                source={require("@/assets/icons/google.png")}
                className="w-5 h-5 mr-2"
            />
            <Text className="text-black font-mmedium text-lg">Google</Text>
        </TouchableOpacity>
    );
};

export default GoogleButton;
