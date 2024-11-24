import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Request = () => {
    return (
        <SafeAreaView className="bg-secondary h-full">
            <View className="w-full flex justify-center items-center h-full px-4">
                <Text>Request</Text>
            </View>
        </SafeAreaView>
    );
};

export default Request;

const styles = StyleSheet.create({});
