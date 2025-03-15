// /hooks/useAuth.js
import { useState, useEffect } from "react";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    PhoneAuthProvider,
    signInWithCredential,
    signInWithPhoneNumber,
    GoogleAuthProvider,
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_OAUTH_KEY,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verificationId, setVerificationId] = useState(null);
    const [userDataForSignUp, setUserDataForSignUp] = useState(null);

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("OnAuthStateChanged", user);
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const sendPhoneVerificationCode = async (phoneNumber, userData = null) => {
        try {
            if (userData) {
                setUserDataForSignUp(userData);
                await AsyncStorage.setItem(
                    "userDataForSignUp",
                    JSON.stringify(userData)
                );
            }

            const auth = getAuth();
            const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
            setVerificationId(confirmation.verificationId);
            await AsyncStorage.setItem(
                "verificationId",
                confirmation.verificationId
            );
            return confirmation;
        } catch (error) {
            console.error("Phone verification error:", error);
            throw error;
        }
    };

    const verifyPhoneCode = async (code) => {
        try {
            let currentVerificationId = verificationId;
            if (!currentVerificationId) {
                currentVerificationId = await AsyncStorage.getItem(
                    "verificationId"
                );
                if (!currentVerificationId) {
                    throw new Error(
                        "Verification session expired. Please try again."
                    );
                }
            }

            const auth = getAuth();
            const credential = PhoneAuthProvider.credential(
                currentVerificationId,
                code
            );
            const userCredential = await signInWithCredential(auth, credential);

            let userData = userDataForSignUp;
            if (!userData) {
                const storedUserData = await AsyncStorage.getItem(
                    "userDataForSignUp"
                );
                if (storedUserData) {
                    userData = JSON.parse(storedUserData);
                }
            }

            if (userData && userData.name) {
                await userCredential.user.updateProfile({
                    displayName: userData.name,
                });
                setUserDataForSignUp(null);
                await AsyncStorage.removeItem("userDataForSignUp");
            }

            setVerificationId(null);
            await AsyncStorage.removeItem("verificationId");

            return userCredential.user;
        } catch (error) {
            console.error("Phone verification error:", error);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            console.log("Starting Google Sign In process");
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.signOut();
            const userInfo = await GoogleSignin.signIn();
            console.log("Sign in successful, userInfo:", userInfo);

            if (!userInfo?.data?.idToken) {
                console.error("No idToken received");
                throw new Error("No ID token received");
            }
            const auth = getAuth();
            const googleCredential = GoogleAuthProvider.credential(
                userInfo.data.idToken
            );
            console.log("Credential created");

            const result = await signInWithCredential(auth, googleCredential);
            console.log("Firebase auth successful");

            return result;
        } catch (error) {
            console.error("Detailed error:", {
                name: error.name,
                message: error.message,
                code: error.code,
                stack: error.stack,
            });
            throw error;
        }
    };

    const logout = async () => {
        try {
            const auth = getAuth();
            await signOut(auth);
        } catch (error) {
            throw new Error(error.message);
        }
    };

    return {
        user,
        loading,
        sendPhoneVerificationCode,
        verifyPhoneCode,
        logout,
        signInWithGoogle,
    };
};
