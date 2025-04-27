import { Image as RNImage } from "react-native";
export const markdownRules = {
    image: (node, styles) => {
        const { src, alt } = node.attributes;

        return (
            <RNImage
                key={src}
                source={{ uri: src }}
                style={[styles.image, { width: "100%", height: 300 }]}
                accessibilityLabel={alt}
                resizeMode="contain"
            />
        );
    },
};