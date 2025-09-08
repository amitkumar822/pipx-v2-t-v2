/**
 * This file contains patches for the react-native-css-interop module
 * to fix issues with SafeAreaProvider and prevent crashes.
 */

// Apply patches when the app starts
export function applyPatches() {
  try {
    patchSafeAreaContext();
    // console.log('Successfully applied react-native-css-interop patches');
    return true;
  } catch (error) {
    console.error('Failed to apply react-native-css-interop patches:', error);
    return false;
  }
}

// Patch the SafeAreaContext integration
function patchSafeAreaContext() {
  try {
    // Get the module path
    const cssInteropPath = require('react-native-css-interop/dist/runtime/third-party-libs/react-native-safe-area-context.native');
    // const cssInteropPath = require.resolve('react-native-css-interop/dist/runtime/third-party-libs/react-native-safe-area-context.native');
    
    if (!cssInteropPath) {
      console.warn('Could not resolve react-native-css-interop module path');
      return false;
    }
    
    // Get the module
    const cssInteropModule = require('react-native-css-interop/dist/runtime/third-party-libs/react-native-safe-area-context.native');
    
    if (!cssInteropModule) {
      console.warn('Could not load react-native-css-interop module');
      return false;
    }
    
    // Check if the function exists
    if (typeof cssInteropModule.maybeHijackSafeAreaProvider !== 'function') {
      console.warn('maybeHijackSafeAreaProvider function not found in module');
      return false;
    }
    
    // Save the original function
    const originalFunction = cssInteropModule.maybeHijackSafeAreaProvider;
    
    // Replace with a safer version
    cssInteropModule.maybeHijackSafeAreaProvider = function(type) {
      // Add null/undefined check to prevent "Cannot read property 'displayName' of undefined" error
      if (!type) {
        console.log('SafeAreaProvider fix: Prevented crash on undefined type');
        return type;
      }
      
      // Add type check to ensure type is an object with displayName or name properties
      if (typeof type !== 'object' && typeof type !== 'function') {
        // console.log('SafeAreaProvider fix(patches): Type is not an object or function');
        return type;
      }
      
      try {
        return originalFunction(type);
      } catch (error) {
        // console.warn('Error in maybeHijackSafeAreaProvider:', error);
        return type; // Return the original type if the function fails
      }
    };
    
    // console.log('Successfully patched maybeHijackSafeAreaProvider function');
    return true;
  } catch (patchError) {
    console.warn('Failed to patch CSS interop module:', patchError);
    return false;
  }
}