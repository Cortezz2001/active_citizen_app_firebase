import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Markdown from "react-native-markdown-display";
import { markdownStyles } from "../../lib/markdownStyles";
import { markdownRules } from "../../lib/markdownRules";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../lib/themeContext";

const PrivacyPolicy = () => {
    const { t } = useTranslation();
    const { isDark } = useTheme();

    const privacyPolicyText = `
${t("privacy_policy.introduction")}

---

${t("privacy_policy.section1")}

---

${t("privacy_policy.section2")}

---

${t("privacy_policy.section3")}

---

${t("privacy_policy.section4")}

---

${t("privacy_policy.section5")}
    `;

    return (
        <SafeAreaView
            className={`flex-1 ${isDark ? "bg-dark-background" : "bg-white"}`}
        >
            <View
                className={`px-6 pt-4 pb-2 flex-row items-center border-b ${
                    isDark
                        ? "border-dark-border bg-dark-background"
                        : "border-gray-200 bg-white"
                }`}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
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
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {t("privacy_policy.title")}
                </Text>
            </View>
            <ScrollView
                className={`px-6 pt-4 flex-1 ${
                    isDark ? "bg-dark-background" : "bg-white"
                }`}
            >
                <View className="mb-4 mt-4 pb-4">
                    <Markdown
                        style={markdownStyles(isDark)}
                        mergeStyle={false}
                        rules={markdownRules}
                    >
                        {privacyPolicyText}
                    </Markdown>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default PrivacyPolicy;
