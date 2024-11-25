import Swiper from "react-native-swiper";
import CustomButton from "@/components/CustomButton";
import images from "@/constants/images";
import { router, Redirect } from "expo-router";
import { Text, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAuthContext } from "@/lib/context";

export default function Index() {
    const { user, loading } = useAuthContext();

    // Если пользователь залогинен - сразу редиректим на home
    if (!loading && user) {
        return <Redirect href="/(tabs)/home" />;
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
            >
                {/* Первая страница */}
                <View className="flex-1 justify-center items-center px-4 bg-white">
                    <Image
                        source={images.logo}
                        className="w-[130px] h-[84px] mb-8"
                        resizeMode="contain"
                    />
                    <Text className="text-3xl text-black font-mbold text-center">
                        Welcome!
                    </Text>
                    <Text className="text-sm font-mmedium text-black mt-4 text-center leading-relaxed">
                        This is the first page of the onboarding screen.
                    </Text>
                </View>

                {/* Вторая страница */}
                <View className="flex-1 justify-center items-center px-4 bg-white">
                    <Text className="text-3xl text-black font-mbold text-center">
                        Discover Features
                    </Text>
                    <Text className="text-sm font-mmedium text-black mt-4 text-center leading-relaxed">
                        Swipe to learn more about the app's features.
                    </Text>
                </View>

                {/* Третья страница */}
                <View className="flex-1 justify-center items-center px-4 bg-white">
                    <Text className="text-3xl text-black font-mbold text-center">
                        Get Started
                    </Text>
                    <Text className="text-sm font-mmedium text-black mt-4 text-center leading-relaxed">
                        Ready to dive in? Click below to begin!
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
