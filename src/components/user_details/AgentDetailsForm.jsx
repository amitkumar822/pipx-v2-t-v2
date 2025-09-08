import { View, Text, StyleSheet, Pressable } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import Buttons from './helper/Buttons';
import TextField from './helper/TextField';

const AgentDetailsForm = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your details</Text>
      {/* <Text style={styles.subtitle}>Lorem ipsum dolor sit amet, adipiscing elit, sed eiusmod tempor incididunt.</Text> */}
      <TextField placeholder="First name" />
      <TextField placeholder="Last name" />
      <TextField placeholder="Birthday (mm/dd/yyyy)" />
      <TextField placeholder="Gender" />

      <Pressable style={styles.uploadBtn}>
        <Text style={styles.uploadText}>Upload a verified document</Text>
        <Ionicons name="attach" size={20} color="#888" />
      </Pressable>

      <Buttons onPress={() => {}} />
    </View>
  );
};

export default AgentDetailsForm;

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#666', marginBottom: 16 },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#333',
  },
});
