import React from "react";
import { View, StyleSheet } from "react-native";
import { Shimmer } from "../home/SkeletonSignalPostCard"; // 👈 reuse the animated skeleton block

const SearchCardSkeleton = () => {
    return (
        <View style={styles.container}>
            {/* Left: Profile + Details */}
            <View style={styles.leftRow}>
                {/* Profile Image */}
                <Shimmer style={styles.profileImage} />

                {/* Name + Stats */}
                <View style={styles.infoCol}>
                    <Shimmer style={styles.username} />

                    <View style={styles.statsRow}>
                        <Shimmer style={styles.stat} />
                        <Shimmer style={styles.stat} />
                    </View>
                </View>
            </View>

            {/* Right: Success Rate */}
            <Shimmer style={styles.successRate} />
        </View>
    );
};

export default SearchCardSkeleton;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#EBF5FF",
        borderRadius: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
        width: "100%",
    },
    leftRow: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    infoCol: {
        flex: 1,
        justifyContent: "center",
    },
    username: {
        width: 120,
        height: 14,
        borderRadius: 4,
        marginBottom: 6,
    },
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    stat: {
        width: 60,
        height: 10,
        borderRadius: 4,
        marginRight: 12,
    },
    successRate: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});
