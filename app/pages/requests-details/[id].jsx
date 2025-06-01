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
import * as VideoThumbnails from "expo-video-thumbnails";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import LoadingIndicator from "../../../components/LoadingIndicator";
import { useTheme } from "../../../lib/themeContext";

const { width, height } = Dimensions.get("window");

const statusColors = {
    Draft: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        icon: "edit",
        iconColor: "#374151",
        darkBg: "bg-dark-border",
        darkText: "text-dark-text-secondary",
        darkIconColor: "#B3B3B3",
    },
    "In progress": {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: "pending",
        iconColor: "#B45309",
        darkBg: "bg-yellow-900",
        darkText: "text-yellow-200",
        darkIconColor: "#FBBF24",
    },
    Rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: "cancel",
        iconColor: "#B91C1C",
        darkBg: "bg-red-900",
        darkText: "text-red-200",
        darkIconColor: "#F87171",
    },
    Completed: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: "check-circle",
        iconColor: "#047857",
        darkBg: "bg-green-900",
        darkText: "text-green-200",
        darkIconColor: "#34D399",
    },
};

const RequestDetailPage = () => {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { isDark } = useTheme();
    const [request, setRequest] = useState(null);
    const [category, setCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [videoThumbnails, setVideoThumbnails] = useState({});
    const [thumbnailLoading, setThumbnailLoading] = useState({});

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

                // Generate thumbnails for video files
                if (
                    requestData.mediaFiles &&
                    requestData.mediaFiles.length > 0
                ) {
                    generateVideoThumbnails(requestData.mediaFiles);
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

    const isVideoFile = (mediaItem) => {
        return (
            mediaItem.type?.startsWith("video") ||
            mediaItem.url?.includes("video") ||
            /\.(mp4|mov|avi|mkv|webm|m4v)$/i.test(
                mediaItem.url || mediaItem.fileName || ""
            )
        );
    };

    const isImageFile = (mediaItem) => {
        return (
            mediaItem.type?.startsWith("image") ||
            mediaItem.url?.includes("image") ||
            /\.(jpg|jpeg|png|gif|webp)$/i.test(
                mediaItem.url || mediaItem.fileName || ""
            )
        );
    };

    const generateVideoThumbnails = async (mediaFiles) => {
        const thumbnails = {};
        const loadingStates = {};

        for (let i = 0; i < mediaFiles.length; i++) {
            const mediaItem = mediaFiles[i];

            if (isVideoFile(mediaItem)) {
                loadingStates[i] = true;
                setThumbnailLoading((prev) => ({ ...prev, [i]: true }));

                try {
                    const { uri } = await VideoThumbnails.getThumbnailAsync(
                        mediaItem.url,
                        {
                            time: 1000, // 1 second into the video
                            quality: 0.7,
                        }
                    );
                    thumbnails[i] = uri;
                } catch (error) {
                    console.warn(
                        `Failed to generate thumbnail for video ${i}:`,
                        error
                    );
                    thumbnails[i] = null;
                } finally {
                    loadingStates[i] = false;
                    setThumbnailLoading((prev) => ({ ...prev, [i]: false }));
                }
            }
        }

        setVideoThumbnails(thumbnails);
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

    const renderMediaThumbnail = (mediaItem, index) => {
        const isVideo = isVideoFile(mediaItem);
        const isImage = isImageFile(mediaItem);
        const thumbnail = videoThumbnails[index];
        const isLoadingThumbnail = thumbnailLoading[index];

        return (
            <TouchableOpacity
                key={index}
                className="w-1/3 px-1 mb-2"
                onPress={() => handleMediaPress(mediaItem)}
            >
                <View
                    className={`rounded-lg overflow-hidden aspect-square ${
                        isDark ? "bg-dark-border" : "bg-gray-100"
                    }`}
                >
                    {isImage ? (
                        <Image
                            source={{ uri: mediaItem.url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : isVideo ? (
                        <View className="w-full h-full relative">
                            {thumbnail ? (
                                <>
                                    <Image
                                        source={{ uri: thumbnail }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    <View className="absolute inset-0 justify-center items-center">
                                        <View className="bg-black bg-opacity-50 rounded-full p-2">
                                            <MaterialIcons
                                                name="play-arrow"
                                                size={24}
                                                color="white"
                                            />
                                        </View>
                                    </View>
                                </>
                            ) : isLoadingThumbnail ? (
                                <View
                                    className={`w-full h-full justify-center items-center ${
                                        isDark
                                            ? "bg-dark-surface"
                                            : "bg-gray-200"
                                    }`}
                                >
                                    <ActivityIndicator
                                        size="small"
                                        color={isDark ? "#0066E6" : "#006FFD"}
                                    />
                                </View>
                            ) : (
                                <View
                                    className={`w-full h-full justify-center items-center ${
                                        isDark
                                            ? "bg-dark-surface"
                                            : "bg-gray-200"
                                    }`}
                                >
                                    <MaterialIcons
                                        name="play-circle-outline"
                                        size={32}
                                        color={isDark ? "#0066E6" : "#006FFD"}
                                    />
                                    <Text
                                        className={`text-xs mt-1 text-center ${
                                            isDark
                                                ? "text-dark-text-muted"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {t("request.video")}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <View
                            className={`w-full h-full justify-center items-center ${
                                isDark ? "bg-dark-surface" : "bg-gray-200"
                            }`}
                        >
                            <MaterialIcons
                                name="insert-drive-file"
                                size={32}
                                color={isDark ? "#B3B3B3" : "#666666"}
                            />
                            <Text
                                className={`text-xs mt-1 text-center ${
                                    isDark
                                        ? "text-dark-text-muted"
                                        : "text-gray-600"
                                }`}
                            >
                                {t("request.file")}
                            </Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return <LoadingIndicator isDark={isDark} />;
    }

    if (!request) {
        return (
            <SafeAreaView
                className={`flex-1 justify-center items-center p-4 ${
                    isDark ? "bg-dark-background" : "bg-white"
                }`}
            >
                <StatusBar style={isDark ? "light" : "dark"} />
                <MaterialIcons
                    name="error-outline"
                    size={64}
                    color={isDark ? "#FF6B6B" : "#EF4444"}
                />
                <Text
                    className={`text-center font-mmedium text-lg mt-4 ${
                        isDark ? "text-dark-text-primary" : "text-gray-800"
                    }`}
                >
                    {t("request.request_not_found")}
                </Text>
                <TouchableOpacity
                    className={`mt-6 px-6 py-3 rounded-full ${
                        isDark ? "bg-dark-primary" : "bg-primary"
                    }`}
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
        darkBg: "bg-dark-border",
        darkText: "text-dark-text-secondary",
        darkIconColor: "#B3B3B3",
    };

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-white"}`}
        >
            <StatusBar style={isDark ? "light" : "dark"} />
            <View
                className={`px-6 pt-4 pb-2 flex-row items-center border-b ${
                    isDark
                        ? "bg-dark-background border-dark-border"
                        : "bg-white border-gray-200"
                }`}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                    accessibilityLabel={t("request.back_button")}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={isDark ? "#FFFFFF" : "black"}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-4 mt-6">
                    <View className="flex-row items-start">
                        <Text
                            className={`font-mbold text-2xl flex-1 mr-2 ${
                                isDark ? "text-dark-text-primary" : "text-black"
                            }`}
                        >
                            {request.title[i18n.language] || request.title.en}
                        </Text>
                        <View
                            className={`px-1 py-1 rounded-full ${
                                isDark ? statusColor.darkBg : statusColor.bg
                            } mt-1`}
                        >
                            <MaterialIcons
                                name={statusColor.icon}
                                size={16}
                                color={
                                    isDark
                                        ? statusColor.darkIconColor
                                        : statusColor.iconColor
                                }
                            />
                        </View>
                    </View>
                </View>

                {/* Rejection Reason */}
                {request.status === "Rejected" && request.rejectionReason && (
                    <View
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-red-900 border-red-700"
                                : "bg-red-100 border-red-200"
                        }`}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="info"
                                size={20}
                                color={isDark ? "#F87171" : "#B91C1C"}
                            />
                            <Text
                                className={`font-mbold text-lg ml-2 ${
                                    isDark ? "text-red-200" : "text-gray-800"
                                }`}
                            >
                                {t("request.rejection_reason")}
                            </Text>
                        </View>
                        <Text
                            className={`font-mregular ${
                                isDark ? "text-red-100" : "text-gray-700"
                            }`}
                        >
                            {request.rejectionReason?.[i18n.language] ||
                                request.rejectionReason?.en ||
                                t("request.no_reason_provided")}
                        </Text>
                    </View>
                )}

                {/* Category */}
                {category && (
                    <View
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-dark-background border-dark-border"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="category"
                                size={20}
                                color={isDark ? "#B3B3B3" : "#212938"}
                            />
                            <Text
                                className={`font-mbold text-lg ml-2 ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-800"
                                }`}
                            >
                                {t("request.category")}
                            </Text>
                        </View>
                        <Text
                            className={`font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-700"
                            }`}
                        >
                            {category.name?.[i18n.language] ||
                                category.name?.en ||
                                ""}
                        </Text>
                    </View>
                )}

                {/* Description */}
                <View
                    className={`rounded-lg p-4 mb-4 shadow-sm border ${
                        isDark
                            ? "bg-dark-background border-dark-border"
                            : "bg-white border-gray-200"
                    }`}
                >
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="description"
                            size={20}
                            color={isDark ? "#B3B3B3" : "#212938"}
                        />
                        <Text
                            className={`font-mbold text-lg ml-2 ${
                                isDark
                                    ? "text-dark-text-primary"
                                    : "text-gray-800"
                            }`}
                        >
                            {t("request.description")}
                        </Text>
                    </View>
                    <Text
                        className={`font-mregular ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-700"
                        }`}
                    >
                        {request.description?.[i18n.language] ||
                            request.description?.en ||
                            ""}
                    </Text>
                </View>

                {/* Location */}
                <View
                    className={`rounded-lg p-4 mb-4 shadow-sm border ${
                        isDark
                            ? "bg-dark-background border-dark-border"
                            : "bg-white border-gray-200"
                    }`}
                >
                    <View className="flex-row items-center mb-2">
                        <MaterialIcons
                            name="location-on"
                            size={20}
                            color={isDark ? "#B3B3B3" : "#212938"}
                        />
                        <Text
                            className={`font-mbold text-lg ml-2 ${
                                isDark
                                    ? "text-dark-text-primary"
                                    : "text-gray-800"
                            }`}
                        >
                            {t("request.location")}
                        </Text>
                    </View>
                    <View className="flex-1">
                        <Text
                            className={`font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-700"
                            }`}
                        >
                            {request.address?.formattedAddress || ""}
                        </Text>
                        {request.address?.city && (
                            <Text
                                className={`font-mregular text-sm mt-1 ${
                                    isDark
                                        ? "text-dark-text-muted"
                                        : "text-gray-500"
                                }`}
                            >
                                {`${request.address.city}, ${
                                    request.address.region || ""
                                }`}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Created Date */}
                {request.createdAt && (
                    <View
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-dark-background border-dark-border"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="schedule"
                                size={20}
                                color={isDark ? "#B3B3B3" : "#212938"}
                            />
                            <Text
                                className={`font-mbold text-lg ml-2 ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-800"
                                }`}
                            >
                                {t("request.created_date")}
                            </Text>
                        </View>
                        <Text
                            className={`ml-3 font-mregular ${
                                isDark
                                    ? "text-dark-text-secondary"
                                    : "text-gray-700"
                            }`}
                        >
                            {formatDate(request.createdAt)}
                        </Text>
                    </View>
                )}

                {/* Media Files */}
                {request.mediaFiles && request.mediaFiles.length > 0 && (
                    <View
                        className={`rounded-lg p-4 mb-4 shadow-sm border ${
                            isDark
                                ? "bg-dark-background border-dark-border"
                                : "bg-white border-gray-200"
                        }`}
                    >
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="image"
                                size={20}
                                color={isDark ? "#B3B3B3" : "#212938"}
                            />
                            <Text
                                className={`font-mbold text-lg ml-2 ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-gray-800"
                                }`}
                            >
                                {t("request.media_files")} (
                                {request.mediaFiles.length})
                            </Text>
                        </View>
                        <View className="flex-row flex-wrap -mx-1">
                            {request.mediaFiles.map((mediaItem, index) =>
                                renderMediaThumbnail(mediaItem, index)
                            )}
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
                <View
                    className={`flex-1 ${
                        isDark ? "bg-dark-background" : "bg-black"
                    }`}
                >
                    <View className="absolute top-12 right-4 z-10">
                        <TouchableOpacity
                            onPress={closeMediaModal}
                            className={`rounded-full p-2 ${
                                isDark
                                    ? "bg-dark-surface bg-opacity-50"
                                    : "bg-black bg-opacity-50"
                            }`}
                        >
                            <MaterialIcons
                                name="close"
                                size={24}
                                color={isDark ? "#B3B3B3" : "white"}
                            />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 justify-center items-center">
                        {selectedMedia && (
                            <>
                                {isImageFile(selectedMedia) ? (
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
                                        <View
                                            className={`rounded-lg p-3 ${
                                                isDark
                                                    ? "bg-dark-surface bg-opacity-70"
                                                    : "bg-black bg-opacity-70"
                                            }`}
                                        >
                                            <Text
                                                className={`font-mregular text-center ${
                                                    isDark
                                                        ? "text-dark-text-primary"
                                                        : "text-white"
                                                }`}
                                            >
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
