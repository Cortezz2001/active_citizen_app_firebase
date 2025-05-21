import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import DropdownField from "../../../components/DropdownField";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { firestore } from "../../../lib/firebase";
import Toast from "react-native-toast-message";
import { useAuthContext } from "../../../lib/context";
import { useData } from "../../../lib/datacontext";
import { useRouter } from "expo-router";

const categories = [
    {
        id: "uj7l8cQo1NzvhzfQKr7O",
        name: {
            en: "Infrastructure",
            kz: "Инфрақұрылым",
            ru: "Инфраструктура",
        },
    },
    {
        id: "F7fMlRJ02xWqzwf6vbTl",
        name: { en: "Transport", kz: "Көлік", ru: "Транспорт" },
    },
    {
        id: "4NWS6iYzOUo8QYQ5T6Wh",
        name: { en: "Ecology", kz: "Экология", ru: "Экология" },
    },
    {
        id: "o1Qkp7bsftywM0HMPE9K",
        name: { en: "Education", kz: "Білім", ru: "Образование" },
    },
    {
        id: "7YFanloSft2EHysC6RTs",
        name: {
            en: "Healthcare",
            kz: "Денсаулық сақтау",
            ru: "Здравоохранение",
        },
    },
    {
        id: "rhhlNwHIpJrirppw0lVP",
        name: {
            en: "Social Sphere",
            kz: "Әлеуметтік сала",
            ru: "Социальная сфера",
        },
    },
    {
        id: "A7w1JDqEOudc8JtoFxej",
        name: { en: "Culture", kz: "Мәдениет", ru: "Культура" },
    },
    {
        id: "YOux0PN6COA06UlDASCI",
        name: { en: "Housing and Utilities", kz: "ТКШ", ru: "ЖКХ" },
    },
    {
        id: "qjf29OawC67mOmavWVlH",
        name: { en: "Safety", kz: "Қауіпсіздік", ru: "Безопасность" },
    },
    {
        id: "qDRdPCpSFfiWiFEHG3D0",
        name: { en: "Application", kz: "Қосымша", ru: "Приложение" },
    },
    {
        id: "hwEaCVk6K1V77erNwjOR",
        name: { en: "Other", kz: "Басқа", ru: "Другое" },
    },
];

const RequestCreationPage = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuthContext();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [files, setFiles] = useState([
        {
            name: "image_03.jpg",
            size: "96.47 KB",
            status: "uploading",
            progress: 50,
        },
        { name: "image_02.png", size: "96.47 KB", status: "completed" },
        { name: "image_01.png", size: "87.42 KB", status: "completed" },
    ]);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { fetchRequests } = useData();

    const categoryOptions = categories.map((cat) => cat.name[i18n.language]);
    const categoryIds = categories.map((cat) => cat.id);

    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const handleSaveRequest = async (status) => {
        if (!title) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_title"),
            });
            return;
        }
        if (!description) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_description"),
            });
            return;
        }
        if (!category) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_category"),
            });
            return;
        }
        if (!location) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_location"),
            });
            return;
        }
        if (files.length === 0) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.missing_files"),
            });
            return;
        }

        // Устанавливаем состояние загрузки для соответствующей кнопки
        if (status === "draft") {
            setIsSavingDraft(true);
        } else {
            setIsSubmitting(true);
        }

        try {
            const selectedCategoryIndex = categoryOptions.indexOf(category);
            const categoryId = categoryIds[selectedCategoryIndex];

            const newRequest = {
                title: {
                    en: title,
                    kz: title,
                    ru: title,
                },
                description: {
                    en: description,
                    kz: description,
                    ru: description,
                },
                categoryId: doc(firestore, "requests_categories", categoryId),
                userId: `/users/${user.uid}`,
                status: status,
                address: {
                    street: location || "Not specified",
                    city: "Unknown",
                    postalCode: "",
                    coordinates: { latitude: 0, longitude: 0 },
                },
                mediaFiles: files.length > 0 ? files : [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(
                collection(firestore, "requests"),
                newRequest
            );
            console.log(
                `Request saved with ID: ${docRef.id}, Status: ${status}`
            );
            Toast.show({
                type: "success",
                text1: t("send_request.toast.success.title"),
                text2: t(
                    `send_request.toast.success.${
                        status === "draft" ? "saved_as_draft" : "submitted"
                    }`
                ),
            });
            fetchRequests();
            router.push({
                pathname: "./my-requests",
            });
            setTitle("");
            setDescription("");
            setCategory("");
            setLocation("");
            setFiles([]);
        } catch (error) {
            console.error("Error saving request:", error);
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: `Failed to save request: ${error.message}`,
            });
        } finally {
            // Сбрасываем состояние загрузки для соответствующей кнопки
            if (status === "draft") {
                setIsSavingDraft(false);
            } else {
                setIsSubmitting(false);
            }
        }
    };

    return (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="mb-2 mt-2">
                <Text className="font-msemibold text-black mb-2">
                    {t("send_request.fields.title")}
                    <Text className="text-red-500"> *</Text>
                </Text>
                <FormField
                    placeholder={t("send_request.fields.title")}
                    value={title}
                    handleChangeText={setTitle}
                    multiline={false}
                    numberOfLines={1}
                    containerStyle="bg-ghostwhite"
                />
            </View>

            <View className="mb-2">
                <Text className="font-msemibold text-black mb-2">
                    {t("send_request.fields.description")}
                    <Text className="text-red-500"> *</Text>
                </Text>
                <FormField
                    placeholder={t("send_request.fields.description")}
                    value={description}
                    handleChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    containerStyle="bg-ghostwhite"
                />
            </View>

            <View className="mb-2">
                <Text className="font-msemibold text-black mb-2">
                    {t("send_request.fields.category")}
                    <Text className="text-red-500"> *</Text>
                </Text>
                <DropdownField
                    title={t("send_request.fields.category")}
                    placeholder={t("send_request.fields.select_category")}
                    value={category}
                    options={categoryOptions}
                    onSelect={setCategory}
                    containerStyle="bg-ghostwhite"
                />
            </View>

            <View className="mb-2">
                <Text className="font-msemibold text-black mb-2">
                    {t("send_request.fields.location")}
                    <Text className="text-red-500"> *</Text>
                </Text>
                <FormField
                    placeholder={t("send_request.fields.location_placeholder")}
                    value={location}
                    handleChangeText={setLocation}
                    multiline={false}
                    numberOfLines={1}
                    containerStyle="bg-ghostwhite"
                    editable={false}
                />
            </View>

            <View className="mb-8">
                <Text className="font-msemibold text-black mb-2">
                    {t("send_request.fields.upload_files")}
                    <Text className="text-red-500"> *</Text>
                </Text>
                <TouchableOpacity
                    className="bg-ghostwhite border border-gray-300 rounded-lg p-4 flex-col items-center justify-center h-24"
                    onPress={() =>
                        console.log("File upload placeholder clicked")
                    }
                >
                    <MaterialIcons
                        name="cloud-upload"
                        size={24}
                        color="#006FFD"
                    />
                    <Text className="ml-0 mt-2 text-gray-600 font-mregular">
                        {t("send_request.fields.upload_placeholder")}
                    </Text>
                </TouchableOpacity>

                {/* Отображение списка загружаемых файлов */}
                {files.length > 0 && (
                    <View className="mt-4">
                        {files.map((file, index) => (
                            <View
                                key={index}
                                className="flex-row items-center justify-between bg-ghostwhite border border-gray-200 rounded-lg p-2 mt-1"
                            >
                                <View className="flex-row items-center">
                                    <MaterialIcons
                                        name="insert-drive-file"
                                        size={20}
                                        color="#006FFD"
                                    />
                                    <View className="ml-2">
                                        <Text className="text-black font-mregular">
                                            {file.name}
                                        </Text>
                                        <Text className="text-gray-500 text-xs">
                                            {file.size}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    {file.status === "uploading" && (
                                        <View className="flex-row items-center mr-2">
                                            <Text className="text-gray-600 mr-2">
                                                {t(
                                                    "send_request.fields.uploading"
                                                )}{" "}
                                                - {file.progress}%
                                            </Text>
                                        </View>
                                    )}
                                    <TouchableOpacity
                                        onPress={() => handleRemoveFile(index)}
                                    >
                                        <MaterialIcons
                                            name="close"
                                            size={20}
                                            color="#006FFD"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <View className="flex-row justify-between mb-8">
                <CustomButton
                    title={t("send_request.buttons.save_as_draft")}
                    handlePress={() => handleSaveRequest("draft")}
                    containerStyles="flex-1 mr-2 bg-gray-200 py-3 px-2 rounded-lg"
                    textStyles="text-gray-700 font-mmedium"
                    isLoading={isSavingDraft}
                />
                <CustomButton
                    title={t("send_request.buttons.submit")}
                    handlePress={() => handleSaveRequest("in progress")}
                    containerStyles="flex-1 ml-2 bg-primary py-3 px-2 rounded-lg"
                    textStyles="text-white font-mmedium"
                    isLoading={isSubmitting}
                />
            </View>
        </ScrollView>
    );
};

export default RequestCreationPage;
