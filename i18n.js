import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from "./locales/en.json";
import ru from "./locales/ru.json";
import kz from "./locales/kz.json";

const STORAGE_KEY = '@app_language';

// Функция для определения языка
const detectUserLanguage = async () => {
  try {
    // Проверяем, есть ли сохраненный язык
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    }
    
    // Получаем язык устройства
    const deviceLanguage = Localization.locale.split('-')[0];
    
    // Проверяем, поддерживается ли язык устройства
    const supportedLanguages = ['en', 'ru', 'kz'];
    const languageCode = supportedLanguages.includes(deviceLanguage) 
      ? deviceLanguage 
      : 'ru'; // Русский как язык по умолчанию
    
    // Сохраняем выбранный язык
    await AsyncStorage.setItem(STORAGE_KEY, languageCode);
    
    return languageCode;
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'ru';
  }
};

// Асинхронная инициализация i18n
const initI18n = async () => {
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
};

// Инициализируем i18n
initI18n();

// Функция для изменения языка
export const changeLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, language);
    i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export default i18n;