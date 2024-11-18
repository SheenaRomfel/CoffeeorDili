import React, { useState } from "react";
import { View, Button, Image, Text, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker"; // Use expo-image-picker
import axios from "axios"; // For HTTP requests

const App = () => {
  const [imageUri, setImageUri] = useState(null); // State for image URI
  const [result, setResult] = useState(null); // State for result from API
  const [error, setError] = useState(null); // State for error handling

  // Function to scan the image using the camera
  const scanImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Camera permission is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri); // Set the image URI for preview
      sendImageToRoboflow(result.assets[0]); // Send the image for processing
    }
  };

  // Function to send the image to Roboflow for detection
  const sendImageToRoboflow = async (asset) => {
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", {
      uri: asset.uri,
      name: "leaf.jpg", // Name the file properly
      type: "image/jpeg", // Ensure proper MIME type
    });

    try {
      const response = await axios({
        method: "POST",
        url: "https://detect.roboflow.com/leaf-detection-r0kih/2",
        params: { api_key: "" },
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data); // Set the result from the API
    } catch (err) {
      setError(err.message); // Handle errors
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaf Detection</Text>
      <Button title="Scan Image" onPress={scanImage} />

      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Detection Result:</Text>
          <Text style={styles.resultText}>{JSON.stringify(result, null, 2)}</Text>
        </View>
      )}

      {error && <Text style={styles.errorText}>Error: {error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imagePreview: {
    width: 200,
    height: 200,
    marginVertical: 20,
    borderRadius: 10,
  },
  resultContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  resultText: {
    fontSize: 14,
    marginTop: 5,
    color: "#333",
  },
  errorText: {
    color: "red",
    marginTop: 20,
  },
});

export default App;
