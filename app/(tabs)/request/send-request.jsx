import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import DropdownField from "../../../components/DropdownField";
import FormField from "../../../components/FormField";
import CustomButton from "../../../components/CustomButton";
import {
    addDoc,
    collection,
    doc,
    serverTimestamp,
    updateDoc,
    getDoc,
} from "firebase/firestore";
import { firestore, storage } from "../../../lib/firebase";
import Toast from "react-native-toast-message";
import { useAuthContext } from "../../../lib/context";
import { useData } from "../../../lib/datacontext";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import {
    ref,
    uploadBytesResumable,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { useTheme } from "../../../lib/themeContext";

const { width, height } = Dimensions.get("window");

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

const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
        const result = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
        });

        if (result.length > 0) {
            const address = result[0];
            return {
                city: address.city || "Unknown",
                country: address.country || "Unknown",
                district: address.district || null,
                formattedAddress: address.formattedAddress || "",
                isoCountryCode: address.isoCountryCode || "",
                name: address.name || "",
                postalCode: address.postalCode || "",
                region: address.region || "Unknown",
                street: address.street || "",
                streetNumber: address.streetNumber || "",
                subregion: address.subregion || "",
                timezone: address.timezone || null,
                coordinates: { latitude, longitude },
            };
        }
        return {
            city: "Unknown",
            country: "Unknown",
            district: null,
            formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            isoCountryCode: "",
            name: "",
            postalCode: "",
            region: "Unknown",
            street: "",
            streetNumber: "",
            subregion: "",
            timezone: null,
            coordinates: { latitude, longitude },
        };
    } catch (error) {
        console.error("Error getting address:", error);
        return {
            city: "Unknown",
            country: "Unknown",
            district: null,
            formattedAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            isoCountryCode: "",
            name: "",
            postalCode: "",
            region: "Unknown",
            street: "",
            streetNumber: "",
            subregion: "",
            timezone: null,
            coordinates: { latitude, longitude },
        };
    }
};

const RequestCreationPage = () => {
    const { t, i18n } = useTranslation();
    const { user } = useAuthContext();
    const router = useRouter();
    const { requestId } = useLocalSearchParams();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [location, setLocation] = useState("");
    const [files, setFiles] = useState([]);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { fetchRequests } = useData();
    const [isLoadingRequest, setIsLoadingRequest] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [selectedCoordinates, setSelectedCoordinates] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [locationPermission, setLocationPermission] = useState(null);
    const { isDark } = useTheme();

    const categoryOptions = categories.map((cat) => cat.name[i18n.language]);
    const categoryIds = categories.map((cat) => cat.id);

    useEffect(() => {
        if (requestId) {
            const fetchRequest = async () => {
                setIsLoadingRequest(true);
                try {
                    const docRef = doc(firestore, "requests", requestId);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const requestData = docSnap.data();
                        setTitle(
                            requestData.title[i18n.language] ||
                                requestData.title.en
                        );
                        setDescription(
                            requestData.description[i18n.language] ||
                                requestData.description.en
                        );

                        const categoryRef = requestData.categoryId;
                        const categoryDoc = await getDoc(categoryRef);
                        const categoryData = categoryDoc.data();
                        const categoryName =
                            categoryData.name[i18n.language] ||
                            categoryData.name.en;
                        setCategory(categoryName);

                        setLocation(requestData.address.formattedAddress);
                        setSelectedCoordinates(requestData.address.coordinates);

                        const prefilledFiles = requestData.mediaFiles.map(
                            (file) => ({
                                uri: file.url,
                                name: file.name,
                                size: file.size,
                                mimeType: file.type,
                                status: "completed",
                                progress: 100,
                                downloadURL: file.url,
                            })
                        );
                        setFiles(prefilledFiles);
                    } else {
                        Toast.show({
                            type: "error",
                            text1: t("send_request.toast.error.title"),
                            text2: t(
                                "send_request.toast.error.request_not_found"
                            ),
                        });
                    }
                } catch (error) {
                    console.error("Error fetching request:", error);
                    Toast.show({
                        type: "error",
                        text1: t("send_request.toast.error.title"),
                        text2: t("send_request.toast.error.fetch_failed"),
                    });
                } finally {
                    setIsLoadingRequest(false);
                }
            };
            fetchRequest();
        }
    }, [requestId, i18n.language]);

    useEffect(() => {
        requestLocationPermission();
    }, []);

    const requestLocationPermission = async () => {
        try {
            const { status } =
                await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status === "granted");

            if (status === "granted") {
                getCurrentLocation();
            } else {
                Alert.alert(
                    t("send_request.location.permission_title"),
                    t("send_request.location.permission_message"),
                    [
                        {
                            text: t("send_request.location.permission_cancel"),
                            style: "cancel",
                        },
                        {
                            text: t(
                                "send_request.location.permission_settings"
                            ),
                            onPress: () =>
                                Location.requestForegroundPermissionsAsync(),
                        },
                    ],
                    { userInterfaceStyle: isDark ? "dark" : "light" }
                );
            }
        } catch (error) {
            console.error("Error requesting location permission:", error);
        }
    };

    const getCurrentLocation = async () => {
        setIsLoadingLocation(true);
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            const coords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };

            setCurrentLocation(coords);
            if (!requestId) {
                setSelectedCoordinates(coords);
            }
        } catch (error) {
            console.error("Error getting current location:", error);
            const defaultLocation = {
                latitude: 43.222,
                longitude: 76.8512,
            };
            setCurrentLocation(defaultLocation);
            if (!requestId) {
                setSelectedCoordinates(defaultLocation);
            }
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const handleLocationFieldPress = () => {
        if (locationPermission === null) {
            requestLocationPermission();
            return;
        }

        if (!locationPermission) {
            Alert.alert(
                t("send_request.location.permission_title"),
                t("send_request.location.permission_required"),
                [
                    {
                        text: t("send_request.location.permission_cancel"),
                        style: "cancel",
                    },
                    {
                        text: t("send_request.location.permission_settings"),
                        onPress: requestLocationPermission,
                    },
                ],
                { userInterfaceStyle: isDark ? "dark" : "light" }
            );
            return;
        }

        setShowMap(true);
    };

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedCoordinates({ latitude, longitude });
    };

    const handleConfirmLocation = async () => {
        if (selectedCoordinates) {
            setIsLoadingLocation(true);
            try {
                const addressData = await getAddressFromCoordinates(
                    selectedCoordinates.latitude,
                    selectedCoordinates.longitude
                );
                setLocation(
                    addressData.formattedAddress ||
                        `${selectedCoordinates.latitude.toFixed(
                            6
                        )}, ${selectedCoordinates.longitude.toFixed(6)}`
                );
                setSelectedCoordinates(addressData.coordinates);
                setShowMap(false);
            } catch (error) {
                console.error("Error setting location:", error);
                setLocation(
                    `${selectedCoordinates.latitude.toFixed(
                        6
                    )}, ${selectedCoordinates.longitude.toFixed(6)}`
                );
                setSelectedCoordinates({
                    latitude: selectedCoordinates.latitude,
                    longitude: selectedCoordinates.longitude,
                });
                setShowMap(false);
            } finally {
                setIsLoadingLocation(false);
            }
        }
    };

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

    const handleRemoveFile = async (index) => {
        const fileToRemove = files[index];
        if (
            fileToRemove.status === "completed" &&
            fileToRemove.downloadURL &&
            requestId
        ) {
            try {
                const fileRef = ref(storage, fileToRemove.downloadURL);
                await deleteObject(fileRef);
                console.log(`File ${fileToRemove.name} deleted from storage`);

                const docRef = doc(firestore, "requests", requestId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const requestData = docSnap.data();
                    const updatedMediaFiles = requestData.mediaFiles.filter(
                        (file) => file.url !== fileToRemove.downloadURL
                    );
                    await updateDoc(docRef, {
                        mediaFiles: updatedMediaFiles,
                        updatedAt: serverTimestamp(),
                    });
                    console.log(
                        `File ${fileToRemove.name} removed from Firestore`
                    );
                }
            } catch (error) {
                console.error("Error deleting file from storage:", error);
                Toast.show({
                    type: "error",
                    text1: t("send_request.toast.error.title"),
                    text2: t("send_request.toast.error.file_deletion_failed"),
                });
                return;
            }
        }
        setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    };

    const uploadFile = async (file, requestId) => {
        if (file.status === "completed") {
            return {
                name: file.name,
                url: file.downloadURL,
                type: file.mimeType,
                size: file.size,
            };
        }

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
            const fileName = `${Date.now()}_${file.name}`;
            const storageRef = ref(
                storage,
                `requests/${requestId}/${fileName}`
            );
            const response = await fetch(file.uri);
            const blob = await response.blob();
            const uploadTask = uploadBytesResumable(storageRef, blob, {
                contentType: file.mimeType,
            });

            return new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                                100
                        );
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

        if (status === "Draft") {
            setIsSavingDraft(true);
        } else {
            setIsSubmitting(true);
        }

        try {
            const selectedCategoryIndex = categoryOptions.indexOf(category);
            const categoryId = categoryIds[selectedCategoryIndex];
            const addressData = await getAddressFromCoordinates(
                selectedCoordinates.latitude,
                selectedCoordinates.longitude
            );

            const requestData = {
                title: { en: title, kz: title, ru: title },
                description: {
                    en: description,
                    kz: description,
                    ru: description,
                },
                categoryId: doc(firestore, "requests_categories", categoryId),
                userId: `/users/${user.uid}`,
                status: status,
                address: {
                    city: addressData.city,
                    country: addressData.country,
                    district: addressData.district,
                    formattedAddress: addressData.formattedAddress,
                    isoCountryCode: addressData.isoCountryCode,
                    name: addressData.name,
                    postalCode: addressData.postalCode,
                    region: addressData.region,
                    street: addressData.street,
                    streetNumber: addressData.streetNumber,
                    subregion: addressData.subregion,
                    timezone: addressData.timezone,
                    coordinates: addressData.coordinates,
                },
                mediaFiles: [],
                rejectionReason: { en: "", kz: "", ru: "" },
                updatedAt: serverTimestamp(),
            };

            let requestIdToUse = requestId;
            if (requestId) {
                const docRef = doc(firestore, "requests", requestId);
                await updateDoc(docRef, requestData);
                requestIdToUse = requestId;
            } else {
                requestData.createdAt = serverTimestamp();
                const docRef = await addDoc(
                    collection(firestore, "requests"),
                    requestData
                );
                requestIdToUse = docRef.id;
            }

            const uploadPromises = files.map((file) =>
                uploadFile(file, requestIdToUse)
            );
            const uploadedFiles = await Promise.all(uploadPromises);

            await updateDoc(doc(firestore, "requests", requestIdToUse), {
                mediaFiles: uploadedFiles,
                updatedAt: serverTimestamp(),
            });

            Toast.show({
                type: "success",
                text1: t("send_request.toast.success.title"),
                text2: t(
                    `send_request.toast.success.${
                        status === "Draft" ? "saved_as_draft" : "submitted"
                    }`
                ),
            });

            fetchRequests();
            router.push({ pathname: "./my-requests" });

            setTitle("");
            setDescription("");
            setCategory("");
            setLocation("");
            setSelectedCoordinates(null);
            setFiles([]);
        } catch (error) {
            console.error("Error saving request:", error);
            Toast.show({
                type: "error",
                text1: t("send_request.toast.error.title"),
                text2: `Failed to save request: ${error.message}`,
            });
        } finally {
            if (status === "Draft") {
                setIsSavingDraft(false);
            } else {
                setIsSubmitting(false);
            }
        }
    };

    if (isLoadingRequest) {
        return (
            <View
                className={`flex-1 justify-center items-center ${
                    isDark ? "bg-dark-background" : "bg-secondary"
                }`}
            >
                <ActivityIndicator
                    size="large"
                    color={isDark ? "#0066E6" : "#006FFD"}
                />
            </View>
        );
    }

    return (
        <>
            <ScrollView
                className={`flex-1 ${
                    isDark ? "bg-dark-background" : "bg-secondary"
                }`}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-2 mt-2">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("send_request.fields.title")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <FormField
                        placeholder={t("send_request.fields.title")}
                        value={title}
                        handleChangeText={setTitle}
                        multiline={false}
                        numberOfLines={1}
                        containerStyle={
                            isDark ? "bg-dark-surface" : "bg-ghostwhite"
                        }
                        inputStyle={
                            isDark ? "text-dark-text-primary" : "text-black"
                        }
                        isDark={isDark}
                    />
                </View>

                <View className="mb-2">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
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
                        containerStyle={
                            isDark ? "bg-dark-surface" : "bg-ghostwhite"
                        }
                        inputStyle={
                            isDark ? "text-dark-text-primary" : "text-black"
                        }
                        isDark={isDark}
                    />
                </View>

                <View className="mb-2">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("send_request.fields.category")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <DropdownField
                        title={t("send_request.fields.category")}
                        placeholder={t("send_request.fields.select_category")}
                        value={category}
                        options={categoryOptions}
                        onSelect={setCategory}
                        containerStyle={
                            isDark ? "bg-dark-surface" : "bg-ghostwhite"
                        }
                        textStyle={
                            isDark ? "text-dark-text-primary" : "text-black"
                        }
                        isDark={isDark}
                    />
                </View>

                <View className="mb-6">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("send_request.fields.location")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <TouchableOpacity
                        className={`border rounded-lg p-4 flex-row items-center justify-between min-h-[50px] ${
                            isDark
                                ? "bg-dark-surface border-gray-600"
                                : "bg-ghostwhite border-gray-300"
                        }`}
                        onPress={handleLocationFieldPress}
                        disabled={isLoadingLocation}
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialIcons
                                name="location-on"
                                size={24}
                                color={isDark ? "#0066E6" : "#006FFD"}
                            />
                            <Text
                                className={`ml-2 flex-1 font-mregular ${
                                    location
                                        ? isDark
                                            ? "text-dark-text-primary"
                                            : "text-black"
                                        : isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-500"
                                }`}
                                numberOfLines={2}
                            >
                                {location ||
                                    t(
                                        "send_request.fields.location_placeholder"
                                    )}
                            </Text>
                        </View>
                        {isLoadingLocation ? (
                            <ActivityIndicator
                                size="small"
                                color={isDark ? "#0066E6" : "#006FFD"}
                            />
                        ) : (
                            <MaterialIcons
                                name="chevron-right"
                                size={24}
                                color={isDark ? "#0066E6" : "#006FFD"}
                            />
                        )}
                    </TouchableOpacity>
                </View>

                <View className="mb-8">
                    <Text
                        className={`font-msemibold mb-2 ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("send_request.fields.upload_files")}
                        <Text className="text-red-500"> *</Text>
                    </Text>
                    <TouchableOpacity
                        className={`border rounded-lg p-4 flex-col items-center justify-center h-24 ${
                            isDark
                                ? "bg-dark-surface border-gray-600"
                                : "bg-ghostwhite border-gray-300"
                        }`}
                        onPress={pickFiles}
                    >
                        <MaterialIcons
                            name="cloud-upload"
                            size={24}
                            color={isDark ? "#0066E6" : "#006FFD"}
                        />
                        <Text
                            className={`mt-2 font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-600"
                            }`}
                        >
                            {t("send_request.fields.upload_placeholder")}
                        </Text>
                    </TouchableOpacity>

                    {files.length > 0 && (
                        <View className="mt-2">
                            {files.map((file, index) => (
                                <View
                                    key={index}
                                    className={`border rounded-lg p-2 mt-1 relative ${
                                        isDark
                                            ? "bg-dark-surface border-gray-600"
                                            : "bg-ghostwhite border-gray-200"
                                    }`}
                                    style={{ minHeight: 60 }}
                                >
                                    <View className="flex-row items-center justify-between min-h-[40px]">
                                        <MaterialIcons
                                            name={
                                                file.status === "error"
                                                    ? "error"
                                                    : file.status ===
                                                      "completed"
                                                    ? "cloud-done"
                                                    : file.status ===
                                                          "uploading" ||
                                                      file.status === "queued"
                                                    ? "cloud-queue"
                                                    : file.mimeType?.startsWith(
                                                          "image"
                                                      )
                                                    ? "image"
                                                    : "movie"
                                            }
                                            size={20}
                                            color={
                                                file.status === "error"
                                                    ? isDark
                                                        ? "#F87171"
                                                        : "red"
                                                    : file.status ===
                                                      "completed"
                                                    ? isDark
                                                        ? "#34D399"
                                                        : "green"
                                                    : isDark
                                                    ? "#0066E6"
                                                    : "#006FFD"
                                            }
                                        />
                                        <View className="flex-1 ml-2">
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="middle"
                                                className={`font-mregular ${
                                                    isDark
                                                        ? "text-dark-text-primary"
                                                        : "text-black"
                                                }`}
                                            >
                                                {file.name}
                                            </Text>
                                            <Text
                                                className={`text-xs ${
                                                    isDark
                                                        ? "text-dark-text-secondary"
                                                        : "text-gray-500"
                                                }`}
                                            >
                                                {file.size}
                                            </Text>
                                            {file.status === "error" && (
                                                <Text
                                                    className={`text-xs mt-1 ${
                                                        isDark
                                                            ? "text-red-400"
                                                            : "text-red-500"
                                                    }`}
                                                >
                                                    {t(
                                                        "send_request.fields.upload_error"
                                                    )}
                                                </Text>
                                            )}
                                        </View>
                                        {file.status === "uploading" ? (
                                            <Text
                                                className={`text-xs ${
                                                    isDark
                                                        ? "text-blue-400"
                                                        : "text-blue-500"
                                                }`}
                                            >
                                                {file.progress}%
                                            </Text>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleRemoveFile(index)
                                                }
                                            >
                                                <MaterialIcons
                                                    name="close"
                                                    size={20}
                                                    color={
                                                        isDark
                                                            ? "#0066E6"
                                                            : "#006FFD"
                                                    }
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {file.status === "uploading" && (
                                        <View
                                            className="absolute bottom-0 left-0 right-0 px-2 pb-1"
                                            style={{
                                                width: "100%",
                                                paddingHorizontal: 8,
                                            }}
                                        >
                                            <View
                                                className={`h-1.5 w-full rounded-full overflow-hidden ${
                                                    isDark
                                                        ? "bg-gray-700"
                                                        : "bg-gray-200"
                                                }`}
                                            >
                                                <View
                                                    className={`h-full rounded-full ${
                                                        isDark
                                                            ? "bg-dark-primary"
                                                            : "bg-primary"
                                                    }`}
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
                        handlePress={() => handleSaveRequest("Draft")}
                        containerStyles={`flex-1 mr-2 py-3 px-2 rounded-lg ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                        textStyles={`font-mmedium `}
                        isLoading={isSavingDraft}
                        isDark={isDark}
                    />
                    <CustomButton
                        title={t("send_request.buttons.submit")}
                        handlePress={() => handleSaveRequest("In progress")}
                        containerStyles={`flex-1 ml-2 py-3 px-2 rounded-lg `}
                        textStyles={`font-mmedium `}
                        isLoading={isSubmitting}
                        isDark={isDark}
                    />
                </View>
            </ScrollView>

            <Modal
                visible={showMap}
                animationType="slide"
                onRequestClose={() => setShowMap(false)}
            >
                <View
                    className={`flex-1 ${
                        isDark ? "bg-dark-background" : "bg-secondary"
                    }`}
                >
                    <View
                        className={`border-b pt-6 pb-4 px-4 ${
                            isDark
                                ? "bg-dark-surface border-gray-600"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <View className="flex-row items-center justify-between">
                            <TouchableOpacity
                                onPress={() => setShowMap(false)}
                                className="p-2"
                            >
                                <MaterialIcons
                                    name="close"
                                    size={24}
                                    color={isDark ? "#FFFFFF" : "#000"}
                                />
                            </TouchableOpacity>
                            <Text
                                className={`font-msemibold text-sm ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-black"
                                }`}
                            >
                                {t("send_request.location.select_location")}
                            </Text>
                            <TouchableOpacity
                                onPress={handleConfirmLocation}
                                disabled={
                                    !selectedCoordinates || isLoadingLocation
                                }
                                className={`p-2 rounded-full ${
                                    selectedCoordinates && !isLoadingLocation
                                        ? isDark
                                            ? "bg-dark-primary"
                                            : "bg-primary"
                                        : isDark
                                        ? "bg-gray-600"
                                        : "bg-gray-300"
                                }`}
                            >
                                {isLoadingLocation ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={isDark ? "#000" : "#fff"}
                                    />
                                ) : (
                                    <MaterialIcons
                                        name="check"
                                        size={24}
                                        color={
                                            selectedCoordinates
                                                ? isDark
                                                    ? "#000"
                                                    : "#fff"
                                                : isDark
                                                ? "#A0A0A0"
                                                : "#999"
                                        }
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-1">
                        {currentLocation ? (
                            <MapView
                                style={{ flex: 1 }}
                                initialRegion={{
                                    latitude: currentLocation.latitude,
                                    longitude: currentLocation.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                onPress={handleMapPress}
                                showsUserLocation={true}
                                showsMyLocationButton={true}
                                userInterfaceStyle={isDark ? "dark" : "light"}
                            >
                                {selectedCoordinates && (
                                    <Marker
                                        coordinate={selectedCoordinates}
                                        title={t(
                                            "send_request.location.selected_location"
                                        )}
                                        pinColor={
                                            isDark ? "#60A5FA" : "#006FFD"
                                        }
                                    />
                                )}
                            </MapView>
                        ) : (
                            <View
                                className={`flex-1 items-center justify-center ${
                                    isDark
                                        ? "bg-dark-background"
                                        : "bg-secondary"
                                }`}
                            >
                                <ActivityIndicator
                                    size="large"
                                    color={isDark ? "#0066E6" : "#006FFD"}
                                />
                                <Text
                                    className={`mt-4 font-mregular ${
                                        isDark
                                            ? "text-dark-text-secondary"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {t("send_request.location.loading_map")}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View
                        className={`border-t p-4 ${
                            isDark
                                ? "bg-dark-surface border-gray-600"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <Text
                            className={`text-center font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-600"
                            }`}
                        >
                            {t("send_request.location.tap_to_select")}
                        </Text>
                        {selectedCoordinates && (
                            <Text
                                className={`text-center font-mmedium mt-2 ${
                                    isDark
                                        ? "text-dark-primary"
                                        : "text-primary"
                                }`}
                            >
                                {`${selectedCoordinates.latitude.toFixed(
                                    6
                                )}, ${selectedCoordinates.longitude.toFixed(
                                    6
                                )}`}
                            </Text>
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default RequestCreationPage;
