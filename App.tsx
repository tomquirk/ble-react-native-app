import { useEffect } from "react";
import {
  Button,
  FlatList,
  PermissionsAndroid,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { DevicesProvider, useDeviceRssi, useDevices } from "./DevicesContext";
import { bleManager } from "./bleManager";

type DeviceRenderItem = {
  name: string | null;
  id: string | null;
  localName: string | null;
  rssi: number | null;
};

const PERMISSIONS = [
  PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
  PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
];

const requestPermissions = async () => {
  try {
    // todo change to requestMultiple
    const req = await Promise.all(
      PERMISSIONS.map((p) => {
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

const DeviceItem = ({ item }: { item: DeviceRenderItem }) => {
  const { name, id, rssi, localName } = item;
  const { addConnectedDevice } = useDevices();

  return (
    <Pressable
      onPress={() => {
        console.log("pressed...");
        if (!id) {
          return;
        }

        bleManager.connectToDevice(id).then((device) => {
          console.log("connected??", id);
          addConnectedDevice(device);
          bleManager.stopDeviceScan();
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
          <Text style={styles.title}>{localName ?? name ?? id}</Text>
          <Text style={styles.itemMetadata}>{rssi}</Text>
        </>
      )}
    </Pressable>
  );
};

const renderItem = ({ item }: { item: DeviceRenderItem }) => {
  return <DeviceItem item={item} />;
};

const DeviceList = () => {
  const { devices, connectedDevices } = useDevices();
  const deviceStrengths = devices.map((d) => {
    return {
      id: d.id,
      name: d.name,
      localName: d.localName,
      rssi: d.rssi,
      isConnectable: d.isConnectable,
    };
  });

  console.log(JSON.stringify(deviceStrengths));

  return (
    <FlatList
      data={deviceStrengths}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

const DeviceView = () => {
  const { connectedDevices } = useDevices();
  const connectedDevice = connectedDevices[0]; // TODO for now, assume device-of-interest is the first one
  const rssi = useDeviceRssi(connectedDevice?.id);
  const { name, id, localName } = connectedDevice ?? {};

  return (
    <>
      <Text>BLE baby</Text>
      <Button title="request permissions" onPress={requestPermissions} />

      {connectedDevice ? (
        <View style={styles.item}>
          <Text style={styles.title}>{localName ?? name ?? id}</Text>
          <Text style={styles.itemMetadata}>{rssi}</Text>
        </View>
      ) : (
        <DeviceList />
      )}
    </>
  );
};

export default function App() {
  useEffect(() => {
    bleManager?.onStateChange((state) => {
      console.log("bleManager::state change", state);
    }, true);
  }, []);

  return (
    <View style={styles.container}>
      <DevicesProvider>
        <DeviceView />
      </DevicesProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
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
