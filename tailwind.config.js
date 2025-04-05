/** @type {import("tailwindcss").Config} */
module.exports = {
    content: [
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#006FFD",
                ghostwhite: "#F8F9FE",
                secondary: {
                    DEFAULT: "#FFFFFF",
                    RED: "#FF6B6B",
                },
            },
            fontFamily: {
                mthin: ["Montserrat-Thin", "sans-serif"],
                mextralight: ["Montserrat-ExtraLight", "sans-serif"],
                mlight: ["Montserrat-Light", "sans-serif"],
                mregular: ["Montserrat-Regular", "sans-serif"],
                mmedium: ["Montserrat-Medium", "sans-serif"],
                msemibold: ["Montserrat-SemiBold", "sans-serif"],
                mbold: ["Montserrat-Bold", "sans-serif"],
                mextrabold: ["Montserrat-ExtraBold", "sans-serif"],
                mblack: ["Montserrat-Black", "sans-serif"],
            },
        },
    },
    plugins: [],
};
