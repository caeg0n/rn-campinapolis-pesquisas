import React, { useState, useEffect, useRef } from "react";
import * as MediaLibrary from "expo-media-library";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import * as Crypto from "expo-crypto";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { Card, Title, Paragraph } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Modal from "react-native-modal";
import { Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
// import * as RNFS from '@dr.pogodin/react-native-fs';
// import { PERMISSIONS } from 'react-native-permissions';

const screenWidth = Dimensions.get("window").width;

const firebaseConfig = {
  apiKey: "AIzaSyDA17dBpCFCJmCSHBI5vjfTNOspv8LY_70",
  authDomain: "rn-campinapolis-pesquisa.firebaseapp.com",
  projectId: "rn-campinapolis-pesquisa",
  storageBucket: "rn-campinapolis-pesquisa",
  messagingSenderId: "997217497426",
  appId: "1:997217497426:web:93b0f57601fc03e8fcca8b",
};

const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#08130D",
  backgroundGradientToOpacity: 0.5,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
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

const CandidateCard = ({ candidate, selected, onPress, voted }) => (
  <Card
    style={[
      styles.card,
      selected && styles.selectedCard,
      voted && styles.votedCard,
    ]}
  >
    {voted && (
      <FontAwesome
        name="check-circle"
        size={20}
        color="green"
        style={styles.votedIcon}
      />
    )}
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
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
    </TouchableOpacity>
  </Card>
);

function PrefeitoScreen({ uuids }) {
  const [pesquisaDocs, setPesquisaDocs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [voteStatus, setVoteStatus] = useState(null);
  const [votedCandidateId, setVotedCandidateId] = useState(null);

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

    const checkVotedCandidate = async () => {
      const deviceUuids = Object.values(uuids).filter((uuid) => uuid !== null);
      if (deviceUuids.length > 0) {
        try {
          const q = query(
            collection(db, "votos_prefeito"),
            where("device_id", "array-contains-any", deviceUuids)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const voteDoc = querySnapshot.docs[0];
            setVotedCandidateId(voteDoc.data().candidato_id);
          }
        } catch (error) {
          console.error("Erro inesperado", error);
        }
      }
    };

    const run = async () => {
      await fetchPesquisaDocs();
      await checkVotedCandidate();
    };
    run();
  }, [uuids, voteStatus]);

  const handleCardPress = (candidate) => {
    setSelectedCandidate(candidate);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCandidate(null);
    setVoteStatus(null);
  };

  const handleVote = async (vote) => {
    if (!vote || !selectedCandidate) {
      closeModal();
      return;
    }
    const deviceUuids = Object.values(uuids).filter((uuid) => uuid !== null);
    try {
      const q = query(
        collection(db, "votos_prefeito"),
        where("device_id", "array-contains-any", deviceUuids)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setVoteStatus("alreadyRegistered");
      } else {
        await addDoc(collection(db, "votos_prefeito"), {
          candidato_id: selectedCandidate.id,
          device_id: deviceUuids,
        });
        setVoteStatus("registered");
      }
    } catch (error) {
      console.error("Failed to register vote", error);
      Alert.alert("Failed to register vote");
    } finally {
      setModalVisible(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.uuidContainer}>
        <Text>localUuidFromFile: {uuids.localUuidFromFile ?? "???"}</Text>
        <Text>mediaUuidFromFile: {uuids.mediaUuidFromFile ?? "???"}</Text>
        <Text>newUuid: {uuids.newUuid ?? "???"}</Text>
      </View>
      {pesquisaDocs.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          selected={selectedCandidate?.id == candidate.id}
          voted={votedCandidateId === candidate.id}
          onPress={() => handleCardPress(candidate)}
        />
      ))}
      <Modal isVisible={isModalVisible} onBackdropPress={closeModal}>
        <View style={styles.modalContent}>
          {voteStatus === "alreadyRegistered" ? (
            <>
              <Icon name="close-circle" size={100} color="red" />
              <Paragraph style={styles.errorText}>
                Você já registrou sua intenção de voto.
              </Paragraph>
            </>
          ) : voteStatus === "registered" ? (
            <>
              <Icon name="check-circle" size={100} color="green" />
              <Paragraph style={styles.successText}>
                Sua intenção de voto foi registrada.
              </Paragraph>
            </>
          ) : (
            <>
              {selectedCandidate && (
                <>
                  <Image
                    source={{ uri: selectedCandidate.foto }}
                    style={styles.modalImage}
                  />
                  <Title>{selectedCandidate.candidato}</Title>
                  <Paragraph>{selectedCandidate.partido}</Paragraph>
                  <Paragraph>
                    Deseja registrar sua intenção de voto em{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {selectedCandidate.candidato}
                    </Text>
                    ?
                  </Paragraph>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleVote(true)}
                    >
                      <Text style={styles.buttonText}>Sim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleVote(false)}
                    >
                      <Text style={styles.buttonText}>Não</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </Modal>
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

    const run = async () => {
      await fetchPesquisaDocs();
    };
    run();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {pesquisaDocs.map((candidate) => (
        <CandidateCard key={candidate.id} candidate={candidate} />
      ))}
    </ScrollView>
  );
}

function ResultadoScreen() {
  const [voteCounts, setVoteCounts] = useState([]);

  useEffect(() => {
    const fetchVoteCounts = async () => {
      try {
        const pesquisaDocsSnapshot = await getDocs(collection(db, "pesquisa"));
        const pesquisaDocs = pesquisaDocsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const counts = await Promise.all(
          pesquisaDocs.map(async (candidate) => {
            const prefeitoVotesQuery = query(
              collection(db, "votos_prefeito"),
              where("candidato_id", "==", candidate.id)
            );
            const vereadorVotesQuery = query(
              collection(db, "votos_vereador"),
              where("candidato_id", "==", candidate.id)
            );

            const [prefeitoVotesSnapshot, vereadorVotesSnapshot] =
              await Promise.all([
                getDocs(prefeitoVotesQuery),
                getDocs(vereadorVotesQuery),
              ]);

            const totalVotes =
              prefeitoVotesSnapshot.size + vereadorVotesSnapshot.size;

            return {
              name: getFirstName(candidate.candidato),
              fullName: candidate.candidato,
              votes: totalVotes,
              color: getRandomColor(),
              legendFontColor: "#7F7F7F",
              legendFontSize: 15,
            };
          })
        );
        counts.sort((a, b) => b.votes - a.votes);
        setVoteCounts(counts);
      } catch (error) {
        console.error("Failed to fetch vote counts", error);
      }
    };

    fetchVoteCounts();
  }, []);

  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const getFirstName = (fullName) => {
    return fullName.split(" ")[0];
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.chartContainer}>
        {voteCounts.length > 0 && (
          <PieChart
            data={voteCounts}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor={"votes"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        )}
      </View>
      <View style={styles.candidateList}>
        {voteCounts.map((candidate, index) => (
          <Text key={index} style={styles.candidateText}>
            {candidate.fullName}: {candidate.votes} votes
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  console.log("============================");
  const [hasMediaPermission, setHasMediaPermission] = useState(null);
  const [newUuid, setNewUuid] = useState(null);
  const [localUuidFromFile, setLocalUuidFromFile] = useState(null);
  const [mediaUuidFromFile, setMediaUuidFromFile] = useState(null);
  const localFilePath = useRef(`${FileSystem.documentDirectory}uuid.txt`);
  const fileMediaPath = useRef(null);
  const uuids = {
    localUuidFromFile,
    mediaUuidFromFile,
    newUuid,
  };

  

  useEffect(() => {
    const getPermissions = async () => {
      var { status } = await MediaLibrary.requestPermissionsAsync();
      console.log()
      setHasMediaPermission(status === "granted");
    };

    const runGetDefaultFilePathInfo = async () => {
      fileMediaPath.current = await getDefaultFilePathInfo();
    };

    const initializeUuid = async () => {
      const local_info = await FileSystem.getInfoAsync(localFilePath.current);
      const media_info = await FileSystem.getInfoAsync(
        fileMediaPath.current.directoryPath + "/uuid.txt"
      );
      if (local_info.exists) {
        const fileContent = await FileSystem.readAsStringAsync(
          localFilePath.current
        );
        setLocalUuidFromFile(fileContent);
      }
      if (media_info.exists) {
        const fileContent = await FileSystem.readAsStringAsync(
          fileMediaPath.current.directoryPath + "/uuid.txt"
        );
        setMediaUuidFromFile(fileContent);
      }
      if (local_info.exists || media_info.exists) {
        return;
      } else {
        await generateNewUuid();
      }
    };

    const run = async () => {
      await getPermissions();
      // await getModernPermissions();
      // await getDirectoryPermissions();
      //await runGetDefaultFilePathInfo();
      //await initializeUuid();
    };
    run();
  }, []);

  const generateNewUuid = async () => {
    const newUuid = Crypto.randomUUID();
    saveUuid(newUuid);
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
      const mediaFileUri = `${fileMediaPath.current.directoryPath}/uuid.txt`;
      await FileSystem.deleteAsync(mediaFileUri, { idempotent: true });
      setMediaUuidFromFile(null);
      Alert.alert("Files deleted successfully");
    } catch (error) {
      console.error("Failed to delete files", error);
      Alert.alert("Failed to delete files");
    }
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Prefeito") {
              iconName = "account-tie";
            } else if (route.name === "Vereador") {
              iconName = "account-group";
            } else if (route.name === "Resultado") {
              iconName = "chart-bar";
            }
            return <Icon name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Prefeito">
          {() => <PrefeitoScreen uuids={uuids} />}
        </Tab.Screen>
        {/* <Tab.Screen name="Vereador">
          {() => <VereadorScreen uuids={uuids} />}
        </Tab.Screen> */}
        <Tab.Screen name="Resultado">
          {() => <ResultadoScreen uuids={uuids} />}
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
  selectedCard: {
    borderWidth: 2,
    borderColor: "blue",
  },
  uuidContainer: {
    marginBottom: 20,
  },
  touchable: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
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
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
  successText: {
    fontSize: 18,
    color: "green",
    textAlign: "center",
    marginTop: 20,
  },
  votedCard: {
    borderWidth: 2,
    borderColor: "green",
  },
  votedIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  uuidContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  candidateList: {
    marginTop: 20,
    alignItems: "center",
  },
  candidateText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 5,
  },
});
