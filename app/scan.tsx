import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAppStore, { Device } from '../store/useAppStore';
import { scanNetwork } from '../services/network';
import DeviceItem from './components/DeviceItem';

/**
 * Tela de escaneamento de rede
 * Permite buscar e exibir dispositivos na rede local
 * @returns Componente da tela de escaneamento
 */
export default function ScanScreen() {
  const { devices, setDevices, isScanning, setIsScanning, selectDevice, addHistoryItem, settings } = useAppStore();
  const [scanStatus, setScanStatus] = useState('Iniciando escaneamento...');

  /**
   * Inicia o processo de escaneamento da rede
   * Atualiza o estado global com os dispositivos encontrados
   */
  const startScan = async () => {
    setIsScanning(true);
    setDevices([]);
    
    try {
      setScanStatus('Verificando conexão de rede...');
      
      try {
        // Limpar completamente os dispositivos para evitar IDs duplicados de escaneamentos anteriores
        setDevices([]);
        
        // Escaneamento da rede
        const discoveredDevices = await scanNetwork();
        
        if (discoveredDevices.length === 0) {
          setScanStatus('Nenhum dispositivo encontrado na rede Wi-Fi. Verifique sua conexão.');
        } else {
          // Contagem de dispositivos com fabricante identificado
          const identifiedVendors = discoveredDevices.filter(d => 
            d.vendor && d.vendor !== 'Desconhecido').length;
          
          // Contagem de dispositivos que responderam ao ping vs. não responderam
          const foundByPing = discoveredDevices.filter(d => !d.id.startsWith('nonresp-')).length;
          const foundWithoutPing = discoveredDevices.filter(d => d.id.startsWith('nonresp-')).length;
          
          setScanStatus(
            `Encontrados ${discoveredDevices.length} dispositivos na rede. ` +
            `${foundByPing} responderam a ping, ${foundWithoutPing} detectados por outros métodos. ` +
            `Identificados ${identifiedVendors} fabricantes.`
          );
        }
        
        // Garantir que cada dispositivo tem um ID único antes de atualizar o estado
        const devicesWithUniqueIds = discoveredDevices.map((device, index) => ({
          ...device,
          id: device.id || `device-${device.ip}-${device.mac}-${index}-${Date.now()}`
        }));
        
        setDevices(devicesWithUniqueIds);
        
        // Registrar no histórico
        addHistoryItem({
          type: 'ssh',
          device: 'Local',
          action: 'Escaneamento de rede',
          status: 'success'
        });
      } catch (error) {
        console.error('Erro ao escanear rede:', error);
        setScanStatus('Falha no escaneamento. Verifique sua conexão Wi-Fi e tente novamente.');
        
        // Registrar erro no histórico
        addHistoryItem({
          type: 'ssh',
          device: 'Local',
          action: 'Escaneamento de rede',
          status: 'error',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    } catch (outerError) {
      console.error('Erro crítico:', outerError);
      setScanStatus('Erro crítico. Tente reiniciar o aplicativo.');
      
      Alert.alert(
        'Erro no escaneamento', 
        'Ocorreu um erro crítico. Por favor, verifique sua conexão Wi-Fi e reinicie o aplicativo.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Inicia o escaneamento ao carregar a tela
  useEffect(() => {
    startScan();
  }, []);

  /**
   * Navega para a tela de detalhes do dispositivo
   * @param device Dispositivo selecionado
   */
  const handleDevicePress = (device: Device) => {
    selectDevice(device);
    router.push({
      pathname: '/device/[id]',
      params: { id: device.id }
    });
  };

  /**
   * Renderiza um item de dispositivo na lista
   * @param item Dados do dispositivo a ser renderizado
   * @returns Componente do dispositivo
   */
  const renderDeviceItem = ({ item }: { item: Device }) => (
    <DeviceItem item={item} handleDevicePress={handleDevicePress} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dispositivos na Rede</Text>
        <View style={styles.spacer} />
      </View>

      {isScanning ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>{scanStatus}</Text>
          <Text style={styles.networkInfo}>
            Faixa de rede: {settings.networkPrefix}.x
          </Text>
          <Text style={styles.helpText}>
            Realizando escaneamento profundo para detectar todos os dispositivos...
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              Faixa de rede: {settings.networkPrefix}.x
            </Text>
          </View>
          <FlatList
            data={devices}
            renderItem={renderDeviceItem}
            keyExtractor={(item) => item.id || `device-${item.ip}-${Math.random().toString(36).substring(7)}`}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum dispositivo encontrado.</Text>
              </View>
            }
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.button}
              onPress={startScan}
              disabled={isScanning}
            >
              <Text style={styles.buttonText}>↻ Escanear Novamente</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  infoContainer: {
    padding: 16,
    paddingBottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  networkInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  helpText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
}); 