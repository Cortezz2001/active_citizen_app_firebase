import Swiper from "react-native-swiper";
import CustomButton from "@/components/CustomButton";
import { router, Redirect } from "expo-router";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthContext } from "@/lib/context";
import LottieView from "lottie-react-native";
import { MaterialIcons } from "@expo/vector-icons";
import LanguageSelector from "../components/LanguageSelector";
import { useRef } from "react";

export default function Index() {
    const { user, loading, hasProfile } = useAuthContext();
    const swiperRef = useRef(null);
    // Если пользователь залогинен - сразу редиректим на home
    if (user && hasProfile && !loading) {
        return <Redirect href="/(tabs)/home" />;
    }
    if (user && hasProfile === false) {
        return <Redirect href="/complete-registration" />;
    }

    // Если все еще идет загрузка - возвращаем null
    if (loading) {
        return null;
    }

    // Если пользователь не залогинен - показываем стартовый экран
    return (
        <SafeAreaView className="bg-secondary h-full">
            <StatusBar style="dark" />
            <Swiper
                loop={false} // Отключаем бесконечный свайп
                dot={<View className="w-2 h-2 rounded-full bg-gray-300 mx-1" />}
                activeDotStyle={
                    <View className="w-2 h-2 rounded-full bg-primary mx-1" />
                } // Активная точка
                showsButtons={false} // Кнопки "влево/вправо" не отображаются
                ref={swiperRef}
            >
                {/* Первая страница */}
                <View className="flex-1 justify-center items-center px-4 bg-white">
                    <View className="absolute top-4 right-4 z-10">
                        <LanguageSelector />
                    </View>

                    <LottieView
                        source={require("../assets/animations/welcome_logo.json")}
                        autoPlay
                        loop
                        style={{ width: 300, height: 230, marginBottom: 32 }}
                    />
                    <Text className="text-3xl text-black font-mbold text-center">
                        Welcome to Active Citizen!
                    </Text>
                    <Text className="text-sm font-mmedium text-black mt-4 text-center leading-relaxed">
                        Your platform for active civic participation and
                        community engagement
                    </Text>
                    <View className="px-6 pt-10 flex-row mb-2">
                        <TouchableOpacity
                            onPress={() => swiperRef.current.scrollTo(5)}
                            className="flex-row items-center"
                        >
                            <Text className="ml-1 text-primary font-msemibold">
                                Skip
                            </Text>
                            <MaterialIcons
                                name="arrow-forward"
                                size={16}
                                color="#3b82f6"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Вторая страница */}
                <View className="flex-1 justify-center items-center px-6 bg-white">
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("@/assets/animations/report.json")} // Replace with your animation
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>

                    <Text className="text-2xl text-black font-mbold text-center">
                        Report Issues
                    </Text>
                    <Text className="text-sm font-mmedium text-gray-700 mt-3 text-center leading-relaxed">
                        Spotted a broken bench or uncleared snow? Submit a
                        request and the city will solve the problem
                    </Text>
                </View>

                {/* Третья страница */}
                <View className="flex-1 justify-center items-center px-6 bg-white">
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("../assets/animations/news.json")} // Replace with your animation
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>

                    <Text className="text-2xl text-black font-mbold text-center">
                        City News
                    </Text>
                    <Text className="text-sm font-mmedium text-gray-700 mt-3 text-center leading-relaxed">
                        Stay informed about the latest events, projects, and
                        initiatives in your city
                    </Text>
                </View>

                {/* Четвертая страница */}
                <View className="flex-1 justify-center items-center px-6 bg-white">
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("../assets/animations/join-community.json")} // Replace with your animation
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>

                    <Text className="text-2xl text-black font-mbold text-center">
                        Join Community Events
                    </Text>
                    <Text className="text-sm font-mmedium text-gray-700 mt-3 text-center leading-relaxed">
                        Attend events, participate in surveys and petitions —
                        your involvement matters!
                    </Text>
                </View>

                {/* Пятая страница */}
                <View className="flex-1 justify-center items-center px-6 bg-white">
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("../assets/animations/vote.json")} // Replace with your animation
                            autoPlay
                            loop
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>
                    <Text className="text-2xl text-black font-mbold text-center">
                        Vote & Influence
                    </Text>
                    <Text className="text-sm font-mmedium text-gray-700 mt-3 text-center leading-relaxed">
                        Vote on important decisions for the city and propose
                        your own ideas
                    </Text>
                </View>

                {/*  Шестая страница */}
                <View className="flex-1 justify-center items-center px-4 bg-white">
                    <View className="w-full h-64 mb-6">
                        <LottieView
                            source={require("@/assets/animations/login.json")} // Replace with your animation
                            style={{ width: "100%", height: "100%" }}
                        />
                    </View>
                    <Text className="text-3xl text-black font-mbold text-center">
                        Get Started
                    </Text>
                    <Text className="text-sm font-mmedium text-black mt-4 text-center leading-relaxed">
                        Join your community and help shape the future of your
                        city! Click below to begin!
                    </Text>
                    <CustomButton
                        title="Continue"
                        handlePress={() => router.push("/sign-in")}
                        containerStyles="w-full mt-7 mt-10 min-h-[62px] bg-primary"
                    />
                </View>
            </Swiper>
        </SafeAreaView>
    );
}
