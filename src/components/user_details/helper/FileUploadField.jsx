// import React, { useState } from "react";
// import { View, Text, Pressable, StyleSheet } from "react-native";
// import * as DocumentPicker from "expo-document-picker";
// import { MaterialIcons } from "@expo/vector-icons"; // ✅ Icon used

// const FileUploadField = ({ onFileSelect }) => {
//   const [file, setFile] = useState(null);

//   const handlePickFile = async () => {
//     try {
//       const result = await DocumentPicker.getDocumentAsync({
//         type: [
//           "application/pdf",
//           "application/msword",
//           "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//         ],
//         copyToCacheDirectory: true,
//         multiple: false,
//       });

//       if (result?.assets?.length) {
//         const pickedFile = result.assets[0];
//         setFile(pickedFile);
//         onFileSelect?.(pickedFile);
//       }
//     } catch (err) {
//       console.error("Error selecting file:", err);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Pressable style={styles.uploadBtn} onPress={handlePickFile}>
//         <Text style={styles.uploadText}>
//           {file?.name || "Upload a verified document"}
//         </Text>
//         <MaterialIcons name="upload-file" size={20} color="#666" />
//       </Pressable>
//     </View>
//   );
// };

// export default FileUploadField;

// const styles = StyleSheet.create({
//   container: {
//     marginTop: 20,
//   },
//   uploadBtn: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderColor: "#ccc",
//     borderWidth: 1,
//     borderRadius: 12,
//     backgroundColor: "#fff",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//   },
//   uploadText: {
//     fontSize: 14,
//     color: "#000",
//     fontWeight: "500",
//   },
// });


import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { MaterialIcons } from "@expo/vector-icons"; // ✅ Icon used

/**
 * Converts a local file URI to a Blob for FormData upload
 */
const uriToBlob = async (uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

const FileUploadField = ({ onFileSelect }) => {
  const [file, setFile] = useState(null);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result?.assets?.length) {
        const pickedFile = result.assets[0];

        // ✅ Convert to Blob immediately for FormData
        const blob = await uriToBlob(pickedFile.uri);

        // const fileForUpload = {
        //   name: pickedFile.name || "document.pdf",
        //   type: pickedFile.mimeType || "application/pdf",
        //   blob,
        // };

        onFileSelect?.({
          uri: pickedFile.uri,
          name: pickedFile.name,
          type: pickedFile.mimeType || "application/pdf"
        });

        setFile(pickedFile);
        // onFileSelect?.(fileForUpload); // Pass ready-to-append file to parent
      }
    } catch (err) {
      console.error("Error selecting file:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.uploadBtn} onPress={handlePickFile}>
        <Text style={styles.uploadText}>
          {file?.name || "Upload a verified document"}
        </Text>
        <MaterialIcons name="upload-file" size={20} color="#666" />
      </Pressable>
    </View>
  );
};

export default FileUploadField;

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  uploadBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  uploadText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "500",
  },
});
