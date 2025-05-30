// LoadingIndicator.jsx
import { View, ActivityIndicator } from "react-native";

const LoadingIndicator = ({ isDark }) => {
    return (
        <View
            className={`flex-1 justify-center items-center ${
                isDark ? "bg-dark-background" : "bg-white"
            }`}
        >
            <ActivityIndicator
                size="large"
                color={isDark ? "#0066E6" : "#006FFD"}
            />
        </View>
    );
};

export default LoadingIndicator;
