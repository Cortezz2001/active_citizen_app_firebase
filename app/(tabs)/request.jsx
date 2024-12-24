import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

const Request = () => {
    const [activeTab, setActiveTab] = useState("Send Request");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [isDataProcessingAgreed, setIsDataProcessingAgreed] = useState(false);
    const [searchText, setSearchText] = useState("");

    const categories = ["Lighting", "Trash", "Roads", "Green Zones", "Other"];

    const myRequestsData = [
        {
            id: 1,
            title: "Street light not working",
            date: "15.06.2023",
            status: "In progress",
            statusIcon: "pending",
        },
        {
            id: 2,
            title: "Trash on the playground",
            date: "10.06.2023",
            status: "Rejected",
            statusIcon: "cancel",
        },
        {
            id: 3,
            title: "Pothole on the road",
            date: "05.06.2023",
            status: "Completed",
            statusIcon: "check-circle",
        },
        {
            id: 4,
            title: "Broken bench in the park",
            date: "01.06.2023",
            status: "In progress",
            statusIcon: "pending",
        },
        {
            id: 5,
            title: "Leaking drainpipe",
            date: "25.05.2023",
            status: "Completed",
            statusIcon: "check-circle",
        },
    ];

    const renderSendRequest = () => (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
            }}
        >
            {/* Complaint Title */}
            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                className="bg-white rounded-lg p-3 mb-4 border border-gray-200"
            />

            {/* Problem Description */}
            <TextInput
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={10}
                className="bg-white rounded-lg p-3 mb-4 h-32 border border-gray-200"
            />

            {/* Category */}
            <View className="bg-white rounded-lg p-3 mb-4">
                <Text className="text-gray-500 mb-2">Category</Text>
                <View className="flex-row flex-wrap">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setCategory(cat)}
                            className={`p-2 m-1 rounded-full ${
                                category === cat ? "bg-primary" : "bg-gray-200"
                            }`}
                        >
                            <Text
                                className={
                                    category === cat
                                        ? "text-white"
                                        : "text-black"
                                }
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Contact Information */}
            <TextInput
                placeholder="Contact phone or email"
                value={contactInfo}
                onChangeText={setContactInfo}
                className="bg-white rounded-lg p-3 mb-4 border border-gray-200 "
            />

            <View className="flex-row items-center bg-white p-3 rounded-lg mb-4">
                <Switch
                    value={isDataProcessingAgreed}
                    onValueChange={setIsDataProcessingAgreed}
                    trackColor={{ false: "#767577", true: "#006ffd" }} // Background color when switched on
                    thumbColor={isDataProcessingAgreed ? "#ffffff" : "#f4f3f4"} // Switch thumb color
                />
                <Text className="ml-3">
                    I agree to the processing of my data
                </Text>
            </View>

            {/* Submit Button */}
            <View className="mb-4">
                <TouchableOpacity
                    className="bg-primary p-4 rounded-lg items-center"
                    disabled={!isDataProcessingAgreed}
                >
                    <Text className="text-white font-mbold">Submit</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderMyRequests = () => {
        const filteredRequests = myRequestsData.filter((request) =>
            request.title.toLowerCase().includes(searchText.toLowerCase())
        );

        return filteredRequests.map((request) => (
            <TouchableOpacity
                key={request.id}
                className="bg-white rounded-lg p-4 mb-4 flex-row items-center"
            >
                <View className="flex-1">
                    <Text className="font-mmedium text-lg mb-2">
                        {request.title}
                    </Text>
                    <Text className="text-gray-500">{request.date}</Text>
                </View>
                <View className="flex-row items-center">
                    <MaterialIcons
                        name={
                            request.statusIcon === "pending"
                                ? "pending"
                                : request.statusIcon === "cancel"
                                ? "cancel"
                                : "check-circle"
                        }
                        color={
                            request.statusIcon === "pending"
                                ? "orange"
                                : request.statusIcon === "cancel"
                                ? "red"
                                : "green"
                        }
                        size={24}
                    />
                    <Text className="ml-2">{request.status}</Text>
                </View>
            </TouchableOpacity>
        ));
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

                {activeTab === "Send Request" ? (
                    renderSendRequest()
                ) : (
                    <>
                        {/* Search Bar */}
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
                        {renderMyRequests()}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

export default Request;
