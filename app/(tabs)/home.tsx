import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
    return (
        <SafeAreaView className="bg-secondary h-full">
            <View className="w-full flex justify-center items-center h-full px-4">
                <Text>Home</Text>
            </View>
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({});
