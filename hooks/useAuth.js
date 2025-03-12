// /hooks/useAuth.js
import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_GOOGLE_OAUTH_KEY } from "@env"

GoogleSignin.configure({
    webClientId:
    FIREBASE_GOOGLE_OAUTH_KEY,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verificationId, setVerificationId] = useState(null);
    const [userDataForSignUp, setUserDataForSignUp] = useState(null);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged((user) => {
            console.log("OnAuthStateChanged", user);
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const sendPhoneVerificationCode = async (phoneNumber, userData = null) => {
        try {
            // Save additional user data if provided (for sign up)
            if (userData) {
                setUserDataForSignUp(userData);
                await AsyncStorage.setItem('userDataForSignUp', JSON.stringify(userData));
            }

            // Request verification code
            const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
            setVerificationId(confirmation.verificationId);
            await AsyncStorage.setItem('verificationId', confirmation.verificationId);
            return confirmation;
        } catch (error) {
            console.error("Phone verification error:", error);
            throw error;
        }
    };

    const verifyPhoneCode = async (code) => {
        try {
            // Get the verification ID from state or storage
            let currentVerificationId = verificationId;
            if (!currentVerificationId) {
                currentVerificationId = await AsyncStorage.getItem('verificationId');
                if (!currentVerificationId) {
                    throw new Error("Verification session expired. Please try again.");
                }
            }

            // Create credential
            const credential = auth.PhoneAuthProvider.credential(
                currentVerificationId,
                code
            );

            // Sign in with credential
            const userCredential = await auth().signInWithCredential(credential);
            
            // Check if this is a sign up (we have user data)
            let userData = userDataForSignUp;
            if (!userData) {
                const storedUserData = await AsyncStorage.getItem('userDataForSignUp');
                if (storedUserData) {
                    userData = JSON.parse(storedUserData);
                }
            }

            // If we have user data, update the profile (this was a sign up)
            if (userData && userData.name) {
                await userCredential.user.updateProfile({
                    displayName: userData.name
                });
                
                // Clear stored data
                setUserDataForSignUp(null);
                await AsyncStorage.removeItem('userDataForSignUp');
            }

            // Clear verification ID
            setVerificationId(null);
            await AsyncStorage.removeItem('verificationId');

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
            console.log("Play Services OK");

            await GoogleSignin.signOut();
            console.log("Signed out from previous session");

            const userInfo = await GoogleSignin.signIn();
            console.log("Sign in successful, userInfo:", userInfo);

            if (!userInfo?.data?.idToken) {
                console.error("No idToken received");
                throw new Error("No ID token received");
            }

            const googleCredential = auth.GoogleAuthProvider.credential(
                userInfo.data.idToken
            );
            console.log("Credential created");

            const result = await auth().signInWithCredential(googleCredential);
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
            await auth().signOut();
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