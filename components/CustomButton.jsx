import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

const CustomButton = ({
    title,
    handlePress,
    containerStyles,
    textStyles,
    isLoading,
    isDark,
}) => {
    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.7}
            className={`rounded-xl flex flex-row justify-center items-center ${
                isDark ? "bg-dark-primary" : "bg-primary"
            } ${containerStyles} ${isLoading ? "opacity-50" : ""}`}
            disabled={isLoading}
        >
            <Text
                className={`font-msemibold text-center ${
                    isDark ? "text-dark-text-primary" : "text-secondary"
                } ${textStyles}`}
            >
                {title}
            </Text>
            {isLoading && (
                <ActivityIndicator
                    animating={isLoading}
                    color={isDark ? "#FFFFFF" : "#006FFD"}
                    size="small"
                    className="ml-2"
                />
            )}
        </TouchableOpacity>
    );
};

export default CustomButton;
