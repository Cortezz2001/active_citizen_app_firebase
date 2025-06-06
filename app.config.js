export default {
  expo: {
    name: "active_citizen_app",
    slug: "active_citizen_app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icons/adaptive-icon.png",
    scheme: "active_citizen",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.cortezz2001.active-citizen",
      googleServicesFile: "./GoogleService-Info.plist",
      buildNumber: "1.0.0",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_IOS_GOOGLE_MAPS_API_KEY
      },
      icon: {
        dark: "./assets/icons/ios-dark.png",
        light: "./assets/icons/ios-light.png",
        tinted: "./assets/icons/ios-tinted.png"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/icons/adaptive-icon.png",
        monochromeImage: "./assets/icons/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.cortezz2001.active_citizen",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_ANDROID_GOOGLE_MAPS_API_KEY
        }
      },
      googleServicesFile: "./google-services.json",
      versionCode: 1
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/icons/splash-icon-light.png",
          imageWidth: 200,
          resizeMode: "contain",
          dark: {
            image: "./assets/icons/splash-icon-dark.png",
            backgroundColor: "#000000"
          },
          backgroundColor: "#ffffff"
        }
      ],
      "@react-native-firebase/app",
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          }
        }
      ],
      "@react-native-google-signin/google-signin",
      "@react-native-firebase/auth",
      [
        "expo-image-picker",
        {
          photosPermission: "The app accesses your photos to let you share them with your friends."
        }
      ],
      [
        "expo-document-picker",
        {
          iCloudContainerEnvironment: "Production"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location."
        }
      ],
        [
        "expo-video",
        {
          supportsBackgroundPlayback: true,
          supportsPictureInPicture: true
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "63ed9702-a421-4f47-a5c7-b959280b698b"
      }
    }
  }
};