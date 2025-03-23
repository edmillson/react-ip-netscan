import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Definição do tipo Device para o componente standalone
export interface Device {
  id: string;
  ip: string;
  mac: string;
  vendor: string;
  model?: string;
  status?: 'online' | 'offline';
  openPorts?: string;
}

interface DeviceItemProps {
  item: Device;
  handleDevicePress: (device: Device) => void;
}

/**
 * Renderiza um item de dispositivo na lista
 * @param props Propriedades do componente
 * @returns Componente Card para o dispositivo
 */
const DeviceItem: React.FC<DeviceItemProps> = ({ item, handleDevicePress }) => {
  // Verifica se o dispositivo foi detectado por sondagem avançada ou por ping direto
  const detectionMethod = item.id.startsWith('nonresp-') 
    ? 'Detecção avançada' 
    : 'Resposta direta';
    
  // Informações sobre portas abertas
  const hasOpenPorts = item.openPorts && item.openPorts.length > 0;
  const openPortsInfo = hasOpenPorts 
    ? `Portas: ${item.openPorts}` 
    : '';
  
  return (
    <TouchableOpacity 
      style={styles.deviceCard} 
      onPress={() => handleDevicePress(item)}
    >
      <View style={styles.cardContent}>
        <View style={styles.deviceHeader}>
          <Text style={styles.deviceIp}>{item.ip}</Text>
          <View style={styles.vendorChip}>
            <Text style={styles.vendorText}>{item.vendor}</Text>
          </View>
        </View>
        <Text style={styles.deviceInfo}>MAC: {item.mac}</Text>
        {item.model && (
          <Text style={styles.deviceInfo}>Modelo: {item.model}</Text>
        )}
        <Text style={[
          styles.statusText, 
          item.status === 'online' ? styles.statusOnline : styles.statusOffline
        ]}>
          Status: {item.status === 'online' ? 'Online' : 'Offline'}
        </Text>
        <Text style={styles.methodInfo}>
          Método: {detectionMethod}
        </Text>
        {hasOpenPorts && (
          <Text style={styles.portsInfo}>
            {openPortsInfo}
          </Text>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => handleDevicePress(item)}
        >
          <Text style={styles.buttonText}>Detalhes</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default DeviceItem;

const styles = StyleSheet.create({
  deviceCard: {
    marginBottom: 12,
    elevation: 2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardContent: {
    flex: 1
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceIp: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  vendorChip: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12
  },
  vendorText: {
    fontSize: 12
  },
  deviceInfo: {
    marginBottom: 4,
    fontSize: 14
  },
  statusText: {
    marginVertical: 4,
    fontWeight: '500'
  },
  statusOnline: {
    color: '#4CAF50'
  },
  statusOffline: {
    color: '#F44336'
  },
  methodInfo: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4
  },
  portsInfo: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 4
  },
  cardActions: {
    marginTop: 12,
    alignItems: 'flex-end'
  },
  detailsButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  buttonText: {
    color: 'white',
    fontWeight: '500'
  }
}); 