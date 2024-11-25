// /hooks/useAuth.js
import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
    webClientId:
        "580808811102-1i0eh9jddquttvoejum85o4kb0smsh07.apps.googleusercontent.com",
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged((user) => {
            console.log("OnAuthStateChanged", user);
            setUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            console.log("Starting Google Sign In process");

            await GoogleSignin.hasPlayServices();
            console.log("Play Services OK");

            await GoogleSignin.signOut();
            console.log("Signed out from previous session");

            const userInfo = await GoogleSignin.signIn();
            console.log("Sign in successful, userInfo:", userInfo);

            // Изменим эту проверку
            if (!userInfo?.data?.idToken) {
                console.error("No idToken received");
                throw new Error("No ID token received");
            }

            // И здесь используем правильный путь к токену
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

    const signUp = async (email, password, username, avatarUri = null) => {
        try {
            const { user: newUser } =
                await auth().createUserWithEmailAndPassword(email, password);

            let photoURL = null;

            if (avatarUri) {
                const reference = storage().ref(`avatars/${newUser.uid}`);
                await reference.putFile(avatarUri);
                photoURL = await reference.getDownloadURL();
            }

            await newUser.updateProfile({
                displayName: username,
                photoURL: photoURL,
            });

            return newUser;
        } catch (error) {
            throw new Error(error.message);
        }
    };

    const signIn = async (email, password) => {
        try {
            const { user } = await auth().signInWithEmailAndPassword(
                email,
                password
            );
            return user;
        } catch (error) {
            throw new Error(error.message);
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
        signUp,
        signIn,
        logout,
        signInWithGoogle,
    };
};
