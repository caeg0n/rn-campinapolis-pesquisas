import React, { useState, useEffect, useRef } from "react";
import * as MediaLibrary from "expo-media-library";
import { StyleSheet, Text, View, TextInput, Button, Alert } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  // setDoc,
  // deleteDoc,
  // doc,
} from "firebase/firestore";
// import { StatusBar } from "expo-status-bar";

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
  //state
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [newUuid, setNewUuid] = useState(null);
  const [localUuidFromFile, setLocalUuidFromFile] = useState(null);
  const [fileSystemUuid, setFileSystemUuid] = useState("");
  const [pesquisaDocs, setPesquisaDocs] = useState([]);
  //ref
  const localFilePath = useRef(`${FileSystem.documentDirectory}uuid.txt`);
  const fileMediaPath = useRef(null);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === "granted");
    };

    const initializeUuid = async () => {
      const info = await FileSystem.getInfoAsync(localFilePath.current);
      if (info.exists) {
        const fileContent = await FileSystem.readAsStringAsync(
          localFilePath.current
        );
        setLocalUuidFromFile(fileContent);
      } else {
        generateNewUuid();
      }
    };

    // const fetchPesquisaDocs = async () => {
    //   try {
    //     const querySnapshot = await getDocs(collection(db, "pesquisa"));
    //     const docsArray = querySnapshot.docs.map((doc) => ({
    //       id: doc.id,
    //       ...doc.data(),
    //     }));
    //     setPesquisaDocs(docsArray);
    //   } catch (error) {
    //     console.error(
    //       "Failed to fetch documents from pesquisa collection",
    //       error
    //     );
    //   }
    // };

    getPermissions();
    initializeUuid();
    //fetchPesquisaDocs();
    //getMediaPath();
  }, []);

  const generateNewUuid = async () => {
    const newUuid = Crypto.randomUUID();
    await saveUuid(newUuid);
    setNewUuid(newUuid);
  };

  // const getMediaPath = async () => {
  //   const asset = await MediaLibrary.createAssetAsync(filePath);
  //   fileMediaPath.current = asset.uri;
  // }

  const saveUuid = async (uuid) => {
    await FileSystem.writeAsStringAsync(localFilePath.current, uuid, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    // saveToMediaLibrary(filePath);
  };

  const deleteLocalFile = async () => {
    await FileSystem.deleteAsync(localFilePath.current, { idempotent: true });
  };

  // const saveToMediaLibrary = async (file) => {
  //   if (hasMediaPermission === false) {
  //     Alert.alert("Sem permissão para salvar");
  //     return;
  //   }
  //   try {
  //     const asset = await MediaLibrary.createAssetAsync(file);
  //     //const album = await MediaLibrary.getAlbumAsync("Download");
  //     if (album == null) {
  //       await MediaLibrary.createAlbumAsync("Download", asset, false);
  //     } else {
  //       await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
  //     }
  //     console.log(`File saved to: ${asset.uri}`);
  //   } catch {}
  // };

  return (
    <View style={styles.container}>
      <View>
        {localUuidFromFile ? <Text>localUuidFromFile: {localUuidFromFile}</Text> : <Text>localUuidFromFile: {"\n???"}</Text>}
        {newUuid ? <Text>newUuid: {newUuid}</Text> : <Text>newUuid: {'\n???\n'}</Text>}
        {/* {fileSystemUuid ? <Text>file system: {fileSystemUuid}</Text> : <Text>file system: {'\n???\n'}</Text>} */}
        {/* {text ? <Text>storage: {"\n?????"}</Text> : null} */}
        {/* {text ? <Text>firebase: {"\n?????\n\n"}</Text> : null} */}
      </View>
      {/* <TextInput
        style={styles.input}
        placeholder="Enter some text"
        value={text}
        onChangeText={setText}
      /> */}
      {/* <Button title="Save Text to Hidden File" onPress={saveTextToFile} /> */}
      {/* <Button title="Generate and Save UUID" onPress={saveUuid(newUuid)} /> */}
      {<Button title="Delete local Files" onPress={deleteLocalFile} color="red" />}
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
