// hooks/useAuth.jsx
import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFirestore } from "@/hooks/useFirestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_GOOGLE_OAUTH_KEY,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
});

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verificationId, setVerificationId] = useState(null);
    const [hasProfile, setHasProfile] = useState(null); // Новое состояние для проверки профиля
    const { getDocument } = useFirestore();

    useEffect(() => {
        const unsubscribe = auth().onAuthStateChanged(async (authUser) => {
            console.log("OnAuthStateChanged", authUser);
            setUser(authUser);

            if (authUser) {
                try {
                    const userDoc = await getDocument("users", authUser.uid);
                    setHasProfile(!!userDoc); // true, если профиль существует, false, если нет
                } catch (error) {
                    console.error("Error checking user profile:", error);
                    setHasProfile(false); // В случае ошибки считаем, что профиля нет
                }
            } else {
                setHasProfile(null); // Если нет пользователя, сбрасываем состояние
            }

            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const refreshUser = async () => {
        const currentUser = auth().currentUser;
        if (currentUser) {
            await currentUser.reload(); // Обновляем данные из Firebase Auth
            setUser(auth().currentUser); // Устанавливаем обновленный объект user
        }
    };

    const sendPhoneVerificationCode = async (phoneNumber, userData = null) => {
        try {
            const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
            setVerificationId(confirmation.verificationId);
            await AsyncStorage.setItem("verificationId", confirmation.verificationId);
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
                currentVerificationId = await AsyncStorage.getItem("verificationId");
                if (!currentVerificationId) {
                    throw new Error("Verification session expired. Please try again.");
                }
            }

            const credential = auth.PhoneAuthProvider.credential(currentVerificationId, code);
            const userCredential = await auth().signInWithCredential(credential);

            setVerificationId(null);
            await AsyncStorage.removeItem("verificationId");

            const userDoc = await getDocument("users", userCredential.user.uid);
            setHasProfile(!!userDoc); // Обновляем состояние профиля после входа

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
    
            const googleCredential = auth.GoogleAuthProvider.credential(userInfo.data.idToken);
            console.log("Credential created");
    
            const result = await auth().signInWithCredential(googleCredential);
            console.log("Firebase auth successful");
    
            // Если у пользователя есть фото от Google, загружаем его в Storage
            if (result.user?.photoURL) {
                try {
                    console.log("Uploading Google profile photo to Storage");
                    
                    // Получаем фото из Google
                    const response = await fetch(result.user.photoURL);
                    const blob = await response.blob();
                    
                    // Создаем путь в Storage
                    const filename = `avatars/${result.user.uid}/google-profile.jpg`;
                    const storageRef = ref(storage, filename);
                    
                    // Загружаем фото в Storage
                    await uploadBytes(storageRef, blob);
                    
                    // Получаем URL загруженного фото
                    const downloadURL = await getDownloadURL(storageRef);
                    
                    // Обновляем профиль пользователя с новым URL
                    await auth().currentUser.updateProfile({
                        photoURL: downloadURL
                    });
                    
                    console.log("Google profile photo uploaded successfully");
                } catch (uploadError) {
                    console.error("Error uploading Google profile photo:", uploadError);
                    // Продолжаем без ошибки, так как это не критично
                }
            }
    
            const userDoc = await getDocument("users", result.user.uid);
            setHasProfile(!!userDoc);
    
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
            setHasProfile(null); // Сбрасываем состояние профиля при выходе
        } catch (error) {
            throw new Error(error.message);
        }
    };

    return {
        user,
        loading,
        hasProfile, // Добавляем в возвращаемые значения
        sendPhoneVerificationCode,
        verifyPhoneCode,
        logout,
        signInWithGoogle,
        refreshUser,
    };
};