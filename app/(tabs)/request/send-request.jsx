import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import FormField from "../../../components/FormField";
import Toast from "react-native-toast-message";
import { useRouter, useLocalSearchParams } from "expo-router";

// Sample request data (in a real app, this would come from an API/database)
const myRequestsData = [
    {
        id: 1,
        title: "Street light not working",
        date: "15.06.2023",
        status: "In progress",
        description: "The street light at Main St is not functioning.",
        category: "Lighting",
        contactInfo: "john@example.com",
        isDataProcessingAgreed: true,
    },
    {
        id: 2,
        title: "Trash on the playground",
        date: "10.06.2023",
        status: "Rejected",
        description: "There is litter scattered across the playground.",
        category: "Trash",
        contactInfo: "jane@example.com",
        isDataProcessingAgreed: true,
        rejectionReason:
            "This area is not maintained by the city services. Please contact your community management.",
    },
    {
        id: 3,
        title: "Pothole on the road",
        date: "05.06.2023",
        status: "Completed",
        description: "Large pothole on Elm St causing hazards.",
        category: "Roads",
        contactInfo: "bob@example.com",
        isDataProcessingAgreed: true,
    },
    {
        id: 4,
        title: "Broken bench in the park",
        date: "01.06.2023",
        status: "In progress",
        description: "Bench in Central Park is damaged.",
        category: "Other",
        contactInfo: "alice@example.com",
        isDataProcessingAgreed: true,
    },
    {
        id: 5,
        title: "Leaking drainpipe",
        date: "25.05.2023",
        status: "Completed",
        description: "Drainpipe near Oak Ave is leaking.",
        category: "Other",
        contactInfo: "sam@example.com",
        isDataProcessingAgreed: true,
    },
    {
        id: 6,
        title: "Graffiti on public wall",
        date: "20.05.2023",
        status: "Rejected",
        description: "Graffiti on the wall near the library.",
        category: "Other",
        contactInfo: "emma@example.com",
        isDataProcessingAgreed: true,
        rejectionReason:
            "The wall is private property. We've notified the owner about the issue.",
    },
    {
        id: 7,
        title: "New park benches needed",
        date: "18.05.2023",
        status: "Draft",
        description: "Request for additional benches in Riverside Park.",
        category: "Green Zones",
        contactInfo: "mike@example.com",
        isDataProcessingAgreed: false,
    },
    {
        id: 8,
        title: "Sidewalk repair",
        date: "15.05.2023",
        status: "Draft",
        description: "Cracked sidewalk on Pine St needs repair.",
        category: "Roads",
        contactInfo: "lisa@example.com",
        isDataProcessingAgreed: false,
    },
];

const categories = ["Lighting", "Trash", "Roads", "Green Zones", "Other"];

const SendRequestTab = () => {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [isDataProcessingAgreed, setIsDataProcessingAgreed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Load request data if editing
    useEffect(() => {
        if (params.requestId) {
            const request = myRequestsData.find(
                (req) => req.id === parseInt(params.requestId)
            );
            if (request) {
                setTitle(request.title);
                setDescription(request.description);
                setCategory(request.category);
                setContactInfo(request.contactInfo);
                setIsDataProcessingAgreed(request.isDataProcessingAgreed);
                setIsEditing(true);
            }
        }
    }, [params.requestId]);

    // Validation function for form fields
    const validateRequest = () => {
        if (!title.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please enter a title",
            });
            return false;
        }

        if (!description.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please enter a description",
            });
            return false;
        }

        if (!category) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please select a category",
            });
            return false;
        }

        if (!contactInfo.trim()) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "Please enter contact information",
            });
            return false;
        }

        if (!isDataProcessingAgreed) {
            Toast.show({
                type: "error",
                text1: "Error",
                text2: "You must agree to data processing",
            });
            return false;
        }

        return true;
    };

    // Function to handle saving as draft or submitting
    const handleRequest = (asDraft = false) => {
        if (!validateRequest()) return;

        console.log("Handling request", {
            title,
            description,
            category,
            contactInfo,
            isDataProcessingAgreed,
            asDraft,
            isEditing,
        });

        Toast.show({
            type: "success",
            text1: "Success",
            text2: isEditing
                ? asDraft
                    ? "Draft updated successfully"
                    : "Request updated successfully"
                : asDraft
                ? "Request saved as draft"
                : "Request submitted successfully",
        });

        // Reset form after submission (optional, depending on requirements)
        if (!asDraft) {
            setTitle("");
            setDescription("");
            setCategory("");
            setContactInfo("");
            setIsDataProcessingAgreed(false);
            setIsEditing(false);
            router.push("/my-requests"); // Navigate back to requests list
        }
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Complaint Title */}
            <Text className="text-black font-msemibold text-left mb-2">
                Title
            </Text>
            <FormField
                title="Title"
                placeholder="Title"
                value={title}
                handleChangeText={setTitle}
                className="bg-ghostwhite rounded-lg p-2 border border-gray-200"
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
                className="bg-ghostwhite rounded-lg p-2 h-32 border border-gray-200"
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
                className="bg-ghostwhite rounded-lg p-2 border border-gray-200"
            />

            {/* Data Processing Agreement */}
            <View className="flex-row items-center bg-white p-2 rounded-lg mb-4">
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

            {/* Action Buttons */}
            <View className="flex-row justify-between mb-4">
                <TouchableOpacity
                    className="flex-1 mr-2 bg-gray-200 p-4 rounded-lg items-center"
                    onPress={() => handleRequest(true)}
                >
                    <Text className="text-gray-700 font-mmedium">
                        Save as Draft
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 ml-2 p-4 rounded-lg items-center ${
                        isDataProcessingAgreed ? "bg-primary" : "bg-gray-400"
                    }`}
                    onPress={() => handleRequest(false)}
                    disabled={!isDataProcessingAgreed}
                >
                    <Text className="text-white font-mbold">
                        {isEditing ? "Update" : "Submit"}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default SendRequestTab;
