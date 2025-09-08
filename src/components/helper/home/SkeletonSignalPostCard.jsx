import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export const Shimmer = ({ style }) => {
    const shimmerAnim = useRef(new Animated.Value(-1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = shimmerAnim.interpolate({
        inputRange: [-1, 1],
        outputRange: [-width, width],
    });

    return (
        <View style={[style, { overflow: "hidden", backgroundColor: "#E0E0E0" }]}>
            <Animated.View
                style={{
                    flex: 1,
                    transform: [{ translateX }],
                }}
            >
                <LinearGradient
                    colors={["transparent", "rgba(255,255,255,0.5)", "transparent"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>
        </View>
    );
};

const SkeletonSignalPostCard = () => {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.profileRow}>
                    <Shimmer style={styles.profileImage} />
                    <View>
                        <Shimmer style={styles.username} />
                        <Shimmer style={styles.userType} />
                    </View>
                </View>
                <Shimmer style={styles.dotBtn} />
            </View>

            {/* Feed */}
            <View style={styles.feed}>
                <Shimmer style={styles.feedTitle} />

                <View style={styles.feedBox}>
                    {/* Header Row */}
                    <View style={styles.feedHeaderRow}>
                        <View style={styles.currencyRow}>
                            <Shimmer style={styles.currencyName} />
                            <Shimmer style={styles.currencyDir} />
                        </View>
                        <Shimmer style={styles.signalType} />
                    </View>

                    {/* Data Row */}
                    <View style={styles.dataRow}>
                        {/* Left */}
                        <View style={styles.leftCol}>
                            <Shimmer style={styles.textRow} />
                            <Shimmer style={styles.textRow} />
                            <Shimmer style={styles.textRow} />
                            <Shimmer style={styles.textRow} />
                        </View>

                        {/* Right */}
                        <View style={styles.rightCol}>
                            <Shimmer style={styles.dateBox} />
                            <Shimmer style={styles.chartBox} />
                        </View>
                    </View>
                </View>
            </View>

            {/* Comment Input */}
            <View style={styles.commentRow}>
                <Shimmer style={styles.commentIcon} />
                <Shimmer style={styles.commentInput} />
                <Shimmer style={styles.sendBtn} />
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
                <Shimmer style={styles.actionBtn} />
                <Shimmer style={styles.actionBtn} />
                <Shimmer style={styles.actionBtn} />
            </View>
        </View>
    );
};

export default SkeletonSignalPostCard;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        backgroundColor: "#EBF5FF",
        borderRadius: 12,
        padding: 8,
        marginBottom: 12,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
        alignItems: "center",
    },
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#E0E0E0",
        marginRight: 8,
    },
    username: {
        width: 100,
        height: 12,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
        marginBottom: 4,
    },
    userType: {
        width: 70,
        height: 10,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
    },
    dotBtn: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#E0E0E0",
    },
    feed: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 8,
    },
    feedTitle: {
        width: 80,
        height: 14,
        backgroundColor: "#E0E0E0",
        borderRadius: 4,
        marginBottom: 8,
    },
    feedBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 8,
    },
    feedHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    currencyRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    currencyName: {
        width: 80,
        height: 12,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
        marginRight: 6,
    },
    currencyDir: {
        width: 40,
        height: 12,
        borderRadius: 4,
        backgroundColor: "#C8E6C9",
    },
    signalType: {
        width: 60,
        height: 12,
        borderRadius: 4,
        backgroundColor: "#BBDEFB",
    },
    dataRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    leftCol: {
        width: "45%",
    },
    textRow: {
        width: "100%",
        height: 10,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
        marginBottom: 6,
    },
    rightCol: {
        width: "50%",
        alignItems: "center",
    },
    dateBox: {
        width: "80%",
        height: 12,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
        marginBottom: 8,
    },
    chartBox: {
        width: "80%",
        height: 60,
        borderRadius: 6,
        backgroundColor: "#E0E0E0",
    },
    commentRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        borderRadius: 12,
        padding: 8,
        marginTop: 12,
    },
    commentIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: "#E0E0E0",
    },
    commentInput: {
        flex: 1,
        height: 14,
        marginHorizontal: 8,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
    },
    sendBtn: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#E0E0E0",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12,
        paddingHorizontal: 4,
    },
    actionBtn: {
        width: 80,
        height: 10,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
    },
});
