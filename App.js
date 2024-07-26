import React, { useState, useEffect } from "react";
import * as MediaLibrary from 'expo-media-library';
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyDA17dBpCFCJmCSHBI5vjfTNOspv8LY_70",
  authDomain: "rn-campinapolis-pesquisa.firebaseapp.com",
  projectId: "rn-campinapolis-pesquisa",
  storageBucket: "rn-campinapolis-pesquisa.appspot.com",
  messagingSenderId: "997217497426",
  appId: "1:997217497426:web:93b0f57601fc03e8fcca8b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [uuid, setUuid] = useState("");
  const [text, setText] = useState("");
  const [pesquisaDocs, setPesquisaDocs] = useState([]);
  const filePath = `${FileSystem.documentDirectory}.uuid.txt`;
  const textFilePath = `${FileSystem.documentDirectory}.textfile.txt`;
  const [hasPermission, setHasPermission] = useState(null);


  useEffect(() => {
    const initializeUuid = async () => {
      try {
        const fileExists = await FileSystem.getInfoAsync(filePath);
        if (fileExists.exists) {
          const fileContent = await FileSystem.readAsStringAsync(filePath);
          setUuid(fileContent);
        } else {
          generateAndSaveUuid();
        }
      } catch (error) {
        console.error("Failed to read or save the UUID file", error);
      }
    };

    const readTextFromFile = async () => {
      try {
        const fileExists = await FileSystem.getInfoAsync(textFilePath);
        if (fileExists.exists) {
          const fileContent = await FileSystem.readAsStringAsync(textFilePath);
          setText(fileContent);
        }
      } catch (error) {
        console.error("Failed to read the text file", error);
      }
    };

    const fetchPesquisaDocs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pesquisa"));
        const docsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPesquisaDocs(docsArray);
      } catch (error) {
        console.error(
          "Failed to fetch documents from pesquisa collection",
          error
        );
      }
    };

    const getPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    }

    initializeUuid();
    readTextFromFile();
    fetchPesquisaDocs();
    getPermissions();
  }, []);

  const generateAndSaveUuid = async () => {
    const newUuid = Crypto.randomUUID();
    try {
      await FileSystem.writeAsStringAsync(filePath, newUuid, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      saveToMediaLibrary(filePath);
      setUuid(newUuid);
      console.log(filePath);
    } catch (error) {
      console.error("Failed to save the UUID file", error);
    }
  };

  const saveTextToFile = async () => {
    try {
      await FileSystem.writeAsStringAsync(textFilePath, text, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      console.log(textFilePath);
    } catch (error) {
      console.error("Failed to save the text file", error);
    }
  };

  const deleteFiles = async () => {
    try {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
      await FileSystem.deleteAsync(textFilePath, { idempotent: true });
      setUuid("");
      setText("");
    } catch (error) {
      console.error("Failed to delete the files", error);
    }
  };

  const saveToMediaLibrary = async (downloadedFile) => {
    if (hasPermission !== 'granted') {
      Alert.alert('Permission not granted to access media library');
      return;
    }
    try {
      //const downloadedFile = { uri: 'file://path/to/your/file' };
      const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
      const album = await MediaLibrary.getAlbumAsync('Download');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }
      //Alert.alert('File saved successfully');
    } catch (e) {
      //Alert.alert('Error saving file', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter some text"
        value={text}
        onChangeText={setText}
      />
      <Button title="Save Text to Hidden File" onPress={saveTextToFile} />
      <Button title="Generate and Save UUID" onPress={generateAndSaveUuid} />
      <Button title="Delete Files" onPress={deleteFiles} color="red" />
      {uuid ? <Text>UUID: {uuid}</Text> : null}
      {text ? <Text>Text: {text}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    width: "100%",
  },
});
