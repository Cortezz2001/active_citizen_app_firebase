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

const NewsDetailsScreen = () => {
    const { t, i18n } = useTranslation();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { getDocument, getCollection } = useFirestore();
    const { user } = useAuth();
    const { updateNewsCommentCount } = useData();

    const [newsItem, setNewsItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
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
                        "categories",
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

        const fetchComments = async () => {
            try {
                setCommentsLoading(true);
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

                const commentsData = await getCollection(
                    "comments",
                    conditions
                );

                const commentsWithUsers = await Promise.all(
                    commentsData.map(async (comment) => {
                        let userName = t("anonymous");
                        let userAvatar = null;

                        if (comment.userId) {
                            const userDoc = await getDocument(
                                "users",
                                comment.userId.id
                            );
                            userName = userDoc
                                ? `${userDoc.fname} ${userDoc.lname.charAt(0)}.`
                                : t("anonymous");

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
                                        const sortedAvatars =
                                            avatarList.items.sort((a, b) =>
                                                b.name.localeCompare(a.name)
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
                                    userAvatar = null;
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

                setComments(commentsWithUsers);
                setCommentCount(commentsWithUsers.length);

                // Обновляем количество комментариев в контексте
                await updateNewsCommentCount(id);
            } catch (err) {
                console.error("Error fetching comments:", err);
            } finally {
                setCommentsLoading(false);
            }
        };

        if (id) {
            fetchNewsDetails();
            fetchComments();
        }
    }, [id]);

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
                collection(firestore, "comments"),
                comment
            );

            const userDoc = await getDocument("users", user.uid);
            const userName = userDoc
                ? `${userDoc.fname} ${userDoc.lname.charAt(0)}.`
                : t("anonymous");

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
                    userAvatar = null;
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

            // Обновляем количество комментариев в контексте
            await updateNewsCommentCount(id);
        } catch (error) {
            console.error("Error adding comment:", error);
            alert(t("comment_failed"));
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
        <View className="bg-ghostwhite p-4 rounded-lg mb-2 border border-gray-100 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center w-2/3">
                    {item.userAvatar ? (
                        <Image
                            source={{ uri: item.userAvatar }}
                            className="w-10 h-10 rounded-full mr-2"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-10 h-10 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                            <MaterialIcons
                                name="person"
                                size={24}
                                color="#6B7280"
                            />
                        </View>
                    )}
                    <Text
                        className="font-mmedium text-gray-800"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {item.userName}
                    </Text>
                </View>
                <Text className="text-gray-500 text-sm font-mmedium w-1/3 text-right">
                    {formatCommentDate(item.createdAt)}
                </Text>
            </View>
            <Text className="text-gray-700 font-mmedium">{item.content}</Text>
        </View>
    );

    if (loading) {
        return <LoadingIndicator />;
    }

    if (error || !newsItem) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <StatusBar style="dark" />
                <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white shadow-sm">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-row items-center mr-4"
                        accessibilityLabel={t("back")}
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                    <Text className="text-2xl font-mbold text-black">
                        {t("error")}
                    </Text>
                </View>
                <View className="flex-1 justify-center items-center p-4">
                    <MaterialIcons
                        name="error-outline"
                        size={64}
                        color="#EF4444"
                    />
                    <Text className="text-red-500 text-lg font-mmedium mt-4 text-center">
                        {t("news_not_found")}
                    </Text>
                    <Text className="text-gray-500 mt-2 text-center">
                        {error}
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <View className="px-6 pt-4 pb-2 flex-row items-center justify-between border-b border-gray-200 bg-white shadow-sm">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center"
                    accessibilityLabel={t("back")}
                >
                    <MaterialIcons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleShare}
                    accessibilityLabel={t("share")}
                >
                    <MaterialIcons name="share" size={24} color="#006FFD" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                <Image
                    source={{ uri: newsItem.imageUrl }}
                    className="w-full h-64"
                    resizeMode="cover"
                />

                {/* Content Section */}
                <View className="bg-white rounded-xl -mt-6 p-6 shadow-sm border border-gray-100 mb-4">
                    <Text className="text-2xl font-mbold text-gray-900 mb-3">
                        {newsItem.title[i18n.language] || newsItem.title.en}
                    </Text>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-2">
                            <MaterialIcons
                                name="category"
                                size={16}
                                color="#6B7280"
                            />
                            <Text className="text-gray-600 ml-1 text-sm font-mmedium">
                                {t("category")}:{" "}
                                {newsItem.categoryName[i18n.language] ||
                                    newsItem.categoryName.en}
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <MaterialIcons
                                name="access-time"
                                size={16}
                                color="#6B7280"
                            />
                            <Text className="text-gray-600 ml-1 text-sm font-mmedium">
                                {t("published_date")}:{" "}
                                {new Date(
                                    newsItem.createdAt.toDate()
                                ).toLocaleDateString(i18n.language)}
                            </Text>
                        </View>
                    </View>

                    <View className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-100">
                        <Text className="text-gray-800 font-mitalic">
                            {newsItem.shortDescription[i18n.language] ||
                                newsItem.shortDescription.en}
                        </Text>
                    </View>

                    <Markdown
                        style={markdownStyles}
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
                                color="#6B7280"
                            />
                            <Text className="text-gray-500 ml-1 text-sm font-mmedium">
                                {t("source")}: {newsItem.source}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Comments Section */}
                <View className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-4">
                        <MaterialIcons
                            name="comment"
                            size={24}
                            color="#374151"
                        />
                        <Text className="text-xl font-mbold text-gray-900 ml-2">
                            {t("comments")} ({commentCount})
                        </Text>
                    </View>

                    <View className="mb-4">
                        <View className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex-row items-center">
                            <TextInput
                                className="flex-1 bg-transparent"
                                placeholder={t("write_comment")}
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
                                accessibilityLabel={t("post_comment")}
                            >
                                {isCommentSubmitting ? (
                                    <ActivityIndicator
                                        size="small"
                                        color="#006FFD"
                                    />
                                ) : (
                                    <MaterialIcons
                                        name="send"
                                        size={24}
                                        color={
                                            commentText.trim()
                                                ? "#006FFD"
                                                : "#9CA3AF"
                                        }
                                    />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {commentsLoading ? (
                        <LoadingIndicator />
                    ) : comments.length > 0 ? (
                        <FlatList
                            data={comments}
                            renderItem={renderComment}
                            keyExtractor={(item) => item.id}
                            scrollEnabled={false}
                        />
                    ) : (
                        <View className="bg-gray-50 p-8 rounded-xl border border-gray-100 items-center">
                            <MaterialIcons
                                name="chat-bubble-outline"
                                size={40}
                                color="#9CA3AF"
                            />
                            <Text className="text-gray-500 text-center mt-2">
                                {t("no_comments")}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewsDetailsScreen;
