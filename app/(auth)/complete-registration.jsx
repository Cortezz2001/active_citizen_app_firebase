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

const CompleteRegistration = () => {
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
                text1: "Error",
                text2: "All fields are required",
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
                text1: "Success",
                text2: "Profile completed successfully!",
            });

            router.replace("/home");
        } catch (err) {
            console.error("Error completing profile:", err);
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Could not complete registration.",
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
                text1: "Error",
                text2: "Failed to sign out. Please try again.",
            });
        }
    };

    const genderOptions = ["Male", "Female"];
    const kazakhstanCities = [
        "Almaty",
        "Astana",
        "Shymkent",
        "Karaganda",
        "Aktobe",
        "Taraz",
        "Pavlodar",
        "Ust-Kamenogorsk",
        "Semey",
        "Atyrau",
        "Kyzylorda",
        "Kostanay",
        "Uralsk",
        "Petropavlovsk",
        "Aktau",
        "Temirtau",
        "Turkestan",
        "Kokshetau",
        "Taldykorgan",
        "Ekibastuz",
        "Zhezkazgan",
        "Balkhash",
        "Kentau",
        "Rudny",
        "Zhanaozen",
    ].sort();

    return (
        <SafeAreaView className="flex-1 bg-white ">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 flex-row mb-2">
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="flex-row items-center"
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color="#3b82f6"
                    />
                    <Text className="ml-1 text-primary font-msemibold">
                        Back
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
                    Complete Your Profile
                </Text>
                <View className="flex-1 justify-center">
                    <Text className="text-black font-msemibold text-left mb-2">
                        First Name <Text className="text-red-500">*</Text>
                    </Text>
                    <FormField
                        title="First name"
                        placeholder="Enter your first name"
                        value={form.fname}
                        handleChangeText={(e) => setForm({ ...form, fname: e })}
                        containerStyle="mb-4"
                    />

                    <Text className="text-black font-msemibold text-left mb-2">
                        Last Name <Text className="text-red-500">*</Text>
                    </Text>
                    <FormField
                        title="Last Name"
                        placeholder="Enter your last name"
                        value={form.lname}
                        handleChangeText={(e) => setForm({ ...form, lname: e })}
                        containerStyle="mb-4"
                    />

                    <Text className="text-black font-msemibold text-left mb-2">
                        City <Text className="text-red-500">*</Text>
                    </Text>
                    <DropdownField
                        title="City"
                        placeholder="Select your city"
                        value={form.city}
                        options={kazakhstanCities}
                        onSelect={(city) => setForm({ ...form, city })}
                        containerStyle="mb-4"
                    />

                    <Text className="text-black font-msemibold text-left mb-2">
                        Gender <Text className="text-red-500">*</Text>
                    </Text>
                    <DropdownField
                        title="Gender"
                        placeholder="Select your gender"
                        value={form.gender}
                        options={genderOptions}
                        onSelect={(gender) => setForm({ ...form, gender })}
                        containerStyle="mb-6"
                    />

                    <CustomButton
                        title="Complete Registration"
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
