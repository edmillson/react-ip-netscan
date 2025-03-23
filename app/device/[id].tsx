import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Avatar, Button, Card, Divider, IconButton, Menu, Text, useTheme } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAppStore from '../../store/useAppStore';
import { sendSSHCommand } from '../../services/network';
import { GlobalStyles, DeviceStyles } from '../../styles';

/**
 * Tela de detalhes do dispositivo
 * Exibe informações detalhadas sobre um dispositivo e opções para interagir com ele
 * @returns Componente da tela de detalhes do dispositivo
 */
export default function DeviceDetailScreen() {
  const { id } = useLocalSearchParams();
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  
  const devices = useAppStore(state => state.devices);
  const selectedDevice = useAppStore(state => state.selectedDevice);
  const addHistoryItem = useAppStore(state => state.addHistoryItem);
  
  // Obter dispositivo pelo ID (ou usar o dispositivo selecionado na store)
  const device = selectedDevice?.id === id 
    ? selectedDevice 
    : devices.find(d => d.id === id);

  // Função para navegar para a tela SSH com o dispositivo selecionado
  const navigateToSSH = () => {
    if (device) {
      // Selecionar o dispositivo no store para garantir que está disponível
      useAppStore.getState().selectDevice(device);
      
      // Registrar a ação no histórico
      addHistoryItem({
        type: 'ssh',
        device: device.ip,
        action: 'Acessar via SSH',
        status: 'success'
      });
      
      // Navegar para a tela SSH
      router.push('/ssh');
    }
  };

  // Função para navegar para a tela API com o dispositivo selecionado
  const navigateToAPI = () => {
    if (device) {
      // Selecionar o dispositivo no store para garantir que está disponível
      useAppStore.getState().selectDevice(device);
      
      // Registrar a ação no histórico
      addHistoryItem({
        type: 'api',
        device: device.ip,
        action: 'Configurar via API',
        status: 'success'
      });
      
      // Navegar para a tela API
      router.push('/api');
    }
  };

  // Função para navegar para a tela Script com o dispositivo selecionado
  const navigateToScript = () => {
    if (device) {
      // Selecionar o dispositivo no store para garantir que está disponível
      useAppStore.getState().selectDevice(device);
      
      // Registrar a ação no histórico
      addHistoryItem({
        type: 'script',
        device: device.ip,
        action: 'Enviar script',
        status: 'success'
      });
      
      // Navegar para a tela Script
      router.push('/script');
    }
  };

  // Função para executar ping no dispositivo
  const pingDevice = async () => {
    if (!device) return;
    
    try {
      // Registrar a ação no histórico
      addHistoryItem({
        type: 'ssh',
        device: device.ip,
        action: 'Ping',
        status: 'success'
      });
      
      // Exibir mensagem no console
      console.log(`Executando ping para ${device.ip}...`);
      
      // Simulação de ping bem-sucedido
      return true;
    } catch (error) {
      console.error('Erro ao executar ping:', error);
      
      // Registrar erro no histórico
      addHistoryItem({
        type: 'ssh',
        device: device.ip,
        action: 'Ping',
        status: 'error',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      return false;
    }
  };
  
  // Se o dispositivo não for encontrado, exibe mensagem de erro
  if (!device) {
    return (
      <SafeAreaView style={GlobalStyles.container}>
        <StatusBar style="auto" />
        <View style={GlobalStyles.header}>
          <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
          <Text variant="headlineSmall">Dispositivo</Text>
          <View style={GlobalStyles.spacer} />
        </View>
        <View style={GlobalStyles.emptyStateContainer}>
          <Text>Dispositivo não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  /**
   * Determina o ícone apropriado com base no fabricante do dispositivo
   * @param vendor Nome do fabricante
   * @returns Nome do ícone a ser utilizado
   */
  const getVendorIcon = (vendor: string) => {
    if (!vendor) return 'devices';
    
    const vendorLower = vendor.toLowerCase();
    if (vendorLower.includes('mikrotik')) return 'router';
    if (vendorLower.includes('intelbras')) return 'access-point';
    if (vendorLower.includes('ubiquiti')) return 'access-point-network';
    if (vendorLower.includes('tp-link')) return 'wifi';
    if (vendorLower.includes('apple')) return 'apple';
    if (vendorLower.includes('samsung')) return 'cellphone';
    if (vendorLower.includes('xiaomi')) return 'cellphone-android';
    return 'devices';
  };

  /**
   * Determina a cor de status com base na condição online/offline
   * @param status Status do dispositivo
   * @returns Cor a ser utilizada para o indicador de status
   */
  const getStatusColor = (status?: string) => {
    return status === 'online' ? theme.colors.primary : theme.colors.error;
  };

  /**
   * Gera os itens de detalhes do dispositivo
   * @returns Array de objetos com os detalhes para exibição
   */
  const getDeviceDetails = (): { label: string; value: string }[] => {
    if (!device) return [];
    
    const details = [
      { label: 'Endereço IP', value: device.ip },
      { label: 'Endereço MAC', value: device.mac },
      { label: 'Fabricante', value: device.vendor || 'Desconhecido' },
      { label: 'Modelo', value: device.model || 'Desconhecido' },
      { label: 'Status', value: device.status || 'Desconhecido' }
    ];
    
    // Adicionar informação sobre o método de detecção
    const detectedBy = device.id.startsWith('nonresp-') 
      ? 'Detectado sem resposta de ping' 
      : 'Respondeu ao ping';
    
    details.push({ label: 'Método de Detecção', value: detectedBy });
    
    // Adicionar informações sobre portas abertas se disponíveis
    if (device.openPorts && device.openPorts.length > 0) {
      details.push({ label: 'Portas abertas', value: device.openPorts });
    }
    
    return details;
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <StatusBar style="auto" />
      <View style={GlobalStyles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall">Detalhes do Dispositivo</Text>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={24}
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              pingDevice();
            }}
            title="Ping"
            leadingIcon="lan-connect"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigateToSSH();
            }}
            title="Conectar via SSH"
            leadingIcon="console"
          />
        </Menu>
      </View>

      <ScrollView contentContainerStyle={GlobalStyles.content}>
        <Card style={GlobalStyles.card}>
          <Card.Content style={DeviceStyles.deviceHeader}>
            <Avatar.Icon
              size={60}
              icon={getVendorIcon(device.vendor)}
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
            <View style={DeviceStyles.deviceInfo}>
              <Text variant="titleLarge">{device.ip}</Text>
              {device.status && (
                <View style={DeviceStyles.statusContainer}>
                  <View
                    style={[
                      DeviceStyles.statusIndicator,
                      { backgroundColor: getStatusColor(device.status) },
                    ]}
                  />
                  <Text style={{ color: getStatusColor(device.status) }}>
                    {device.status === 'online' ? 'Online' : 'Offline'}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        <Card style={GlobalStyles.card}>
          <Card.Content>
            <Text variant="titleMedium">Informações do Dispositivo</Text>
            <Divider style={GlobalStyles.divider} />
            
            {getDeviceDetails().map((detail, index) => (
              <View style={DeviceStyles.detailRow} key={index}>
                <Text style={DeviceStyles.detailLabel}>{detail.label}:</Text>
                <Text style={DeviceStyles.detailValue}>{detail.value}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <View style={DeviceStyles.actionsContainer}>
          <Button
            mode="contained"
            icon="console"
            onPress={navigateToSSH}
            style={GlobalStyles.button}
          >
            Acessar via SSH
          </Button>
          
          <Button
            mode="outlined"
            icon="code-json"
            onPress={navigateToAPI}
            style={GlobalStyles.button}
          >
            Configurar via API
          </Button>
          
          <Button
            mode="outlined"
            icon="script-text"
            onPress={navigateToScript}
            style={GlobalStyles.button}
          >
            Enviar Script
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 