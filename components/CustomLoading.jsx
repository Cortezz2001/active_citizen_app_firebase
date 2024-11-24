import { View, Animated, Easing, StyleSheet } from "react-native";
import { useEffect, useRef } from "react";

function CustomLoadingIndicator() {
    const spinValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
    });

    return (
        <View style={styles.loadingContainer}>
            <Animated.View
                style={[
                    styles.spinner,
                    {
                        transform: [{ rotate: spin }],
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    spinner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 4,
        borderColor: "#f0f0f0",
        borderTopColor: "#3498db",
        borderRightColor: "#3498db",
    },
});

export default CustomLoadingIndicator;
