// i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from "@react-native-firebase/auth";
import { useFirestore } from "@/hooks/useFirestore";

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import kz from "./locales/kz.json";

const STORAGE_KEY = '@app_language';

// Функция для определения языка
const detectUserLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    }
    
    const deviceLanguage = Localization.locale.split('-')[0];
    const supportedLanguages = ['en', 'ru', 'kz'];
    const languageCode = supportedLanguages.includes(deviceLanguage) 
      ? deviceLanguage 
      : 'ru';
    
    await AsyncStorage.setItem(STORAGE_KEY, languageCode);
    return languageCode;
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'ru';
  }
};

// Асинхронная инициализация i18n
const initI18n = async () => {
  const { getDocument, updateDocument } = useFirestore();
  const detectedLanguage = await detectUserLanguage();
  
  i18n.use(initReactI18next).init({
    fallbackLng: "ru",
    lng: detectedLanguage,
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      kz: { translation: kz },
    },
    interpolation: {
      escapeValue: false,
    },
  });
  
  // Синхронизация языка с Firestore при инициализации, если пользователь авторизован
  const currentUser = auth().currentUser;
  if (currentUser) {
    try {
      const userDoc = await getDocument('users', currentUser.uid);
      if (userDoc) {
        await updateDocument('users', currentUser.uid, { language: detectedLanguage });
      }
    } catch (error) {
      console.error('Error syncing language with Firestore:', error);
    }
  }
};

initI18n();

// Функция для изменения языка
export const changeLanguage = async (language) => {
  const { updateDocument } = useFirestore();
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
    i18n.changeLanguage(language);
    
    // Обновляем язык в Firestore, если пользователь авторизован
    const currentUser = auth().currentUser;
    if (currentUser) {
      await updateDocument('users', currentUser.uid, { language });
    }
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export default i18n;