import { Text, View, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import FormField from "@/components/FormField";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ScrollView } from "react-native";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
const SignUp = () => {
    const { signUp } = useAuth();
    const [isSubmitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    const handleSignUp = async () => {
        const { name, email, password, confirmPassword } = form;

        if (!name || !email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert("Error", "Please enter a valid email");
            return;
        }

        if (password.length < 6) {
            Alert.alert(
                "Error",
                "Password should be at least 6 characters long"
            );
            return;
        }

        setSubmitting(true);

        try {
            await signUp(email, password, name);
            Alert.alert("Success", "Account created successfully!");
            router.replace("/home");
        } catch (error) {
            let message = "An error occurred during registration";
            if (error.message.includes("email-already-in-use")) {
                message =
                    "This email is already registered. Please use a different email.";
            }
            Alert.alert("Error", message);
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
                <Text className="text-3xl font-mbold text-black text-center mb-2">
                    Sign up
                </Text>
                <Text className="text-gray-500 text-center mb-8">
                    Create an account to get started
                </Text>

                <Text className="text-black font-msemibold text-left mb-2">
                    Name
                </Text>
                <FormField
                    title="Name"
                    placeholder="Name"
                    value={form.name}
                    handleChangeText={(e) => setForm({ ...form, name: e })}
                />

                <Text className="text-black font-msemibold text-left mb-2">
                    Email Address
                </Text>
                <FormField
                    title="Email"
                    placeholder="name@email.com"
                    value={form.email}
                    handleChangeText={(e) => setForm({ ...form, email: e })}
                    keyboardType="email-address"
                />

                <Text className="text-black font-msemibold text-left mb-2">
                    Password
                </Text>
                <FormField
                    title="Password"
                    placeholder="Create a password"
                    value={form.password}
                    handleChangeText={(e) => setForm({ ...form, password: e })}
                />

                <FormField
                    title="Password"
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    handleChangeText={(e) =>
                        setForm({ ...form, confirmPassword: e })
                    }
                    containerStyle="mb-8"
                />

                <CustomButton
                    title="Sign up"
                    handlePress={handleSignUp}
                    containerStyles="rounded-lg py-3 bg-primary"
                    isLoading={isSubmitting}
                />
                <View className="flex-row justify-center mb-4 mt-6">
                    <Text className="text-gray-500 font-mmedium">
                        Have an account already?{" "}
                    </Text>
                    <TouchableOpacity>
                        <Link
                            href="/sign-in"
                            className="text-blue-500 font-mmedium"
                        >
                            Sign in
                        </Link>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SignUp;
