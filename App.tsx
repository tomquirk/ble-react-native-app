import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Device } from "react-native-ble-plx";
import { BleManager } from "react-native-ble-plx";

type DeviceRenderItem = {
  name: string | null;
  id: string | null;
  rssi: number | null;
};

const bleManager = new BleManager();

const requestPermissions = async () => {
  const permissions = [
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
  ];
  try {
    // todo change to requestMultiple
    const req = await Promise.all(
      permissions.map((p) => {
        return PermissionsAndroid.request(p);
      })
    );

    const missingGrants = req.some(
      (r) => r !== PermissionsAndroid.RESULTS.GRANTED
    );

    if (!missingGrants) {
      console.log("All permissions are granted");
    } else {
      console.log("Camera permission denied");
    }
  } catch (err) {
    console.warn(err);
  }
};

function useDevices() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (device) {
        // Add the device if it's not already in the array
        setDevices((prevDevices) => {
          const prevDevice = prevDevices.some(
            (prevDevice) => prevDevice.id === device.id
          );

          // const rssiChanged = prevDevice && prevDevice.rssi !== device.rssi;
          // if (rssiChanged) {
          //   // filter out the old device and add the new one
          //   return [...prevDevices.filter(d => d.id !== device.id), device];
          // }

          if (!prevDevice) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }

      if (error) {
        console.error("bleManager::error::", JSON.stringify(error));
      }
    });

    return () => {
      bleManager?.stopDeviceScan();
    };
  }, []);

  return devices;
}

const Item = ({ item }: { item: DeviceRenderItem }) => {
  const { name, id, rssi } = item;
  return (
    <Pressable
      onPress={() => {
        console.log("pressed...");
        // const bleManager = new BleManager();
        if (!id) {
          return;
        }

        bleManager.connectToDevice(id).then((device) => {
          console.log("connected??", id);
        });
      }}
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? "rgb(210, 230, 255)" : "white",
        },
        styles.item,
      ]}
    >
      {({ pressed }) => (
        <>
          <Text style={styles.title}>{name ?? id}</Text>
          <Text style={styles.itemMetadata}>{rssi}</Text>
        </>
      )}
    </Pressable>
  );
};

const renderItem = ({ item }: { item: DeviceRenderItem }) => {
  return <Item item={item} />;
};

export default function App() {
  const devices = useDevices();
  const deviceStrengths = devices.map((d) => {
    return {
      id: d.id,
      name: d.name,
      rssi: d.rssi,
      isConnectable: d.isConnectable,
    };
  });

  useEffect(() => {
    bleManager?.onStateChange((state) => {
      console.log("bleManager::state change", state);
    }, true);
  }, []);

  console.log(JSON.stringify(deviceStrengths));

  return (
    <View style={styles.container}>
      <Text>BLE baby</Text>
      <Button title="request permissions" onPress={requestPermissions} />
      <StatusBar style="auto" />

      <Text>Devices</Text>
      <FlatList
        data={deviceStrengths}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  item: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
  },
  itemMetadata: {
    fontSize: 18,
    color: "gray",
  },
});
