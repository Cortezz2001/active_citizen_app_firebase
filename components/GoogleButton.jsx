import { TouchableOpacity, Image, Text, ActivityIndicator } from "react-native";

const GoogleButton = ({ onPress, isDark, isLoading }) => {
    return (
        <TouchableOpacity
            className={`w-full mt-3 border ${
                isDark
                    ? "bg-dark-card border-dark-border"
                    : "bg-gray-50 border-gray-200"
            } py-3 rounded-lg flex-row justify-center items-center ${
                isLoading ? "opacity-50" : ""
            }`}
            onPress={onPress}
            disabled={isLoading}
        >
            <Image
                source={require("@/assets/icons/google.png")}
                className="w-5 h-5 mr-2"
            />
            <Text
                className={`font-mmedium text-lg ${
                    isDark ? "text-dark-text-primary" : "text-black"
                }`}
            >
                Google
            </Text>
            {isLoading && (
                <ActivityIndicator
                    animating={isLoading}
                    color={"#FFFFFF"}
                    size="small"
                    className="ml-2"
                />
            )}
        </TouchableOpacity>
    );
};

export default GoogleButton;
