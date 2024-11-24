import { Redirect, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// import { Loader } from "../../components";
// import { useGlobalContext } from "../../context/GlobalProvider";

const AuthLayout = () => {
    //   const { loading, isLogged } = useGlobalContext();

    //   if (!loading && isLogged) return <Redirect href="/home" />;

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
            </Stack>

            {/* <Loader isLoading={loading} /> */}
            <StatusBar style="dark" />
        </>
    );
};

export default AuthLayout;
