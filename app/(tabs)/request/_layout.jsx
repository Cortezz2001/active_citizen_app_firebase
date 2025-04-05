import React, { useState, useEffect } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { createContext } from "react";

// Контекст для поиска
export const SearchContext = createContext({
    searchText: "",
    setSearchText: () => {},
});

const RequestLayout = () => {
    const router = useRouter();
    const pathname = usePathname();

    const [searchText, setSearchText] = useState("");

    // Извлекаем текущую вкладку из пути
    const getCurrentTab = () => {
        const path = pathname.split("/").pop();
        if (path === "send-request") {
            return "Send Request";
        } else if (path === "my-requests") {
            return "My Requests";
        }
        return "Send Request";
    };
    const activeTab = getCurrentTab();

    // Сбрасываем поиск при смене вкладки
    useEffect(() => {
        setSearchText("");
    }, [pathname]);

    // Функция для перехода между вкладками
    const navigateToTab = (tab) => {
        const tabRoute =
            tab === "Send Request" ? "send-request" : "my-requests";
        router.push(`/request/${tabRoute}`);
    };

    return (
        <SafeAreaView className="bg-secondary flex-1">
            <View className="px-4 pt-4 flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-mbold">Requests</Text>
                    <TouchableOpacity>
                        <MaterialIcons
                            name="language"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>

                {/* Tab Navigation */}
                <View className="flex-row justify-between mb-4 bg-white rounded-full p-1">
                    {["Send Request", "My Requests"].map((tab) => (
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

                {/* Search Bar для My Requests */}
                {activeTab === "My Requests" && (
                    <View className="bg-white rounded-lg p-2 mb-4 shadow-md">
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="search"
                                size={24}
                                color="gray"
                            />
                            <TextInput
                                placeholder="Search requests"
                                value={searchText}
                                onChangeText={setSearchText}
                                className="flex-1 ml-2"
                            />
                        </View>
                    </View>
                )}

                {/* Content Slot with SearchContext Provider */}
                <SearchContext.Provider value={{ searchText, setSearchText }}>
                    <Slot />
                </SearchContext.Provider>
            </View>
        </SafeAreaView>
    );
};

export default RequestLayout;
