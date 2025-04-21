// _layout.jsx
import React, { useState, useEffect } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { createContext } from "react";
import { useTranslation } from "react-i18next";

export const SearchContext = createContext({
    searchText: "",
    setSearchText: () => {},
});

export const FilterContext = createContext({
    showFilterModal: false,
    setShowFilterModal: () => {},
    selectedStatuses: [],
    setSelectedStatuses: () => {},
    startDate: null,
    setStartDate: () => {},
    endDate: null,
    setEndDate: () => {},
});

const RequestLayout = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const [searchText, setSearchText] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const getCurrentTab = () => {
        const path = pathname.split("/").pop();
        return path === "send-request" ? "send_request" : "my_requests";
    };
    const activeTab = getCurrentTab();

    useEffect(() => {
        setSearchText("");
        setSelectedStatuses([]);
        setStartDate(null);
        setEndDate(null); // Reset filters when switching tabs
    }, [pathname]);

    const navigateToTab = (tabId) => {
        const tabRoute =
            tabId === "send_request" ? "send-request" : "my-requests";
        router.push(`/request/${tabRoute}`);
    };

    const tabs = [
        { id: "send_request", label: t("request_layout.tabs.send_request") },
        { id: "my_requests", label: t("request_layout.tabs.my_requests") },
    ];

    return (
        <SafeAreaView className="bg-secondary flex-1">
            <View className="px-4 pt-4 flex-1">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-mbold">
                        {t("request_layout.title")}
                    </Text>
                </View>

                <View className="flex-row justify-between mb-4 bg-white rounded-full">
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => navigateToTab(tab.id)}
                            className={`flex-1 py-2 rounded-full ${
                                activeTab === tab.id
                                    ? "bg-primary"
                                    : "bg-transparent"
                            }`}
                        >
                            <Text
                                className={`text-center font-mmedium ${
                                    activeTab === tab.id
                                        ? "text-white"
                                        : "text-gray-600"
                                }`}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {activeTab === "my_requests" && (
                    <View className="bg-ghostwhite rounded-3xl p-2 mb-4 shadow-md border border-gray-200 flex-row items-center">
                        <MaterialIcons
                            name="search"
                            size={24}
                            color="#9CA3AF"
                        />
                        <TextInput
                            placeholder={t("request_layout.search_placeholder")}
                            value={searchText}
                            onChangeText={setSearchText}
                            className="flex-1 ml-2 font-mregular"
                        />
                        {searchText.length > 0 && (
                            <TouchableOpacity
                                className="mr-2"
                                onPress={() => setSearchText("")}
                            >
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color="#374151"
                                />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            className="mx-1"
                            onPress={() => setShowFilterModal(true)}
                            accessibilityRole="button"
                            accessibilityLabel={
                                selectedStatuses.length > 0 ||
                                startDate ||
                                endDate
                                    ? `${t(
                                          "my_requests.filter_modal.title"
                                      )} ${t(
                                          "my_requests.filter_modal.active"
                                      )}`
                                    : t("my_requests.filter_modal.title")
                            }
                        >
                            <MaterialIcons
                                name="filter-list"
                                size={24}
                                color={
                                    selectedStatuses.length > 0 ||
                                    startDate ||
                                    endDate
                                        ? "#006FFD"
                                        : "#9CA3AF"
                                }
                            />
                        </TouchableOpacity>
                    </View>
                )}

                <SearchContext.Provider value={{ searchText, setSearchText }}>
                    <FilterContext.Provider
                        value={{
                            showFilterModal,
                            setShowFilterModal,
                            selectedStatuses,
                            setSelectedStatuses,
                            startDate,
                            setStartDate,
                            endDate,
                            setEndDate,
                        }}
                    >
                        <Slot />
                    </FilterContext.Provider>
                </SearchContext.Provider>
            </View>
        </SafeAreaView>
    );
};

export default RequestLayout;
