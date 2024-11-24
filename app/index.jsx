import CustomButton from "@/components/CustomButton";
import images from "@/constants/images";
import { router, Redirect } from "expo-router";
import { ScrollView, Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function Index() {
    return (
        <SafeAreaView className="bg-secondary h-full">
            <ScrollView
                contentContainerStyle={{
                    height: "100%",
                }}
            >
                <View className="w-full flex justify-center items-center h-full px-4">
                    <Image
                        source={images.logo}
                        className="w-[130px] h-[84px] mb-8"
                        resizeMode="contain"
                    />
                    <View className="relative mt-5">
                        <Text className="text-3xl text-black font-mbold text-center">
                            Hello
                        </Text>
                        <Text className="text-sm font-mmedium text-black mt-4 text-center leading-relaxed">
                            World
                        </Text>
                    </View>
                    <CustomButton
                        title="Continue"
                        handlePress={() => router.push("/sign-in")}
                        containerStyles="w-full mt-7 mt-10 min-h-[62px]"
                    />
                </View>
            </ScrollView>
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}
