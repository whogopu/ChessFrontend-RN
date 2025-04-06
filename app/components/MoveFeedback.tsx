import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MoveFeedback = ({ feedback }) => {
    if (!feedback) return null;

    const { type, message, pv } = feedback;

    return (
        <View style={styles.container}>
            <Text style={styles.message}>{message}</Text>
            {false && pv?.length > 1 && (
                <Text style={styles.pvLine}>
                    PV: {pv.slice(0, 6).join(', ')}...
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        paddingHorizontal: 16,
    },
    message: {
        fontSize: 16,
        fontWeight: '500',
    },
    pvLine: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
});

export default MoveFeedback;
