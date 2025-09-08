import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import apiService from '../../services/api';

interface Asset {
  id: number;
  name: string;
  symbol: string;
  description?: string;
}

interface SignalPost {
  id: number;
  title: string;
  content: string;
  created_at: string;
  signal_type?: string;
  entry?: string;
  user: {
    username: string;
  };
  signal_provider?: {
    username: string;
  };
  asset?: {
    name: string;
  };
}


//! ApiDemo Component is not used in the app, but serves as a demo for API interactions
//! It demonstrates fetching assets, creating new assets, and generating OTPs

export const ApiDemo: React.FC = () => {
  //!========Start Pagination Functionality But Fully not implement because not used this component any page ==========
  // const [page, setPage] = useState(1);
  // const [perPage] = useState(10);

  // get all assets or signal when i am using perPage -1
  const page = 1;
  const perPage = -1;

  //!========End Pagination Functionality But Fully not implement because not used this component any page ==========

  const [assets, setAssets] = useState<Asset[]>([]);
  const [signalPosts, setSignalPosts] = useState<SignalPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');

  // Load initial data
  useEffect(() => {
    loadAssets();
    loadSignalPosts();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAssets(
        page,
        perPage
      );
      if (response.statusCode === 200) {
        setAssets(response.data || []);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      Alert.alert('Error', 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const loadSignalPosts = async () => {
    try {
      const response = await apiService.getSignalPosts(
        {
          page,
          perPage
        },
      );
      if (response.statusCode === 200) {
        setSignalPosts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading signal posts:', error);
      Alert.alert('Error', 'Failed to load signal posts');
    }
  };

  const createAsset = async () => {
    if (!newAssetName.trim()) {
      Alert.alert('Error', 'Please enter asset name');
      return;
    }

    try {
      setLoading(true);
      const response = await apiService.createAsset(newAssetName);
      if (response.statusCode === 201) {
        Alert.alert('Success', 'Asset created successfully');
        setNewAssetName('');
        loadAssets(); // Reload assets
      } else {
        Alert.alert('Error', response.message || 'Failed to create asset');
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      Alert.alert('Error', 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const generateOTP = async () => {
    try {
      setLoading(true);
      const response = await apiService.generateOtp({ mobile: '1234567890' });
      if (response.statusCode === 201) {
        Alert.alert('Success', `OTP generated: ${response.data.otp}`);
      } else {
        Alert.alert('Error', response.message || 'Failed to generate OTP');
      }
    } catch (error) {
      console.error('Error generating OTP:', error);
      Alert.alert('Error', 'Failed to generate OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Demo</Text>

      {/* OTP Generation Demo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>OTP Generation</Text>
        <Pressable style={styles.button} onPress={generateOTP} disabled={loading}>
          <Text style={styles.buttonText}>Generate OTP</Text>
        </Pressable>
      </View>

      {/* Asset Creation Demo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Create Asset</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter asset name"
          value={newAssetName}
          onChangeText={setNewAssetName}
        />
        <Pressable style={styles.button} onPress={createAsset} disabled={loading}>
          <Text style={styles.buttonText}>Create Asset</Text>
        </Pressable>
      </View>

      {/* Assets List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assets ({assets.length})</Text>
        {loading && <ActivityIndicator style={styles.loader} />}
        {assets.map((asset, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemText}>{asset.name}</Text>
            <Text style={styles.itemSubtext}>ID: {asset.id}</Text>
          </View>
        ))}
      </View>

      {/* Signal Posts List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Signal Posts ({signalPosts.length})</Text>
        {signalPosts.map((post, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemText}>{post.signal_type} - {post.asset?.name}</Text>
            <Text style={styles.itemSubtext}>Entry: {post.entry}</Text>
            <Text style={styles.itemSubtext}>Provider: {post.signal_provider?.username}</Text>
          </View>
        ))}
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  item: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemSubtext: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginVertical: 10,
  },
  spacer: {
    height: 50,
  },
});

export default ApiDemo;