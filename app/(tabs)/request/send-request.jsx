import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Switch,
} from "react-native";

const categories = ["Lighting", "Trash", "Roads", "Green Zones", "Other"];

const SendRequestTab = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [isDataProcessingAgreed, setIsDataProcessingAgreed] = useState(false);

    return (
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
                className="bg-white rounded-lg p-3 mb-4 border border-gray-200"
            />

            <View className="flex-row items-center bg-white p-3 rounded-lg mb-4">
                <Switch
                    value={isDataProcessingAgreed}
                    onValueChange={setIsDataProcessingAgreed}
                    trackColor={{ false: "#767577", true: "#006ffd" }}
                    thumbColor={isDataProcessingAgreed ? "#ffffff" : "#f4f3f4"}
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
};

export default SendRequestTab;
