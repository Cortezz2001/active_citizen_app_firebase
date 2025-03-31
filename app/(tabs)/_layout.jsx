import { Text, View, Image, Pressable, Keyboard } from "react-native";
import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { icons } from "../../constants";
import { useKeyboard } from "../../hooks/useKeyboard";

const TabIcon = ({ icon, color, name, focused }) => {
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
                }`}
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

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarActiveTintColor: "#006FFD",
                    tabBarInactiveTintColor: "#8F9098",
                    tabBarShowLabel: false,
                    tabBarStyle: {
                        borderTopWidth: 1,
                        height: 65,
                        // Скрываем tabBar, когда клавиатура видима
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
                                name="Request"
                                focused={focused}
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
                                name="Home"
                                focused={focused}
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
                                name="Profile"
                                focused={focused}
                            />
                        ),
                    }}
                />
            </Tabs>

            <StatusBar backgroundColor="#161622" style="light" />
        </>
    );
};

export default TabsLayout;
