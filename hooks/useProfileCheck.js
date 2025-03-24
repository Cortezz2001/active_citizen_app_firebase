import { useEffect, useState } from "react";
import { router } from "expo-router";
import { useFirestore } from "./useFirestore";
import { useAuthContext } from "@/lib/context";

export const useProfileCheck = (shouldRedirect = true) => {
  const { user, loading: authLoading } = useAuthContext();
  const { getDocument } = useFirestore();
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Check if user document exists in Firestore
        const userDoc = await getDocument("users", user.uid);
        
        if (userDoc && userDoc.fname) {
          setProfileComplete(true);
        } else if (shouldRedirect) {
          // Redirect to complete registration if document doesn't exist
          router.replace("/complete-registration");
        }
      } catch (error) {
        console.error("Error checking user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkUserProfile();
    }
  }, [user, authLoading, shouldRedirect]);

  return { profileComplete, loading: loading || authLoading };
};