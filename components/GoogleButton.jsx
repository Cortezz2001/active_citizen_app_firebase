import React from "react";
import { TouchableOpacity, Image, Text } from "react-native";

const GoogleButton = () => {
    return (
        <TouchableOpacity
            className="w-full mt-3 bg-white border border-gray-300 py-3 rounded-lg flex-row justify-center items-center"
            onPress={() => {}}
        >
            <Image
                source={require("@/assets/icons/google.png")}
                className="w-5 h-5 mr-2"
            />
            <Text className="text-black font-mmedium text-lg">Google</Text>
        </TouchableOpacity>
    );
};

export default GoogleButton;
