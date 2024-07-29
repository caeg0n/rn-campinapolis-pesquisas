// import React, { useState, useEffect, useRef } from "react";
// import * as MediaLibrary from "expo-media-library";
// import { StyleSheet, Text, View, Alert, Image } from "react-native";
// import * as FileSystem from "expo-file-system";
// import * as Crypto from "expo-crypto";
// import { initializeApp } from "firebase/app";
// import {
//   getFirestore,
//   collection,
//   getDocs,
//   query,
//   where,
// } from "firebase/firestore";
// import { Card, Title, Paragraph } from "react-native-paper";
// import { NavigationContainer } from "@react-navigation/native";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// const firebaseConfig = {
//   apiKey: "AIzaSyDA17dBpCFCJmCSHBI5vjfTNOspv8LY_70",
//   authDomain: "rn-campinapolis-pesquisa.firebaseapp.com",
//   projectId: "rn-campinapolis-pesquisa",
//   storageBucket: "rn-campinapolis-pesquisa",
//   messagingSenderId: "997217497426",
//   appId: "1:997217497426:web:93b0f57601fc03e8fcca8b",
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// async function getDefaultFilePathInfo() {
//   const fileName = "campinapolis_pesquisas.txt";
//   const fileUri = `${FileSystem.documentDirectory}${fileName}`;
//   const fileContent = "This is a temporary file for testing purposes.";
//   await FileSystem.writeAsStringAsync(fileUri, fileContent);
//   const asset = await MediaLibrary.createAssetAsync(fileUri);
//   const assetFilePath = asset.uri;
//   const parsedUri = assetFilePath.split("/");
//   const directoryPath = parsedUri.slice(0, -1).join("/");
//   await MediaLibrary.deleteAssetsAsync([asset.id]);
//   await FileSystem.deleteAsync(fileUri, { idempotent: true });
//   return { filePath: assetFilePath, directoryPath: directoryPath };
// }

// const CandidateCard = ({ candidate }) => (
//   <Card style={styles.card}>
//     <Card.Content style={styles.content}>
//       <Image source={{ uri: candidate.foto }} style={styles.candidateImage} />
//       <View style={styles.textContainer}>
//         <Title>{candidate.candidato}</Title>
//         <Paragraph>{candidate.partido}</Paragraph>
//       </View>
//       <Image
//         source={{ uri: candidate["foto do partido"] }}
//         style={styles.partyImage}
//       />
//     </Card.Content>
//   </Card>
// );

// function PrefeitoScreen({ uuids }) {
//   const [pesquisaDocs, setPesquisaDocs] = useState([]);

//   useEffect(() => {
//     const fetchPesquisaDocs = async () => {
//       try {
//         const q = query(
//           collection(db, "pesquisa"),
//           where("tipo de candidato", "==", 0)
//         );
//         const querySnapshot = await getDocs(q);
//         const docsArray = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setPesquisaDocs(docsArray);
//       } catch (error) {
//         console.error(
//           "Failed to fetch documents from pesquisa collection",
//           error
//         );
//       }
//     };

//     fetchPesquisaDocs();
//   }, []);

//   return (
//     <View style={styles.container}>
//       {/* <View style={styles.uuidContainer}>
//         <Text>localUuidFromFile: {uuids.localUuidFromFile ?? "???"}</Text>
//         <Text>mediaUuidFromFile: {uuids.mediaUuidFromFile ?? "???"}</Text>
//         <Text>newUuid: {uuids.newUuid ?? "???"}</Text>
//       </View> */}
//       {pesquisaDocs.map((candidate) => (
//         <CandidateCard key={candidate.id} candidate={candidate} />
//       ))}
//     </View>
//   );
// }

// function VereadorScreen({ uuids }) {
//   const [pesquisaDocs, setPesquisaDocs] = useState([]);

//   useEffect(() => {
//     const fetchPesquisaDocs = async () => {
//       try {
//         const q = query(
//           collection(db, "pesquisa"),
//           where("tipo de candidato", "==", 1)
//         );
//         const querySnapshot = await getDocs(q);
//         const docsArray = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setPesquisaDocs(docsArray);
//       } catch (error) {
//         console.error(
//           "Failed to fetch documents from pesquisa collection",
//           error
//         );
//       }
//     };

//     fetchPesquisaDocs();
//   }, []);

//   return (
//     <View style={styles.container}>
//       <View style={styles.uuidContainer}>
//         <Text>localUuidFromFile: {uuids.localUuidFromFile ?? "???"}</Text>
//         <Text>mediaUuidFromFile: {uuids.mediaUuidFromFile ?? "???"}</Text>
//         <Text>newUuid: {uuids.newUuid ?? "???"}</Text>
//       </View>
//       {pesquisaDocs.map((candidate) => (
//         <CandidateCard key={candidate.id} candidate={candidate} />
//       ))}
//     </View>
//   );
// }

// const Tab = createBottomTabNavigator();

// export default function App() {
//   //state
//   const [hasMediaPermission, setHasMediaPermission] = useState(null);
//   const [newUuid, setNewUuid] = useState(null);
//   const [localUuidFromFile, setLocalUuidFromFile] = useState(null);
//   const [mediaUuidFromFile, setMediaUuidFromFile] = useState(null);
//   //ref
//   const localFilePath = useRef(`${FileSystem.documentDirectory}.uuid.txt`);
//   const fileMediaPath = useRef(null);

//   useEffect(() => {
//     const runGetDefaultFilePathInfo = async () => {
//       fileMediaPath.current = await getDefaultFilePathInfo();
//     };

//     const getPermissions = async () => {
//       const { status } = await MediaLibrary.requestPermissionsAsync();
//       setHasMediaPermission(status === "granted");
//     };

//     const initializeUuid = async () => {
//       const local_info = await FileSystem.getInfoAsync(localFilePath.current);
//       const media_info = await FileSystem.getInfoAsync(
//         fileMediaPath.current.directoryPath + "/.uuid.txt"
//       );
//       console.log("local", local_info);
//       console.log("media", local_info);
//       if (local_info.exists) {
//         const fileContent = await FileSystem.readAsStringAsync(
//           localFilePath.current
//         );
//         setLocalUuidFromFile(fileContent);
//       }
//       if (media_info.exists) {
//         const fileContent = await FileSystem.readAsStringAsync(
//           fileMediaPath.current.directoryPath + "/.uuid.txt"
//         );
//         setMediaUuidFromFile(fileContent);
//       }
//       if (local_info.exists || media_info.exists) return;
//       generateNewUuid();
//     };

//     const run = async () => {
//       await getPermissions();
//       await runGetDefaultFilePathInfo();
//       await initializeUuid();
//       // await deleteLocalAndMediaFiles();
//     };
//     run();
//   }, []);

//   const generateNewUuid = async () => {
//     const newUuid = Crypto.randomUUID();
//     await saveUuid(newUuid);
//     setNewUuid(newUuid);
//   };

//   const saveUuid = async (uuid) => {
//     if (hasMediaPermission === false) {
//       Alert.alert("Sem permissão para votar");
//       return;
//     }
//     await FileSystem.writeAsStringAsync(localFilePath.current, uuid, {
//       encoding: FileSystem.EncodingType.UTF8,
//     });
//     const asset = await MediaLibrary.createAssetAsync(localFilePath.current);
//     return;
//   };

//   const deleteLocalAndMediaFiles = async () => {
//     try {
//       await FileSystem.deleteAsync(localFilePath.current, { idempotent: true });
//       setLocalUuidFromFile(null);
//       const mediaFileUri = `${fileMediaPath.current.directoryPath}/.uuid.txt`;
//       await FileSystem.deleteAsync(mediaFileUri, { idempotent: true });
//       setMediaUuidFromFile(null);
//       Alert.alert("Files deleted successfully");
//     } catch (error) {
//       console.error("Failed to delete files", error);
//       Alert.alert("Failed to delete files");
//     }
//   };

//   const uuids = {
//     localUuidFromFile,
//     mediaUuidFromFile,
//     newUuid,
//   };

//   return (
//     <NavigationContainer>
//       <Tab.Navigator
//         screenOptions={({ route }) => ({
//           tabBarIcon: ({ color, size }) => {
//             let iconName;

//             if (route.name === "Prefeito") {
//               iconName = "account-tie"; // Mayor icon
//             } else if (route.name === "Vereador") {
//               iconName = "account-group"; // City councilor icon
//             }

//             return <Icon name={iconName} size={size} color={color} />;
//           },
//         })}
//       >
//         <Tab.Screen name="Prefeito">
//           {() => <PrefeitoScreen uuids={uuids} />}
//         </Tab.Screen>
//         <Tab.Screen name="Vereador">
//           {() => <VereadorScreen uuids={uuids} />}
//         </Tab.Screen>
//       </Tab.Navigator>
//     </NavigationContainer>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 16,
//   },
//   uuidContainer: {
//     marginBottom: 20,
//   },
//   card: {
//     marginBottom: 10,
//     width: "100%",
//   },
//   content: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   candidateImage: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     marginRight: 10,
//   },
//   textContainer: {
//     flex: 1,
//   },
//   partyImage: {
//     width: 40,
//     height: 40,
//   },
// });
import React, { useState, useEffect, useRef } from "react";
import * as MediaLibrary from "expo-media-library";
import { StyleSheet, Text, View, Alert, Image, ScrollView } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Crypto from "expo-crypto";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Card, Title, Paragraph } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const firebaseConfig = {
  apiKey: "AIzaSyDA17dBpCFCJmCSHBI5vjfTNOspv8LY_70",
  authDomain: "rn-campinapolis-pesquisa.firebaseapp.com",
  projectId: "rn-campinapolis-pesquisa",
  storageBucket: "rn-campinapolis-pesquisa",
  messagingSenderId: "997217497426",
  appId: "1:997217497426:web:93b0f57601fc03e8fcca8b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function getDefaultFilePathInfo() {
  const fileName = "campinapolis_pesquisas.txt";
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  const fileContent = "This is a temporary file for testing purposes.";
  await FileSystem.writeAsStringAsync(fileUri, fileContent);
  const asset = await MediaLibrary.createAssetAsync(fileUri);
  const assetFilePath = asset.uri;
  const parsedUri = assetFilePath.split("/");
  const directoryPath = parsedUri.slice(0, -1).join("/");
  await MediaLibrary.deleteAssetsAsync([asset.id]);
  await FileSystem.deleteAsync(fileUri, { idempotent: true });
  return { filePath: assetFilePath, directoryPath: directoryPath };
}

const CandidateCard = ({ candidate }) => (
  <Card style={styles.card}>
    <Card.Content style={styles.content}>
      <Image source={{ uri: candidate.foto }} style={styles.candidateImage} />
      <View style={styles.textContainer}>
        <Title>{candidate.candidato}</Title>
        <Paragraph>{candidate.partido}</Paragraph>
      </View>
      <Image
        source={{ uri: candidate["foto do partido"] }}
        style={styles.partyImage}
      />
    </Card.Content>
  </Card>
);

function PrefeitoScreen({ uuids }) {
  const [pesquisaDocs, setPesquisaDocs] = useState([]);

  useEffect(() => {
    const fetchPesquisaDocs = async () => {
      try {
        const q = query(
          collection(db, "pesquisa"),
          where("tipo de candidato", "==", 0)
        );
        const querySnapshot = await getDocs(q);
        const docsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPesquisaDocs(shuffleArray(docsArray));
      } catch (error) {
        console.error(
          "Failed to fetch documents from pesquisa collection",
          error
        );
      }
    };

    fetchPesquisaDocs();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.uuidContainer}>
        <Text>localUuidFromFile: {uuids.localUuidFromFile ?? "???"}</Text>
        <Text>mediaUuidFromFile: {uuids.mediaUuidFromFile ?? "???"}</Text>
        <Text>newUuid: {uuids.newUuid ?? "???"}</Text>
      </View>
      {pesquisaDocs.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </ScrollView>
  );
}

function VereadorScreen({ uuids }) {
  const [pesquisaDocs, setPesquisaDocs] = useState([]);

  useEffect(() => {
    const fetchPesquisaDocs = async () => {
      try {
        const q = query(
          collection(db, "pesquisa"),
          where("tipo de candidato", "==", 1)
        );
        const querySnapshot = await getDocs(q);
        const docsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPesquisaDocs(shuffleArray(docsArray));
      } catch (error) {
        console.error(
          "Failed to fetch documents from pesquisa collection",
          error
        );
      }
    };

    fetchPesquisaDocs();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.uuidContainer}>
        <Text>localUuidFromFile: {uuids.localUuidFromFile ?? "???"}</Text>
        <Text>mediaUuidFromFile: {uuids.mediaUuidFromFile ?? "???"}</Text>
        <Text>newUuid: {uuids.newUuid ?? "???"}</Text>
      </View>
      {pesquisaDocs.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </ScrollView>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [newUuid, setNewUuid] = useState(null);
  const [localUuidFromFile, setLocalUuidFromFile] = useState(null);
  const [mediaUuidFromFile, setMediaUuidFromFile] = useState(null);
  const localFilePath = useRef(`${FileSystem.documentDirectory}.uuid.txt`);
  const fileMediaPath = useRef(null);

  useEffect(() => {
    const runGetDefaultFilePathInfo = async () => {
      fileMediaPath.current = await getDefaultFilePathInfo();
    };

    const getPermissions = async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      setHasMediaPermission(status === "granted");
    };

    const initializeUuid = async () => {
      const local_info = await FileSystem.getInfoAsync(localFilePath.current);
      const media_info = await FileSystem.getInfoAsync(
        fileMediaPath.current.directoryPath + "/.uuid.txt"
      );
      console.log("local", local_info);
      console.log("media", local_info);
      if (local_info.exists) {
        const fileContent = await FileSystem.readAsStringAsync(
          localFilePath.current
        );
        setLocalUuidFromFile(fileContent);
      }
      if (media_info.exists) {
        const fileContent = await FileSystem.readAsStringAsync(
          fileMediaPath.current.directoryPath + "/.uuid.txt"
        );
        setMediaUuidFromFile(fileContent);
      }
      if (local_info.exists || media_info.exists) return;
      generateNewUuid();
    };

    const run = async () => {
      await getPermissions();
      await runGetDefaultFilePathInfo();
      await initializeUuid();
    };
    run();
  }, []);

  const generateNewUuid = async () => {
    const newUuid = Crypto.randomUUID();
    await saveUuid(newUuid);
    setNewUuid(newUuid);
  };

  const saveUuid = async (uuid) => {
    if (hasMediaPermission === false) {
      Alert.alert("Sem permissão para votar");
      return;
    }
    await FileSystem.writeAsStringAsync(localFilePath.current, uuid, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const asset = await MediaLibrary.createAssetAsync(localFilePath.current);
    return;
  };

  const deleteLocalAndMediaFiles = async () => {
    try {
      await FileSystem.deleteAsync(localFilePath.current, { idempotent: true });
      setLocalUuidFromFile(null);
      const mediaFileUri = `${fileMediaPath.current.directoryPath}/.uuid.txt`;
      await FileSystem.deleteAsync(mediaFileUri, { idempotent: true });
      setMediaUuidFromFile(null);
      Alert.alert("Files deleted successfully");
    } catch (error) {
      console.error("Failed to delete files", error);
      Alert.alert("Failed to delete files");
    }
  };

  const uuids = {
    localUuidFromFile,
    mediaUuidFromFile,
    newUuid,
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === "Prefeito") {
              iconName = "account-tie"; // Mayor icon
            } else if (route.name === "Vereador") {
              iconName = "account-group"; // City councilor icon
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Prefeito">
          {() => <PrefeitoScreen uuids={uuids} />}
        </Tab.Screen>
        <Tab.Screen name="Vereador">
          {() => <VereadorScreen uuids={uuids} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

function shuffleArray(array) {
  let shuffledArray = array.slice();
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  uuidContainer: {
    marginBottom: 20,
  },
  card: {
    marginBottom: 10,
    width: "100%",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  candidateImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  partyImage: {
    width: 40,
    height: 40,
  },
});
