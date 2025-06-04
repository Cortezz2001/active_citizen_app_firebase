import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,
    Share,
    TextInput,
    FlatList,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useFirestore } from "../../../hooks/useFirestore";
import { useAuth } from "../../../hooks/useAuth";
import { useData } from "../../../lib/datacontext";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { addDoc, collection, doc, serverTimestamp } from "firebase/firestore";
import { ref, getDownloadURL, listAll } from "firebase/storage";
import { firestore, storage } from "../../../lib/firebase";
import LoadingIndicator from "../../../components/LoadingIndicator";
import Markdown from "react-native-markdown-display";
import { markdownStyles } from "../../../lib/markdownStyles";
import { markdownRules } from "../../../lib/markdownRules";
import { useTheme } from "../../../lib/themeContext";

const NewsDetailsScreen = () => {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { getDocument, getCollection } = useFirestore();
    const { user } = useAuth();
    const { updateNewsCommentCount } = useData();
    const { isDark } = useTheme();

    const [newsItem, setNewsItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
    const [commentCount, setCommentCount] = useState(0);
    const [commentsPage, setCommentsPage] = useState(1);
    const [commentsPerPage] = useState(5);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

    const fetchNewsDetails = async () => {
        try {
            setLoading(true);
            const newsDoc = await getDocument("news", id);

            if (!newsDoc) {
                throw new Error("News not found");
            }

            let categoryName = {
                en: "Unknown",
                ru: "Неизвестно",
                kz: "Белгісіз",
            };
            if (newsDoc.categoryId) {
                const categoryDoc = await getDocument(
                    "news_categories",
                    newsDoc.categoryId.id
                );
                categoryName = categoryDoc?.name || categoryName;
            }

            setNewsItem({ ...newsDoc, categoryName });
        } catch (err) {
            console.error("Error fetching news details:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (page = 1) => {
        try {
            if (page === 1) {
                setCommentsLoading(true);
            } else {
                setIsLoadingMoreComments(true);
            }

            const conditions = [
                {
                    type: "where",
                    field: "parentCollection",
                    operator: "==",
                    value: "news",
                },
                {
                    type: "where",
                    field: "parentId",
                    operator: "==",
                    value: `news/${id}`,
                },
            ];

            const allComments = await getCollection(
                "news_comments",
                conditions
            );
            const totalComments = allComments.length;

            const startIndex = (page - 1) * commentsPerPage;
            const endIndex = startIndex + commentsPerPage;
            const commentsData = allComments.slice(startIndex, endIndex);

            const commentsWithUsers = await Promise.all(
                commentsData.map(async (comment) => {
                    let userName = t("news_details.anonymous");
                    let userAvatar = null;

                    if (comment.userId) {
                        const userDoc = await getDocument(
                            "users",
                            comment.userId.id
                        );
                        userName = userDoc
                            ? `${userDoc.fname} ${userDoc.lname.charAt(0)}.`
                            : t("news_details.anonymous");

                        const authUser = userDoc?.authData || {};
                        if (authUser?.photoURL) {
                            userAvatar = authUser.photoURL;
                        } else {
                            try {
                                const avatarFolderRef = ref(
                                    storage,
                                    `avatars/${comment.userId.id}/`
                                );
                                const avatarList = await listAll(
                                    avatarFolderRef
                                );
                                if (avatarList.items.length > 0) {
                                    const sortedAvatars = avatarList.items.sort(
                                        (a, b) => b.name.localeCompare(a.name)
                                    );
                                    const avatarFileRef = sortedAvatars[0];
                                    userAvatar = await getDownloadURL(
                                        avatarFileRef
                                    );
                                }
                            } catch (err) {
                                console.warn(
                                    `Avatar not found for user ${comment.userId.id}:`,
                                    err
                                );
                            }
                        }
                    }
                    return { ...comment, userName, userAvatar };
                })
            );

            commentsWithUsers.sort((a, b) => {
                const dateA = a.createdAt?.toDate
                    ? a.createdAt.toDate()
                    : new Date(a.createdAt);
                const dateB = b.createdAt?.toDate
                    ? b.createdAt.toDate()
                    : new Date(b.createdAt);
                return dateB - dateA;
            });

            if (page === 1) {
                setComments(commentsWithUsers);
            } else {
                setComments((prevComments) => [
                    ...prevComments,
                    ...commentsWithUsers,
                ]);
            }

            setHasMoreComments(endIndex < totalComments);
            setCommentCount(totalComments);
            await updateNewsCommentCount(id);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            if (page === 1) {
                setCommentsLoading(false);
            } else {
                setIsLoadingMoreComments(false);
            }
        }
    };

    useEffect(() => {
        if (id) {
            fetchNewsDetails();
            fetchComments(1);
        }
    }, [id]);

    const handleLoadMoreComments = () => {
        if (hasMoreComments && !isLoadingMoreComments && !commentsLoading) {
            setCommentsPage((prevPage) => prevPage + 1);
            fetchComments(commentsPage + 1);
        }
    };

    const handleShare = async () => {
        if (!newsItem) return;

        try {
            await Share.share({
                message: `${
                    newsItem.title[i18n.language] || newsItem.title.en
                } - ${
                    newsItem.shortDescription[i18n.language] ||
                    newsItem.shortDescription.en
                }`,
                title: newsItem.title[i18n.language] || newsItem.title.en,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        try {
            setIsCommentSubmitting(true);
            const comment = {
                content: commentText.trim(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                userId: doc(firestore, "users", user.uid),
                parentId: `news/${id}`,
                parentCollection: "news",
            };

            const docRef = await addDoc(
                collection(firestore, "news_comments"),
                comment
            );

            const userDoc = await getDocument("users", user.uid);
            const userName = userDoc
                ? `${userDoc.fname} ${userDoc.lname.charAt(0)}.`
                : t("news_details.anonymous");

            let userAvatar = null;
            if (user?.photoURL) {
                userAvatar = user.photoURL;
            } else {
                try {
                    const avatarFolderRef = ref(
                        storage,
                        `avatars/${user.uid}/`
                    );
                    const avatarList = await listAll(avatarFolderRef);
                    if (avatarList.items.length > 0) {
                        const sortedAvatars = avatarList.items.sort((a, b) =>
                            b.name.localeCompare(a.name)
                        );
                        const avatarFileRef = sortedAvatars[0];
                        userAvatar = await getDownloadURL(avatarFileRef);
                    }
                } catch (err) {
                    console.warn(`Avatar not found for user ${user.uid}:`, err);
                }
            }

            const newComment = {
                id: docRef.id,
                ...comment,
                userName,
                userAvatar,
                createdAt: new Date(),
            };

            setComments([newComment, ...comments]);
            setCommentCount((prevCount) => prevCount + 1);
            setCommentText("");
            setHasMoreComments(true);
            await updateNewsCommentCount(id);
        } catch (error) {
            console.error("Error adding comment:", error);
            alert(t("news_details.comment_failed"));
        } finally {
            setIsCommentSubmitting(false);
        }
    };

    const formatCommentDate = (timestamp) => {
        if (!timestamp) return "";

        const date = timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);

        return new Date(date).toLocaleDateString(i18n.language, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const renderComment = ({ item }) => (
        <View
            className={`p-4 rounded-lg mb-2 border shadow-sm ${
                isDark
                    ? "bg-dark-surface border-dark-border"
                    : "bg-ghostwhite border-gray-100"
            }`}
        >
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center w-2/3">
                    {item.userAvatar ? (
                        <Image
                            source={{ uri: item.userAvatar }}
                            className="w-10 h-10 rounded-full mr-2"
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            className={`w-10 h-10 rounded-full mr-2 flex items-center justify-center ${
                                isDark ? "bg-dark-border" : "bg-gray-200"
                            }`}
                        >
                            <MaterialIcons
                                name="person"
                                size={24}
                                color={isDark ? "#B3B3B3" : "#6B7280"}
                            />
                        </View>
                    )}
                    <Text
                        className={`font-mmedium ${
                            isDark ? "text-dark-text-primary" : "text-gray-800"
                        }`}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.userName}
                    </Text>
                </View>
                <Text
                    className={`text-sm font-mmedium w-1/3 text-right ${
                        isDark ? "text-dark-text-secondary" : "text-gray-500"
                    }`}
                >
                    {formatCommentDate(item.createdAt)}
                </Text>
            </View>
            <Text
                className={`font-mmedium ${
                    isDark ? "text-dark-text-primary" : "text-gray-700"
                }`}
            >
                {item.content}
            </Text>
        </View>
    );

    const renderCommentFooter = () => {
        if (!isLoadingMoreComments) return null;
        return (
            <View className="py-4 flex items-center justify-center">
                <ActivityIndicator
                    size="small"
                    color={isDark ? "#40C4FF" : "#006FFD"}
                />
            </View>
        );
    };

    if (loading) {
        return <LoadingIndicator isDark={isDark} />;
    }

    if (error || !newsItem) {
        return (
            <SafeAreaView
                className={`flex-1 ${
                    isDark ? "bg-dark-background" : "bg-gray-50"
                }`}
            >
                <View
                    className={`px-6 pt-4 pb-2 flex-row items-center border-b shadow-sm ${
                        isDark
                            ? "bg-dark-background border-dark-border"
                            : "bg-white border-gray-200"
                    }`}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mr-4"
                        accessibilityLabel={t("news_details.back")}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color={isDark ? "#FFFFFF" : "black"}
                        />
                    </TouchableOpacity>
                    <Text
                        className={`text-2xl font-mbold ${
                            isDark ? "text-dark-text-primary" : "text-black"
                        }`}
                    >
                        {t("news_details.error")}
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center p-4">
                    <MaterialIcons
                        name="error-outline"
                        size={64}
                        color={isDark ? "#FF6B6B" : "#EF4444"}
                    />
                    <Text
                        className={`text-lg font-mmedium mt-4 text-center ${
                            isDark ? "text-dark-text-primary" : "text-red-500"
                        }`}
                    >
                        {t("news_details.news_not_found")}
                    </Text>
                    <Text
                        className={`mt-2 text-center ${
                            isDark
                                ? "text-dark-text-secondary"
                                : "text-gray-500"
                        }`}
                    >
                        {error}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-gray-50"}`}
        >
            <View
                className={`px-6 pt-4 pb-2 flex-row items-center justify-between border-b shadow-sm ${
                    isDark
                        ? "bg-dark-background border-dark-border"
                        : "bg-white border-gray-200"
                }`}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center"
                    accessibilityLabel={t("news_details.back")}
                >
                    <MaterialIcons
                        name="arrow-back"
                        size={24}
                        color={isDark ? "#FFFFFF" : "black"}
                    />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleShare}
                    accessibilityLabel={t("news_details.share")}
                >
                    <MaterialIcons
                        name="share"
                        size={24}
                        color={isDark ? "#0066E6" : "#006FFD"}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                <Image
                    source={{ uri: newsItem.imageUrl }}
                    className="w-full h-64"
                    resizeMode="cover"
                />

                <View
                    className={`rounded-xl -mt-6 p-6 shadow-sm border ${
                        isDark
                            ? "bg-dark-background border-dark-border"
                            : "bg-white border-gray-100"
                    } mb-4`}
                >
                    <Text
                        className={`text-2xl font-mbold mb-3 ${
                            isDark ? "text-dark-text-primary" : "text-gray-900"
                        }`}
                    >
                        {newsItem.title[i18n.language] || newsItem.title.en}
                    </Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="category"
                                size={16}
                                color={isDark ? "#B3B3B3" : "#6B7280"}
                            />
                            <Text
                                className={`ml-1 text-sm font-mmedium ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-600"
                                }`}
                            >
                                {t("news_details.category")}:{" "}
                                {newsItem.categoryName[i18n.language] ||
                                    newsItem.categoryName.en}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="access-time"
                                size={16}
                                color={isDark ? "#B3B3B3" : "#6B7280"}
                            />
                            <Text
                                className={`ml-1 text-sm font-mmedium ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-600"
                                }`}
                            >
                                {t("news_details.published_date")}:{" "}
                                {new Date(
                                    newsItem.createdAt.toDate()
                                ).toLocaleDateString(i18n.language)}
                            </Text>
                        </View>
                    </View>

                    <View
                        className={`p-4 rounded-lg mb-6 border ${
                            isDark
                                ? "bg-dark-surface border-dark-border"
                                : "bg-gray-50 border-gray-100"
                        }`}
                    >
                        <Text
                            className={`font-mitalic ${
                                isDark
                                    ? "text-dark-text-primary"
                                    : "text-gray-800"
                            }`}
                        >
                            {newsItem.shortDescription[i18n.language] ||
                                newsItem.shortDescription.en}
                        </Text>
                    </View>

                    <Markdown
                        style={markdownStyles(isDark)}
                        mergeStyle={false}
                        rules={markdownRules}
                    >
                        {newsItem.content[i18n.language] || newsItem.content.en}
                    </Markdown>

                    {newsItem.source && (
                        <View className="flex-row items-center mb-6">
                            <MaterialIcons
                                name="link"
                                size={16}
                                color={isDark ? "#B3B3B3" : "#6B7280"}
                            />
                            <Text
                                className={`ml-1 text-sm font-mmedium ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-500"
                                }`}
                            >
                                {t("news_details.source")}: {newsItem.source}
                            </Text>
                        </View>
                    )}
                </View>

                <View
                    className={`p-6 rounded-lg shadow-sm border ${
                        isDark
                            ? "bg-dark-background border-dark-border"
                            : "bg-white border-gray-100"
                    }`}
                >
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons
                            name="comment"
                            size={24}
                            color={isDark ? "#FFFFFF" : "#374151"}
                        />
                        <Text
                            className={`text-xl font-mbold ml-2 ${
                                isDark
                                    ? "text-dark-text-primary"
                                    : "text-gray-900"
                            }`}
                        >
                            {t("news_details.comments")} ({commentCount})
                        </Text>
                    </View>

                    <View className="mb-4">
                        <View
                            className={`p-4 rounded-lg border flex-row items-center ${
                                isDark
                                    ? "bg-dark-surface border-dark-border"
                                    : "bg-gray-50 border-gray-200"
                            }`}
                        >
                            <TextInput
                                className={`flex-1 bg-transparent ${
                                    isDark
                                        ? "text-dark-text-primary"
                                        : "text-black"
                                }`}
                                placeholder={t("news_details.write_comment")}
                                placeholderTextColor={
                                    isDark ? "#666666" : "#9CA3AF"
                                }
                                value={commentText}
                                onChangeText={setCommentText}
                                multiline
                                numberOfLines={3}
                            />
                            <TouchableOpacity
                                onPress={handleAddComment}
                                disabled={
                                    !commentText.trim() || isCommentSubmitting
                                }
                                accessibilityLabel={t(
                                    "news_details.post_comment"
                                )}
                            >
                                {isCommentSubmitting ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={isDark ? "#0066E6" : "#006FFD"}
                                    />
                                ) : (
                                    <MaterialIcons
                                        name="send"
                                        size={24}
                                        color={
                                            commentText.trim()
                                                ? isDark
                                                    ? "#0066E6"
                                                    : "#006FFD"
                                                : isDark
                                                ? "#666666"
                                                : "#9CA3AF"
                                        }
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {commentsLoading ? (
                        <LoadingIndicator isDark={isDark} />
                    ) : comments.length > 0 ? (
                        <FlatList
                            data={comments}
                            renderItem={renderComment}
                            keyExtractor={(item) => item.id}
                            onEndReached={handleLoadMoreComments}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderCommentFooter}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View
                            className={`p-8 rounded-xl border items-center ${
                                isDark
                                    ? "bg-dark-surface border-dark-border"
                                    : "bg-gray-50 border-gray-100"
                            }`}
                        >
                            <MaterialIcons
                                name="chat-bubble-outline"
                                size={40}
                                color={isDark ? "#666666" : "#9CA3AF"}
                            />
                            <Text
                                className={`text-center mt-2 ${
                                    isDark
                                        ? "text-dark-text-secondary"
                                        : "text-gray-500"
                                }`}
                            >
                                {t("news_details.no_comments")}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewsDetailsScreen;
