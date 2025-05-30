import { Text, View, Image, Pressable, Keyboard } from "react-native";
import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { icons } from "../../constants";
import { useKeyboard } from "../../hooks/useKeyboard";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/themeContext";

const TabIcon = ({ icon, color, name, focused, isDark }) => {
    return (
        <View className="flex items-center justify-center w-16 mt-5">
            <Image
                source={icon}
                resizeMode="contain"
                style={{ tintColor: color }}
                className="w-6 h-6"
            />
            <Text
                className={`mt-1 text-xs ${
                    focused ? "font-msemibold" : "font-mregular"
                } ${isDark ? "text-dark-text-primary" : "text-black"}`}
                style={{ color }}
                numberOfLines={1}
            >
                {name}
            </Text>
        </View>
    );
};

const TabsLayout = () => {
    const { isKeyboardVisible } = useKeyboard();
    const { t } = useTranslation();
    const { isDark } = useTheme();

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: isDark ? "#0066E6" : "#006FFD",
                    tabBarInactiveTintColor: isDark ? "#A0A0A0" : "#8F9098",
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        backgroundColor: isDark ? "#0F0F0F" : "#FFFFFF",
                        borderColor: isDark ? "#1A1A1A" : "#E5E7EB",
                        borderTopWidth: 1,
                        height: 65,
                        display: isKeyboardVisible ? "none" : "flex",
                    },
                    tabBarButton: (props) => (
                        <Pressable
                            {...props}
                            android_ripple={null}
                            className="flex-1 items-center justify-center"
                        />
                    ),
                }}
            >
                <Tabs.Screen
                    name="request"
                    options={{
                        title: "Request",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.request}
                                color={color}
                                name={t("tabs_layout.request")}
                                focused={focused}
                                isDark={isDark}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="home"
                    options={{
                        title: "Home",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.home}
                                color={color}
                                name={t("tabs_layout.home")}
                                focused={focused}
                                isDark={isDark}
                            />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="profile"
                    options={{
                        title: "Profile",
                        headerShown: false,
                        tabBarIcon: ({ color, focused }) => (
                            <TabIcon
                                icon={icons.profile}
                                color={color}
                                name={t("tabs_layout.profile")}
                                focused={focused}
                                isDark={isDark}
                            />
                        ),
                    }}
                />
            </Tabs>
        </>
    );
};

export default TabsLayout;
