import React, { useState, useEffect } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import images from "@/constants/images";
import { createContext } from "react";

// Контекст для поиска
export const SearchContext = createContext({
    searchText: "",
    setSearchText: () => {},
});

const HomeLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [searchText, setSearchText] = useState("");

    // Извлекаем текущую вкладку из пути
    const getCurrentTab = () => {
        const path = pathname.split("/").pop();
        return path === "home"
            ? "News"
            : path.charAt(0).toUpperCase() + path.slice(1);
    };
    const activeTab = getCurrentTab();

    // Сбрасываем поиск при смене вкладки
    useEffect(() => {
        setSearchText("");
    }, [pathname]);

    // Функция для перехода между вкладками
    const navigateToTab = (tab) => {
        const tabRoute = tab.toLowerCase();
        router.push(`/home/${tabRoute}`);
    };

    return (
        <SafeAreaView className="bg-secondary flex-1">
            <View className="px-4 pt-4 flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                        <Image
                            source={images.logo}
                            className="w-[65px] h-[65px] mr-2"
                            resizeMode="contain"
                        />
                        <Text className="text-2xl font-mbold">
                            Active Citizen
                        </Text>
                    </View>
                    <TouchableOpacity className="mr-2">
                        <MaterialIcons
                            name="language"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>

                {/* Tab Navigation */}
                <View className="flex-row justify-between mb-4 bg-white rounded-full">
                    {["News", "Events", "Surveys", "Petitions"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => navigateToTab(tab)}
                            className={`flex-1 py-2 rounded-full ${
                                activeTab === tab
                                    ? "bg-primary"
                                    : "bg-transparent"
                            }`}
                        >
                            <Text
                                className={`text-center font-mmedium ${
                                    activeTab === tab
                                        ? "text-white"
                                        : "text-gray-600"
                                }`}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Common Search Bar */}
                <View className="bg-ghostwhite rounded-3xl p-2 mb-4 shadow-md border border-gray-200">
                    <View className="flex-row items-center">
                        <MaterialIcons
                            name="search"
                            size={24}
                            color="gray"
                            style={{ marginLeft: 2 }}
                        />
                        <TextInput
                            placeholder={`Search ${activeTab.toLowerCase()}...`}
                            value={searchText}
                            onChangeText={setSearchText}
                            autoCapitalize="none"
                            autoCorrect={false}
                            className="flex-1 pl-2 font-mregular"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchText("")}>
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color="gray"
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Content Slot with SearchContext Provider */}
                <SearchContext.Provider value={{ searchText, setSearchText }}>
                    <Slot />
                </SearchContext.Provider>
            </View>
        </SafeAreaView>
    );
};

export default HomeLayout;
