import { create } from 'zustand';
import { Alert } from 'react-native';

export type Device = {
  id: string;
  ip: string;
  mac: string;
  vendor: string;
  model?: string;
  status?: 'online' | 'offline';
  openPorts?: string;
};

export type HistoryItem = {
  id: string;
  type: 'ssh' | 'api' | 'script';
  device: string;
  timestamp: string;
  action: string;
  status: 'success' | 'error';
  details?: string;
};

export type AppSettings = {
  networkPrefix: string; // Prefixo da rede (ex: 192.168.0)
  scanTimeout: number; // Timeout para o scan em milissegundos
};

type AppState = {
  devices: Device[];
  selectedDevice: Device | null;
  history: HistoryItem[];
  isScanning: boolean;
  settings: AppSettings;
  addDevice: (device: Device) => void;
  setDevices: (devices: Device[]) => void;
  selectDevice: (device: Device) => void;
  clearDevices: () => void;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  setIsScanning: (isScanning: boolean) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  handleResetSettings: () => void;
};

const useAppStore = create<AppState>((set) => ({
  devices: [],
  selectedDevice: null,
  history: [],
  isScanning: false,
  settings: {
    networkPrefix: '192.168.0', // Prefixo padrão
    scanTimeout: 5000, // 5 segundos
  },
  
  addDevice: (device) => set((state) => ({
    devices: [...state.devices, device]
  })),
  
  setDevices: (devices) => set(() => ({
    devices
  })),
  
  selectDevice: (device) => set(() => ({
    selectedDevice: device
  })),
  
  clearDevices: () => set(() => ({
    devices: [],
    selectedDevice: null
  })),
  
  addHistoryItem: (item) => set((state) => ({
    history: [
      {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...item
      },
      ...state.history
    ]
  })),
  
  clearHistory: () => set(() => ({
    history: []
  })),
  
  setIsScanning: (isScanning) => set(() => ({
    isScanning
  })),
  
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings }
  })),
  
  handleResetSettings: () => {
    Alert.alert(
      'Resetar Configurações',
      'Tem certeza que deseja resetar todas as configurações para os valores padrão?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Resetar', 
          style: 'destructive',
          onPress: () => {
            set(() => ({
              settings: {
                networkPrefix: '192.168.0',
                scanTimeout: 5000,
              }
            }));
            Alert.alert('Sucesso', 'Configurações resetadas com sucesso!');
          }
        }
      ]
    );
  }
}));

export default useAppStore; 