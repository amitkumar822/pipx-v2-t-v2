import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const EndOfListComponent = () => (
  <View style={styles.container}>
    <Text style={styles.text}>🎉 You've reached the end!</Text>
    <Text style={styles.subText}>No more data to load</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center'
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666'
  },
  subText: {
    fontSize: 14,
    color: '#999',
    marginTop: 5
  }
});