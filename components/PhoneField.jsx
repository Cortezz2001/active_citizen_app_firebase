import { TextInput } from "react-native";
import { useState, useEffect, useRef } from "react";

export default function PhoneField({ value, handleChangeText, containerStyle, ...props }) {
    const [displayValue, setDisplayValue] = useState("");
    const [selection, setSelection] = useState({ start: 0, end: 0 });
    const inputRef = useRef(null);
    
    // Карта соответствия позиций символов в форматированной строке и в сырой строке
    const createPositionMap = (formatted) => {
        const rawToFormatted = [];
        const formattedToRaw = [];
        
        let rawIndex = 0;
        for (let i = 0; i < formatted.length; i++) {
            const char = formatted[i];
            if (char === '+' || (char >= '0' && char <= '9')) {
                rawToFormatted[rawIndex] = i;
                formattedToRaw[i] = rawIndex;
                rawIndex++;
            } else {
                formattedToRaw[i] = rawIndex - 1 >= 0 ? rawIndex - 1 : 0;
            }
        }
        
        return { rawToFormatted, formattedToRaw };
    };

    // Convert masked value back to raw phone number
    const getRawNumber = (masked) => {
        return masked.replace(/[^\d+]/g, "");
    };
    
    // Format raw phone number
    const formatPhoneNumber = (raw) => {
        if (!raw || raw.length === 0) return "";
        
        // Работаем с сырым номером без префикса
        let rawNumber = raw;
        
        // Если начинается с "+7", убираем этот префикс для дальнейшей обработки
        if (rawNumber.startsWith("+7")) {
            rawNumber = rawNumber.substring(2);
        } 
        // Если начинается с "+", заменяем на "+7"
        else if (rawNumber.startsWith("+")) {
            rawNumber = rawNumber.substring(1);
        }
        
        // Важное изменение: если первая цифра 7 и это единственная цифра или за ней следуют другие цифры,
        // считаем это первой цифрой номера, а не кодом страны
        let prefix = "+7";
        let digits = rawNumber;
        
        // Форматируем номер с обязательным префиксом +7
        let formatted = prefix;
        
        if (digits.length > 0) {
            formatted += " (" + digits.substring(0, 3);
        }
        if (digits.length > 3) {
            formatted += ") " + digits.substring(3, 6);
        }
        if (digits.length > 6) {
            formatted += "-" + digits.substring(6, 8);
        }
        if (digits.length > 8) {
            formatted += "-" + digits.substring(8, 10);
        }
        
        return formatted;
    };

    useEffect(() => {
        if (value) {
            // Проверяем, начинается ли значение с "+7"
            let formattedValue = value;
            if (!value.startsWith("+")) {
                formattedValue = "+7" + value;
            } else if (!value.startsWith("+7") && value.startsWith("+")) {
                formattedValue = "+7" + value.substring(1);
            }
            setDisplayValue(formatPhoneNumber(formattedValue));
        } else {
            setDisplayValue("");
        }
    }, [value]);

    const handleChange = (text) => {
        // Сохраняем текущую позицию курсора
        const currentSelection = selection;
        const oldFormatted = displayValue;
        const oldRaw = getRawNumber(oldFormatted);
        
        // Определяем, удаляет ли пользователь символы (backspace)
        const isDeleting = text.length < oldFormatted.length;
        
        if (isDeleting) {
            // Находим позицию в "сыром" номере на основе текущей позиции курсора
            const { formattedToRaw } = createPositionMap(oldFormatted);
            const rawPos = formattedToRaw[currentSelection.start - 1];
            
            // Создаем новую "сырую" строку с удаленным символом
            let newRaw = "";
            
            // Если удаляем +7 целиком
            if (currentSelection.start <= 2) {
                newRaw = "";
            } else {
                // Удаляем символ в позиции rawPos
                newRaw = oldRaw.substring(0, rawPos) + oldRaw.substring(rawPos + 1);
            }
            
            // Форматируем новую строку
            const newFormatted = formatPhoneNumber(newRaw);
            
            // Рассчитываем новую позицию курсора
            const { rawToFormatted } = createPositionMap(newFormatted);
            let newCursorPos = rawPos > 0 ? (rawToFormatted[rawPos - 1] + 1) : 0;
            
            // Если строка пуста, устанавливаем курсор в начало
            if (newFormatted.length === 0) {
                newCursorPos = 0;
            }
            
            // Если строка стала "+7", устанавливаем курсор после него
            if (newFormatted === "+7") {
                newCursorPos = 2;
            }
            
            setDisplayValue(newFormatted);
            
            // Для Firebase передаем полный номер с префиксом "+7"
            const rawForParent = getRawNumber(newFormatted);
            handleChangeText(rawForParent);
            
            // Нужно выполнить асинхронно для корректного выставления курсора
            setTimeout(() => {
                inputRef.current?.setNativeProps({ 
                    selection: { start: newCursorPos, end: newCursorPos } 
                });
            }, 0);
            
            return;
        }
        
        // Получаем новое "сырое" значение
        let rawNumber = getRawNumber(text);
        
        // Если пользователь вводит первую цифру и это 7, то считаем это первой цифрой номера, а не кодом страны
        if (oldRaw === "+7" && rawNumber === "+77") {
            rawNumber = "+7" + "7"; // Добавляем 7 как первую цифру после кода
        }
        
        // Форматируем номер по маске
        const formattedText = formatPhoneNumber(rawNumber);
        setDisplayValue(formattedText);
        
        // Вычисляем новую позицию курсора после форматирования
        const { rawToFormatted } = createPositionMap(formattedText);
        const rawPos = Math.min(currentSelection.start, rawNumber.length - 1);
        let newCursorPos = rawPos >= 0 ? rawToFormatted[rawPos] + 1 : formattedText.length;
        
        // Для Firebase передаем полный номер с префиксом "+7"
        const rawForParent = getRawNumber(formattedText);
        handleChangeText(rawForParent);
        
        // Нужно выполнить асинхронно для корректного выставления курсора
        setTimeout(() => {
            inputRef.current?.setNativeProps({ 
                selection: { start: newCursorPos, end: newCursorPos } 
            });
        }, 0);
    };

    return (
        <TextInput
            ref={inputRef}
            value={displayValue}
            onChangeText={handleChange}
            onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
            keyboardType="phone-pad"
            maxLength={18} // Length of "+7 (999) 999-99-99"
            placeholder="+7 (___) ___-__-__"
            className={`border border-gray-300 rounded-lg px-4 py-3 text-black font-mmedium ${containerStyle}`}
            {...props}
        />
    );
}