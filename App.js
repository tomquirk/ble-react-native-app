import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Button,
  PermissionsAndroid,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BleManager } from "react-native-ble-plx";

const requestCameraPermission = async () => {
  try {
    const grantedA = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      {
        title: "Cool Photo App Camera Permission",
        message:
          "Cool Photo App needs access to your camera " +
          "so you can take awesome pictures.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    const grantedB = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Cool Photo App Camera Permission",
        message:
          "Cool Photo App needs access to your camera " +
          "so you can take awesome pictures.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    if (
      grantedA === PermissionsAndroid.RESULTS.GRANTED &&
      grantedB === PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log("You can use the camera");
    } else {
      console.log("Camera permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};

function useDevices() {
  const [devices, setDevices] = useState([]);
  const bleManager = new BleManager();

  useEffect(() => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (device) {
        // Add the device if it's not already in the array
        setDevices((prevDevices) => {
          if (!prevDevices.some((device) => device.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }

      if (error) {
        console.error("ble error====>", JSON.stringify(error));
      }
    });

    return () => {
      bleManager.stopDeviceScan();
    };
  }, [bleManager]);

  return devices;
}

export default function App() {
  const devices = useDevices();
  console.log(JSON.stringify(devices))
  return (
    <View style={styles.container}>
      <Text>BLE baby</Text>
      <Button title="request permissions" onPress={requestCameraPermission} />
      <StatusBar style="auto" />
      <Text>Devices:{devices.map((d) => d.name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
