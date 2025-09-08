import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
  }
};

export const storeObjData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    // saving error
  }
};

export const getStorageData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return value;
    }
    return null;
  } catch (e) {
    return null;
  }
};

export const getStorageObjData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    return null;
  }
};

export const clearStore = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    return null;
  }
};

export const getMultiple = async (keys = []) => {
  try {
    const values = await AsyncStorage.multiGet(keys);
    return values;
  } catch (error) {
    console.error("Storage error in getMultiple:", error);
    // Return safe fallback instead of undefined
    return keys.map((key) => [key, null]);
  }
  // example console.log output:
  // [ ['@MyApp_user', 'myUserValue'], ['@MyApp_key', 'myKeyValue'] ]
};
