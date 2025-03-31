import React, { createContext, useState, useEffect, useContext } from "react";
import { Keyboard } from "react-native";

// Создаем контекст для отслеживания состояния клавиатуры
export const KeyboardContext = createContext({
    isKeyboardVisible: false
});

// Провайдер контекста, который будет использоваться в _layout.jsx
export const KeyboardProvider = ({ children }) => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    return (
        <KeyboardContext.Provider value={{ isKeyboardVisible }}>
            {children}
        </KeyboardContext.Provider>
    );
};

// Хук для использования контекста в компонентах
export const useKeyboard = () => useContext(KeyboardContext);