// /hooks/useAuth.js
import { useState, useEffect } from "react";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";

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
    };
};
