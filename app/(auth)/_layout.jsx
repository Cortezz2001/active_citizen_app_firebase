import { Stack } from "expo-router";

const AuthLayout = () => {
    return (
        <>
            <Stack screenOptions={{ animation: "slide_from_right" }}>
                <Stack.Screen
                    name="sign-in"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="sign-up"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="sms-code"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="complete-registration"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </>
    );
};

export default AuthLayout;
