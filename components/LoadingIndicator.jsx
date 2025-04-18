import { View, ActivityIndicator } from "react-native";

const LoadingIndicator = () => {
    return (
        <>
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#006FFD" />
            </View>
        </>
    );
};

export default LoadingIndicator;
