import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import Markdown from "react-native-markdown-display";
import { markdownStyles } from "../../lib/markdownStyles";
import { markdownRules } from "../../lib/markdownRules";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
    const { t } = useTranslation();

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
        <SafeAreaView className="bg-white flex-1">
            <View className="px-6 pt-4 pb-2 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center mr-4"
                >
                    <MaterialIcons name="arrow-back" size={24} />
                </TouchableOpacity>
                <Text
                    className="text-2xl font-mbold text-black"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                >
                    {t("privacy_policy.title")}
                </Text>
            </View>
            <ScrollView className="px-6 pt-4 flex-1">
                <View className="mb-4 mt-4 pb-4 ">
                    <Markdown
                        style={markdownStyles}
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
