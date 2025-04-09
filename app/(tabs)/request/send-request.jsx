import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import FormField from "../../../components/FormField";

const categories = ["Lighting", "Trash", "Roads", "Green Zones", "Other"];

const SendRequestTab = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [isDataProcessingAgreed, setIsDataProcessingAgreed] = useState(false);

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                flexGrow: 1,
                justifyContent: "space-between",
            }}
        >
            {/* Complaint Title */}
            <Text className="text-black font-msemibold text-left mb-2">
                Title
            </Text>
            <FormField
                title="Title"
                placeholder="Title"
                value={title}
                handleChangeText={setTitle}
                className="bg-ghostwhite rounded-lg p-3 border border-gray-200"
            />

            {/* Problem Description */}
            <Text className="text-black font-msemibold text-left mb-2">
                Description
            </Text>
            <FormField
                title="Description"
                placeholder="Description"
                value={description}
                handleChangeText={setDescription}
                multiline
                numberOfLines={10}
                className="bg-ghostwhite rounded-lg p-3 h-32 border border-gray-200"
            />

            {/* Category */}
            <View className="mb-4">
                <Text className="text-black font-msemibold text-left mb-2">
                    Category
                </Text>
                <View className="flex-row flex-wrap justify-evenly">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setCategory(cat)}
                            className={`py-2 px-3 mb-2 rounded-full border border-gray-200 ${
                                category === cat
                                    ? "bg-primary"
                                    : "bg-ghostwhite"
                            }`}
                            style={{ width: "48%" }}
                        >
                            <Text
                                className={`text-center font-mmedium ${
                                    category === cat
                                        ? "text-white"
                                        : "text-gray-600"
                                }`}
                            >
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Contact Information */}
            <Text className="text-black font-msemibold text-left mb-2">
                Contact
            </Text>
            <FormField
                title="Contact"
                placeholder="Contact phone or email"
                value={contactInfo}
                handleChangeText={setContactInfo}
                className="bg-ghostwhite rounded-lg p-3 border border-gray-200"
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
