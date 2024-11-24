import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

const FormField = ({
    title,
    placeholder,
    value,
    handleChangeText,
    containerStyle,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className={`mb-4 ${containerStyle}`}>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={handleChangeText}
                secureTextEntry={title === "Password" && !showPassword}
                className="border border-gray-300 rounded-lg px-4 py-3 text-base font-mmedium"
                {...props}
            />
            {title === "Password" && (
                <TouchableOpacity
                    className="absolute right-4 top-3.5"
                    onPress={() => setShowPassword(!showPassword)}
                >
                    <FontAwesome
                        name={showPassword ? "eye" : "eye-slash"}
                        size={20}
                        color="gray"
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default FormField;
