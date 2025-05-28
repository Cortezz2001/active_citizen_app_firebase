import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Modal,
    Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../../lib/firebase";
import Toast from "react-native-toast-message";
import { VideoView, useVideoPlayer } from "expo-video";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import LoadingIndicator from "../../../components/LoadingIndicator";
const { width, height } = Dimensions.get("window");

const statusColors = {
    Draft: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "edit",
        iconColor: "#374151",
    },
    "In progress": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "pending",
        iconColor: "#B45309",
    },
    Rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "cancel",
        iconColor: "#B91C1C",
    },
    Completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "check-circle",
        iconColor: "#047857",
    },
};

const RequestDetailPage = () => {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [request, setRequest] = useState(null);
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showMediaModal, setShowMediaModal] = useState(false);

    const videoPlayer = useVideoPlayer(selectedMedia?.url || "", (player) => {
        player.loop = false;
        player.muted = false;
    });

    useEffect(() => {
        if (id) {
            fetchRequestDetails();
        }
    }, [id, i18n.language]);

    const fetchRequestDetails = async () => {
        setIsLoading(true);
        try {
            const docRef = doc(firestore, "requests", id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const requestData = docSnap.data();
                setRequest(requestData);

                // Fetch category details
                if (requestData.categoryId) {
                    const categorySnap = await getDoc(requestData.categoryId);
                    if (categorySnap.exists()) {
                        setCategory(categorySnap.data());
                    }
                }
            } else {
                Toast.show({
                    type: "error",
                    text1: t("request.error"),
                    text2: t("request.request_not_found"),
                });
                router.back();
            }
        } catch (error) {
            console.error("Error fetching request details:", error);
            Toast.show({
                type: "error",
                text1: t("request.error"),
                text2: t("request.failed_to_load_request"),
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMediaPress = (mediaItem) => {
        setSelectedMedia(mediaItem);
        setShowMediaModal(true);
    };

    const closeMediaModal = () => {
        setShowMediaModal(false);
        setSelectedMedia(null);
        if (videoPlayer) {
            videoPlayer.pause();
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);
        return date.toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return <LoadingIndicator />;
    }

    if (!request) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-white p-4">
                <MaterialIcons name="error-outline" size={64} color="#EF4444" />
                <Text className="text-center font-mmedium text-lg mt-4 text-gray-800">
                    {t("request.request_not_found")}
                </Text>
                <TouchableOpacity
                    className="mt-6 px-6 py-3 bg-primary rounded-full"
                    onPress={() => router.back()}
                >
                    <Text className="text-white font-mmedium">
                        {t("request.go_back")}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const statusColor = statusColors[request.status] || {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "help",
        iconColor: "#374151",
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                    accessibilityLabel={t("request.back_button")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4 mt-6">
                    <View className="flex-row items-center">
                        <Text className="font-mbold text-2xl text-black mr-2">
                            {request.title[i18n.language] || request.title.en}
                        </Text>
                        <View
                            className={`px-1 py-1 rounded-full ${statusColor.bg}`}
                        >
                            <MaterialIcons
                                name={statusColor.icon}
                                size={16}
                                color={statusColor.iconColor}
                            />
                        </View>
                    </View>
                </View>

                {/* Rejection Reason */}
                {request.status === "rejected" && request.rejectionReason && (
                    <View className="bg-red-100 rounded-lg p-4 mb-4 shadow-sm border border-red-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="info"
                                size={20}
                                color="#B91C1C"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("request.rejection_reason")}
                            </Text>
                        </View>
                        <Text className="text-gray-700 font-mregular">
                            {request.rejectionReason?.[i18n.language] ||
                                request.rejectionReason?.en ||
                                t("request.no_reason_provided")}
                        </Text>
                    </View>
                )}

                {/* Category */}
                {category && (
                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="category"
                                size={20}
                                color="#212938"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("request.category")}
                            </Text>
                        </View>
                        <Text className="text-gray-700 font-mregular">
                            {category.name?.[i18n.language] ||
                                category.name?.en ||
                                ""}
                        </Text>
                    </View>
                )}

                {/* Description */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="description"
                            size={20}
                            color="#212938"
                        />
                        <Text className="font-mbold text-lg text-gray-800 ml-2">
                            {t("request.description")}
                        </Text>
                    </View>
                    <Text className="font-mregular text-gray-700">
                        {request.description?.[i18n.language] ||
                            request.description?.en ||
                            ""}
                    </Text>
                </View>

                {/* Location */}
                <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="location-on"
                            size={20}
                            color="#212938"
                        />
                        <Text className="font-mbold text-lg text-gray-800 ml-2">
                            {t("request.location")}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-700 font-mregular">
                            {request.address?.formattedAddress || ""}
                        </Text>
                        {request.address?.city && (
                            <Text className="text-gray-500 font-mregular text-sm mt-1">
                                {`${request.address.city}, ${
                                    request.address.region || ""
                                }`}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Created Date */}
                {request.createdAt && (
                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="schedule"
                                size={20}
                                color="#212938"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("request.created_date")}
                            </Text>
                        </View>
                        <Text className="ml-3 text-gray-700 font-mregular">
                            {formatDate(request.createdAt)}
                        </Text>
                    </View>
                )}

                {/* Media Files */}
                {request.mediaFiles && request.mediaFiles.length > 0 && (
                    <View className="bg-white rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="image"
                                size={20}
                                color="#212938"
                            />
                            <Text className="font-mbold text-lg text-gray-800 ml-2">
                                {t("request.media_files")} (
                                {request.mediaFiles.length})
                            </Text>
                        </View>
                        <View className="flex-row flex-wrap -mx-1">
                            {request.mediaFiles.map((mediaItem, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="w-1/3 px-1 mb-2"
                                    onPress={() => handleMediaPress(mediaItem)}
                                >
                                    <View className="bg-gray-100 rounded-lg overflow-hidden aspect-square">
                                        {mediaItem.type?.startsWith("image") ||
                                        mediaItem.url?.includes("image") ||
                                        /\.(jpg|jpeg|png|gif|webp)$/i.test(
                                            mediaItem.url ||
                                                mediaItem.fileName ||
                                                ""
                                        ) ? (
                                            <Image
                                                source={{ uri: mediaItem.url }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="w-full h-full justify-center items-center bg-gray-200">
                                                <MaterialIcons
                                                    name="play-circle-outline"
                                                    size={32}
                                                    color="#006FFD"
                                                />
                                                <Text className="text-xs text-gray-600 mt-1 text-center">
                                                    {t("request.video")}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Media Modal */}
            <Modal
                visible={showMediaModal}
                animationType="fade"
                transparent={true}
                onRequestClose={closeMediaModal}
            >
                <View className="flex-1 bg-black">
                    <View className="absolute top-12 right-4 z-10">
                        <TouchableOpacity
                            onPress={closeMediaModal}
                            className="bg-black bg-opacity-50 rounded-full p-2"
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color="white"
                            />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 justify-center items-center">
                        {selectedMedia && (
                            <>
                                {selectedMedia.type?.startsWith("image") ||
                                selectedMedia.url?.includes("image") ||
                                /\.(jpg|jpeg|png|gif|webp)$/i.test(
                                    selectedMedia.url ||
                                        selectedMedia.fileName ||
                                        ""
                                ) ? (
                                    <Image
                                        source={{ uri: selectedMedia.url }}
                                        style={{
                                            width: width,
                                            height: height * 0.8,
                                        }}
                                        resizeMode="contain"
                                    />
                                ) : (
                                    <VideoView
                                        style={{
                                            width: width,
                                            height: height * 0.6,
                                        }}
                                        player={videoPlayer}
                                        allowsFullscreen
                                        allowsPictureInPicture
                                    />
                                )}

                                {selectedMedia.fileName && (
                                    <View className="absolute bottom-8 left-4 right-4">
                                        <View className="bg-black bg-opacity-70 rounded-lg p-3">
                                            <Text className="text-white font-mregular text-center">
                                                {selectedMedia.fileName}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default RequestDetailPage;
