import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import DropdownField from "../../../components/DropdownField";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../../lib/firebase";
import Toast from "react-native-toast-message";
import { useAuthContext } from "../../../lib/context";
import { useData } from "../../../lib/datacontext";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

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

// Function to format file size
const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const RequestCreationPage = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuthContext();
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [files, setFiles] = useState([]);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { fetchRequests } = useData();

    const categoryOptions = categories.map((cat) => cat.name[i18n.language]);
    const categoryIds = categories.map((cat) => cat.id);

    // Function to pick files from device
    const pickFiles = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["image/*", "video/*"],
                multiple: true,
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                console.log("Document picking was cancelled");
                return;
            }

            // Add new files to the list with uploading status
            const newFiles = result.assets.map((asset) => ({
                uri: asset.uri,
                name: asset.name,
                size: formatFileSize(asset.size),
                mimeType: asset.mimeType,
                status: "queued",
                progress: 0,
            }));

            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
        } catch (error) {
            console.error("Error picking documents:", error);
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.file_picking_failed"),
            });
        }
    };

    // Function to handle file removal
    const handleRemoveFile = (index) => {
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    // Function to upload a single file
    const uploadFile = async (file, requestId) => {
        // Update file status to uploading
        setFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            const fileIndex = updatedFiles.findIndex((f) => f.uri === file.uri);
            if (fileIndex !== -1) {
                updatedFiles[fileIndex] = {
                    ...updatedFiles[fileIndex],
                    status: "uploading",
                    progress: 0,
                };
            }
            return updatedFiles;
        });

        try {
            // Create reference for storing the file
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(
                storage,
                `requests/${requestId}/${fileName}`
            );

            // For React Native, we can directly use the file URI with fetch
            const response = await fetch(file.uri);
            const blob = await response.blob();

            // Create upload task
            const uploadTask = uploadBytesResumable(storageRef, blob, {
                contentType: file.mimeType,
            });

            // Monitor progress
            return new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                                100
                        );

                        // Update file with progress
                        setFiles((prevFiles) => {
                            const updatedFiles = [...prevFiles];
                            const fileIndex = updatedFiles.findIndex(
                                (f) => f.uri === file.uri
                            );
                            if (fileIndex !== -1) {
                                updatedFiles[fileIndex] = {
                                    ...updatedFiles[fileIndex],
                                    progress,
                                };
                            }
                            return updatedFiles;
                        });
                    },
                    (error) => {
                        // Update file status to error
                        setFiles((prevFiles) => {
                            const updatedFiles = [...prevFiles];
                            const fileIndex = updatedFiles.findIndex(
                                (f) => f.uri === file.uri
                            );
                            if (fileIndex !== -1) {
                                updatedFiles[fileIndex] = {
                                    ...updatedFiles[fileIndex],
                                    status: "error",
                                };
                            }
                            return updatedFiles;
                        });
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(
                                uploadTask.snapshot.ref
                            );

                            // Update file status to completed with download URL
                            setFiles((prevFiles) => {
                                const updatedFiles = [...prevFiles];
                                const fileIndex = updatedFiles.findIndex(
                                    (f) => f.uri === file.uri
                                );
                                if (fileIndex !== -1) {
                                    updatedFiles[fileIndex] = {
                                        ...updatedFiles[fileIndex],
                                        status: "completed",
                                        progress: 100,
                                        downloadURL,
                                    };
                                }
                                return updatedFiles;
                            });

                            resolve({
                                name: file.name,
                                url: downloadURL,
                                type: file.mimeType,
                                size: file.size,
                            });
                        } catch (error) {
                            reject(error);
                        }
                    }
                );
            });
        } catch (error) {
            console.error("File upload error:", error);

            // Update file status to error
            setFiles((prevFiles) => {
                const updatedFiles = [...prevFiles];
                const fileIndex = updatedFiles.findIndex(
                    (f) => f.uri === file.uri
                );
                if (fileIndex !== -1) {
                    updatedFiles[fileIndex] = {
                        ...updatedFiles[fileIndex],
                        status: "error",
                    };
                }
                return updatedFiles;
            });

            throw error;
        }
    };

    // Function to handle request saving/submission
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

        // Check if any files are still uploading
        const hasUploadingFiles = files.some(
            (file) => file.status === "uploading"
        );
        if (hasUploadingFiles) {
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: t("send_request.toast.error.files_still_uploading"),
            });
            return;
        }

        // Set loading state based on action
        if (status === "draft") {
            setIsSavingDraft(true);
        } else {
            setIsSubmitting(true);
        }

        try {
            const selectedCategoryIndex = categoryOptions.indexOf(category);
            const categoryId = categoryIds[selectedCategoryIndex];

            // First create the request document
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
                mediaFiles: [], // Will be updated after uploads
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            // Add the document to get its ID
            const docRef = await addDoc(
                collection(firestore, "requests"),
                newRequest
            );
            const requestId = docRef.id;

            console.log(
                `Request created with ID: ${requestId}, Status: ${status}`
            );

            // Upload all files with the request ID
            const uploadPromises = files.map((file) =>
                uploadFile(file, requestId)
            );
            const uploadedFiles = await Promise.all(uploadPromises);

            // Update the request document with file URLs
            await updateDoc(doc(firestore, "requests", requestId), {
                mediaFiles: uploadedFiles,
                updatedAt: serverTimestamp(),
            });

            Toast.show({
                type: "success",
                text1: t("send_request.toast.success.title"),
                text2: t(
                    `send_request.toast.success.${
                        status === "draft" ? "saved_as_draft" : "submitted"
                    }`
                ),
            });

            // Refresh requests and navigate away
            fetchRequests();
            router.push({
                pathname: "./my-requests",
            });

            // Reset form
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
            // Reset loading states
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
                />
            </View>

            <View className="mb-8">
                <Text className="font-msemibold text-black mb-2">
                    {t("send_request.fields.upload_files")}
                    <Text className="text-red-500"> *</Text>
                </Text>
                <TouchableOpacity
                    className="bg-ghostwhite border border-gray-300 rounded-lg p-4 flex-col items-center justify-center h-24"
                    onPress={pickFiles}
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

                {/* Display file list */}
                {files.length > 0 && (
                    <View className="mt-2">
                        {files.map((file, index) => (
                            <View
                                key={index}
                                className="bg-ghostwhite border border-gray-200 rounded-lg p-2 mt-1 relative"
                                style={{ minHeight: 60 }} // Set a consistent minimum height
                            >
                                <View className="flex-row items-center justify-between  min-h-[40px]">
                                    <MaterialIcons
                                        name={
                                            file.status === "error"
                                                ? "error"
                                                : file.mimeType?.startsWith(
                                                      "image"
                                                  )
                                                ? "image"
                                                : "movie"
                                        }
                                        size={20}
                                        color={
                                            file.status === "error"
                                                ? "red"
                                                : "#006FFD"
                                        }
                                    />
                                    <View className="flex-1 ml-2">
                                        <Text
                                            numberOfLines={1}
                                            ellipsizeMode="middle"
                                            className="text-black font-mregular"
                                        >
                                            {file.name}
                                        </Text>
                                        <Text className="text-gray-500 text-xs">
                                            {file.size}
                                        </Text>
                                        {file.status === "error" && (
                                            <Text className="text-red-500 text-xs mt-1">
                                                {t(
                                                    "send_request.fields.upload_error"
                                                )}
                                            </Text>
                                        )}
                                    </View>
                                    {file.status === "queued" ||
                                    file.status === "error" ? (
                                        <TouchableOpacity
                                            onPress={() =>
                                                handleRemoveFile(index)
                                            }
                                        >
                                            <MaterialIcons
                                                name="close"
                                                size={20}
                                                color="#006FFD"
                                            />
                                        </TouchableOpacity>
                                    ) : file.status === "completed" ? (
                                        <MaterialIcons
                                            name="check-circle"
                                            size={18}
                                            color="green"
                                        />
                                    ) : file.status === "uploading" ? (
                                        <Text className="text-blue-500 text-xs">
                                            {file.progress}%
                                        </Text>
                                    ) : null}
                                </View>

                                {/* Progress bar for uploading files - now positioned at the bottom */}
                                {file.status === "uploading" && (
                                    <View
                                        className="absolute bottom-0 left-0 right-0 px-2 pb-1"
                                        style={{
                                            width: "100%",
                                            paddingHorizontal: 8,
                                        }}
                                    >
                                        <View className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                            <View
                                                className="h-full bg-primary rounded-full"
                                                style={{
                                                    width: `${file.progress}%`,
                                                }}
                                            />
                                        </View>
                                    </View>
                                )}
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
