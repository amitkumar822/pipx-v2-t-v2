import React from "react";
import {
    View,
    StatusBar,
    Platform,
    StatusBarStyle,
    StyleSheet,
} from "react-native";

type AppStatusBarProps = {
    backgroundColor?: string;
    barStyle?: StatusBarStyle; // "default" | "light-content" | "dark-content"
};

export const AppStatusBar: React.FC<AppStatusBarProps> = ({
    backgroundColor = "#FFF",
    barStyle = "dark-content",
}) => {
    return (
        <>
            {/* Background behind StatusBar for Android */}
            {Platform.OS === "android" && (
                <View
                    style={[
                        styles.statusBarBackground,
                        { backgroundColor: backgroundColor },
                    ]}
                />
            )}

            <StatusBar
                translucent
                backgroundColor="transparent" // Transparent so the View shows behind
                barStyle={barStyle}
            />
        </>
    );
};

const styles = StyleSheet.create({
    statusBarBackground: {
        // height: StatusBar.currentHeight,
        width: "100%",
    },
});
