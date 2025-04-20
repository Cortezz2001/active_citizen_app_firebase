import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import FormField from "../../../components/FormField";
import Toast from "react-native-toast-message";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
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

const categories = ["lighting", "trash", "roads", "green_zones", "other"];

const SendRequestTab = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const params = useLocalSearchParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [isDataProcessingAgreed, setIsDataProcessingAgreed] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (params.requestId) {
            const request = myRequestsData.find(
                (req) => req.id === parseInt(params.requestId)
            );
            if (request) {
                setTitle(request.title);
                setDescription(request.description);
                setCategory(request.category.toLowerCase());
                setContactInfo(request.contactInfo);
                setIsDataProcessingAgreed(request.isDataProcessingAgreed);
                setIsEditing(true);
            }
        }
    }, [params.requestId]);

    const validateRequest = () => {
        if (!title.trim()) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_title"),
            });
            return false;
        }
        if (!description.trim()) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_description"),
            });
            return false;
        }
        if (!category) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_category"),
            });
            return false;
        }
        if (!contactInfo.trim()) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_contact"),
            });
            return false;
        }
        if (!isDataProcessingAgreed) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_data_agreement"),
            });
            return false;
        }
        return true;
    };

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
            text1: t("send_request.toast.success.title"),
            text2: isEditing
                ? asDraft
                    ? t("send_request.toast.success.draft_updated")
                    : t("send_request.toast.success.updated")
                : asDraft
                ? t("send_request.toast.success.saved_as_draft")
                : t("send_request.toast.success.submitted"),
        });

        if (!asDraft) {
            setTitle("");
            setDescription("");
            setCategory("");
            setContactInfo("");
            setIsDataProcessingAgreed(false);
            setIsEditing(false);
            router.push("/request/my-requests");
        }
    };

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-black font-msemibold text-left mb-2">
                {t("send_request.fields.title")}
            </Text>
            <FormField
                title={t("send_request.fields.title")}
                placeholder={t("send_request.fields.title")}
                value={title}
                handleChangeText={setTitle}
                className="bg-ghostwhite rounded-lg p-2 border border-gray-200"
            />

            <Text className="text-black font-msemibold text-left mb-2">
                {t("send_request.fields.description")}
            </Text>
            <FormField
                title={t("send_request.fields.description")}
                placeholder={t("send_request.fields.description")}
                value={description}
                handleChangeText={setDescription}
                multiline
                numberOfLines={10}
                className="bg-ghostwhite rounded-lg p-2 h-32 border border-gray-200"
            />

            <View className="mb-4">
                <Text className="text-black font-msemibold text-left mb-2">
                    {t("send_request.fields.category")}
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
                                {t(`send_request.categories.${cat}`)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <Text className="text-black font-msemibold text-left mb-2">
                {t("send_request.fields.contact")}
            </Text>
            <FormField
                title={t("send_request.fields.contact")}
                placeholder={t("send_request.fields.contact")}
                value={contactInfo}
                handleChangeText={setContactInfo}
                className="bg-ghostwhite rounded-lg p-2 border border-gray-200"
            />

            <View className="flex-row items-center bg-white p-2 rounded-lg mb-4">
                <Switch
                    value={isDataProcessingAgreed}
                    onValueChange={setIsDataProcessingAgreed}
                    trackColor={{ false: "#767577", true: "#006ffd" }}
                    thumbColor={isDataProcessingAgreed ? "#ffffff" : "#f4f3f4"}
                />
                <Text className="ml-3">
                    {t("send_request.data_processing_agreement")}
                </Text>
            </View>

            <View className="flex-row justify-between mb-4">
                <TouchableOpacity
                    className="flex-1 mr-2 bg-gray-200 p-4 rounded-lg items-center justify-center"
                    onPress={() => handleRequest(true)}
                >
                    <Text className="text-gray-700 font-mmedium text-center">
                        {t("send_request.buttons.save_as_draft")}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 ml-2 p-4 rounded-lg items-center justify-center ${
                        isDataProcessingAgreed ? "bg-primary" : "bg-gray-400"
                    }`}
                    onPress={() => handleRequest(false)}
                    disabled={!isDataProcessingAgreed}
                >
                    <Text className="text-white font-mbold text-center">
                        {isEditing
                            ? t("send_request.buttons.update")
                            : t("send_request.buttons.submit")}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default SendRequestTab;
