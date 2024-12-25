import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import images from "@/constants/images";

const Home = () => {
    const [activeTab, setActiveTab] = useState("News");
    const [searchText, setSearchText] = useState("");
    const newsData = [
        {
            id: 1,
            title: "City park renovation starts next month",
            image: "https://picsum.photos/300/200",
        },
        {
            id: 2,
            title: "New public transport routes announced",
            image: "https://picsum.photos/300/200",
        },
        {
            id: 3,
            title: "City's new waste management initiative",
            image: "https://picsum.photos/300/200",
        },
        {
            id: 4,
            title: "Public health campaign launches in the city",
            image: "https://picsum.photos/300/200",
        },
        {
            id: 5,
            title: "City's new bike-sharing program to launch next month",
            image: "https://picsum.photos/300/200",
        },
    ];

    const eventsData = [
        {
            id: 1,
            title: "Community Cleanup",
            date: "June 15",
            image: "https://picsum.photos/300/200",
        },
        {
            id: 2,
            title: "Local Festival",
            date: "July 20",
            image: "https://picsum.photos/300/200",
        },
        {
            id: 3,
            title: "Charity Run for Education",
            date: "August 10",
            image: "https://picsum.photos/300/200",
        },
        {
            id: 4,
            title: "Neighborhood Gardening Workshop",
            date: "September 5",
            image: "https://picsum.photos/300/200",
        },
        {
            id: 5,
            title: "Youth Volunteer Training",
            date: "October 12",
            image: "https://picsum.photos/300/200",
        },
    ];

    const surveysData = [
        { id: 1, title: "City Transportation Survey", votes: 256 },
        { id: 2, title: "Park Improvement Feedback", votes: 189 },
        { id: 3, title: "New Housing Development Survey", votes: 342 },
        { id: 4, title: "Recycling Program Feedback", votes: 421 },
        { id: 5, title: "Public Safety Satisfaction Survey", votes: 678 },
    ];

    const petitionsData = [
        { id: 1, title: "Green City Initiative", supporters: 1500 },
        { id: 2, title: "Local School Funding", supporters: 987 },
        { id: 3, title: "Affordable Housing for All", supporters: 2345 },
        { id: 4, title: "Clean Air Campaign", supporters: 1189 },
        { id: 5, title: "Public Parks Accessibility", supporters: 1750 },
    ];

    const getFilteredData = () => {
        const search = searchText.toLowerCase();
        switch (activeTab) {
            case "News":
                return newsData.filter((item) =>
                    item.title.toLowerCase().includes(search)
                );
            case "Events":
                return eventsData.filter(
                    (item) =>
                        item.title.toLowerCase().includes(search) ||
                        item.date.toLowerCase().includes(search)
                );
            case "Surveys":
                return surveysData.filter((item) =>
                    item.title.toLowerCase().includes(search)
                );
            case "Petitions":
                return petitionsData.filter((item) =>
                    item.title.toLowerCase().includes(search)
                );
            default:
                return [];
        }
    };

    const EmptyStateMessage = () => (
        <View className="flex-1 items-center justify-center py-10   bg-secondary">
            <MaterialIcons name="search-off" size={64} color="#9CA3AF" />
            <Text className="text-gray-400 text-lg font-mmedium mt-4 text-center">
                No {activeTab.toLowerCase()} found for "{searchText}"
            </Text>
            <Text className="text-gray-400 mt-2 text-center">
                Try adjusting your search terms
            </Text>
        </View>
    );

    const renderContent = () => {
        const filteredData = getFilteredData();

        if (searchText && filteredData.length === 0) {
            return <EmptyStateMessage />;
        }

        switch (activeTab) {
            case "News":
                return filteredData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="bg-white rounded-lg mb-4 shadow-md"
                    >
                        <Image
                            source={{ uri: item.image }}
                            className="w-full h-48 rounded-t-lg"
                        />
                        <View className="p-4">
                            <Text className="font-mmedium text-lg">
                                {item.title}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ));
            case "Events":
                return filteredData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="bg-white rounded-lg mb-4 shadow-md flex-row items-center"
                    >
                        <Image
                            source={{ uri: item.image }}
                            className="w-24 h-24 rounded-l-lg"
                        />
                        <View className="p-4 flex-1">
                            <Text className="font-mmedium text-lg">
                                {item.title}
                            </Text>
                            <Text className="text-gray-500 font-mmedium">
                                {item.date}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ));
            case "Surveys":
                return filteredData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="bg-white rounded-lg mb-4 p-4 shadow-md"
                    >
                        <Text className="font-mmedium text-lg mb-2">
                            {item.title}
                        </Text>
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="how-to-vote"
                                size={24}
                                color="#4CAF50"
                            />
                            <Text className="ml-2 text-gray-600 font-mmedium">
                                {item.votes} votes
                            </Text>
                        </View>
                    </TouchableOpacity>
                ));
            case "Petitions":
                return filteredData.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="bg-white rounded-lg mb-4 p-4 shadow-md"
                    >
                        <Text className="font-mmedium text-lg mb-2">
                            {item.title}
                        </Text>
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="people"
                                size={24}
                                color="#2196F3"
                            />
                            <Text className="ml-2 text-gray-600 font-mmedium">
                                {item.supporters} supporters
                            </Text>
                        </View>
                    </TouchableOpacity>
                ));
        }
    };

    const renderCreateButton = () => {
        if (activeTab === "Surveys" || activeTab === "Petitions") {
            return (
                <TouchableOpacity className="absolute bottom-5 right-4 bg-primary rounded-full w-14 h-14 items-center justify-center shadow-lg">
                    <MaterialIcons name="add" size={30} color="white" />
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <SafeAreaView className="bg-secondary flex-1">
            <View className="px-4 pt-4 flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center mb-2">
                    <View className="flex-row items-center">
                        <Image
                            source={images.logo} // Логотип
                            className="w-[65px] h-[65px] mr-2" // Размер логотипа и отступ
                            resizeMode="contain"
                        />
                        <Text className="text-2xl font-mbold">
                            Active Citizen
                        </Text>
                    </View>
                    <TouchableOpacity className=" mr-2">
                        <MaterialIcons
                            name="language"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>

                {/* Tab Navigation */}
                <View className="flex-row justify-between mb-4 bg-white rounded-full p-1">
                    {["News", "Events", "Surveys", "Petitions"].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
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

                {/* Search Bar */}
                <View className="bg-white rounded-lg p-2 mb-4 shadow-md">
                    <View className="flex-row items-center">
                        <MaterialIcons
                            name="search"
                            size={24}
                            color="gray"
                            className="mr-2"
                        />
                        <TextInput
                            placeholder={`Search ${activeTab.toLowerCase()}...`}
                            value={searchText}
                            onChangeText={setSearchText}
                            autoCapitalize="none"
                            autoCorrect={false}
                            className="flex-1 pl-2"
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

                {/* Content Scroll View */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1"
                >
                    {renderContent()}
                </ScrollView>

                {/* Create Button */}
                {renderCreateButton()}
            </View>
        </SafeAreaView>
    );
};

export default Home;
