import { StyleSheet, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import { useAuth, useAuthContext } from "../../lib/context";
const Profile = () => {
    const { logout } = useAuthContext();
    const handleSignOut = () => {
        logout();
        router.replace("/sign-in");
    };
    return (
        <SafeAreaView className="bg-secondary h-full">
            <View className="w-full flex justify-center items-center h-full px-4">
                <CustomButton
                    title="Sign out"
                    handlePress={handleSignOut}
                    containerStyles="w-full mt-7 mt-10 min-h-[62px]"
                />
            </View>
        </SafeAreaView>
    );
};

export default Profile;
