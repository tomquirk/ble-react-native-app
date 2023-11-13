import React, { createContext, useContext, useEffect, useState } from "react";
import { Device } from "react-native-ble-plx";
import { bleManager } from "./bleManager";

export type DevicesContext = {
  devices: Device[];
  connectedDevices: Device[];
  setConnectedDevices: (devices: Device[]) => void;
  addConnectedDevice: (device: Device) => void;
};

export const DevicesContext = createContext<DevicesContext>({
  devices: [],
  connectedDevices: [],
  setConnectedDevices: () => {
    console.warn("setConnectedDevices not implemented");
  },
  addConnectedDevice: () => {
    console.warn("addConnectedDevice not implemented");
  },
});

export function useDevices() {
  return useContext(DevicesContext);
}

export function useDeviceRssi(deviceId: string | undefined) {
  const [rssi, setRssi] = useState<number | null>(null);

  useEffect(() => {
    const readRssiInterval = setInterval(() => {
      if (!deviceId) return;

      bleManager.readRSSIForDevice(deviceId).then((device) => {
        setRssi(device.rssi);
      });
    }, 1000);

    return () => {
      clearInterval(readRssiInterval);
    };
  }, [deviceId]);

  return rssi;
}

function useScanDevices() {
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

export const DevicesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const devices = useScanDevices();
  function addConnectedDevice(device: Device) {
    setConnectedDevices((prevDevices) => {
      const prevDevice = prevDevices.some(
        (prevDevice) => prevDevice.id === device.id
      );

      if (!prevDevice) {
        return [...prevDevices, device];
      }
      return prevDevices;
    });
  }

  return (
    <DevicesContext.Provider
      value={{
        devices,
        connectedDevices,
        setConnectedDevices,
        addConnectedDevice,
      }}
    >
      {children}
    </DevicesContext.Provider>
  );
};
