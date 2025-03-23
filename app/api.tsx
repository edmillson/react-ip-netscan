import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, SegmentedButtons, Text, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAppStore from '../store/useAppStore';
import { configureViaAPI } from '../services/network';
import { GlobalStyles, FormStyles, ResultStyles } from '../styles';

export default function APIScreen() {
  const theme = useTheme();
  const selectedDevice = useAppStore(state => state.selectedDevice);
  const addHistoryItem = useAppStore(state => state.addHistoryItem);
  
  const [deviceType, setDeviceType] = useState('intelbras');
  const [hostAddress, setHostAddress] = useState(selectedDevice?.ip || '192.168.1.1');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // Configurações da rede
  const [ssid, setSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [secureWifiPassword, setSecureWifiPassword] = useState(true);
  const [channel, setChannel] = useState('6');
  
  // Status da operação
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);

  // Atualizar o host quando o dispositivo selecionado mudar
  useEffect(() => {
    if (selectedDevice?.ip) {
      setHostAddress(selectedDevice.ip);
      
      // Definir o tipo de dispositivo com base no fabricante
      if (selectedDevice.vendor) {
        const vendor = selectedDevice.vendor.toLowerCase();
        if (vendor.includes('mikrotik')) setDeviceType('mikrotik');
        else if (vendor.includes('intelbras')) setDeviceType('intelbras');
        else if (vendor.includes('ubiquiti')) setDeviceType('ubiquiti');
      }
    }
  }, [selectedDevice]);

  const applyConfiguration = async () => {
    try {
      setIsLoading(true);
      setResult(null);
      
      // Validar os campos obrigatórios
      if (!hostAddress.trim() || !username.trim()) {
        setResult({
          success: false,
          message: "Endereço IP e usuário são obrigatórios."
        });
        return;
      }
      
      // Configurações a serem aplicadas
      const config: Record<string, string> = {};
      
      if (ssid.trim()) config.ssid = ssid;
      if (wifiPassword.trim()) config.password = wifiPassword;
      if (channel.trim()) config.channel = channel;
      
      // Se não há nada para configurar
      if (Object.keys(config).length === 0) {
        setResult({
          success: false,
          message: "Nenhuma configuração para aplicar. Informe pelo menos um parâmetro."
        });
        return;
      }
      
      // Aqui utilizamos a função de configuração via API
      const apiResult = await configureViaAPI(
        hostAddress,
        deviceType,
        username,
        password,
        config
      );
      
      setResult(apiResult);
      
      // Registrar a operação no histórico
      addHistoryItem({
        type: 'api',
        device: hostAddress,
        action: `Configuração API: ${Object.keys(config).join(', ')}`,
        status: apiResult.success ? 'success' : 'error',
        details: apiResult.message
      });
    } catch (error) {
      console.error('Erro ao aplicar configuração:', error);
      
      setResult({
        success: false,
        message: `Erro ao aplicar configuração: ${error instanceof Error ? error.message : 'Falha na comunicação com o dispositivo'}`
      });
      
      // Registrar erro no histórico
      addHistoryItem({
        type: 'api',
        device: hostAddress,
        action: 'Configuração API',
        status: 'error',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <StatusBar style="auto" />
      <View style={GlobalStyles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall">Configuração via API</Text>
        <View style={GlobalStyles.spacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={GlobalStyles.content}>
          <Card style={GlobalStyles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={FormStyles.sectionTitle}>
                Acesso ao Dispositivo
              </Text>
              
              <SegmentedButtons
                value={deviceType}
                onValueChange={setDeviceType}
                buttons={[
                  { value: 'mikrotik', label: 'Mikrotik', icon: 'router' },
                  { value: 'intelbras', label: 'Intelbras', icon: 'router-wireless' },
                  { value: 'ubiquiti', label: 'Ubiquiti', icon: 'access-point' },
                ]}
                style={{ marginBottom: 16 }}
              />
              
              <TextInput
                label="Endereço IP"
                value={hostAddress}
                onChangeText={setHostAddress}
                mode="outlined"
                style={GlobalStyles.input}
              />
              
              <TextInput
                label="Usuário"
                value={username}
                onChangeText={setUsername}
                mode="outlined"
                style={GlobalStyles.input}
              />
              
              <TextInput
                label="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureTextEntry}
                mode="outlined"
                style={GlobalStyles.input}
                right={
                  <TextInput.Icon 
                    icon={secureTextEntry ? 'eye' : 'eye-off'} 
                    onPress={() => setSecureTextEntry(!secureTextEntry)} 
                  />
                }
              />
            </Card.Content>
          </Card>
          
          <Card style={GlobalStyles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={FormStyles.sectionTitle}>
                Configurações de Rede
              </Text>
              
              <TextInput
                label="SSID (Nome da Rede)"
                value={ssid}
                onChangeText={setSsid}
                mode="outlined"
                style={GlobalStyles.input}
              />
              
              <TextInput
                label="Senha do Wi-Fi"
                value={wifiPassword}
                onChangeText={setWifiPassword}
                secureTextEntry={secureWifiPassword}
                mode="outlined"
                style={GlobalStyles.input}
                right={
                  <TextInput.Icon 
                    icon={secureWifiPassword ? 'eye' : 'eye-off'} 
                    onPress={() => setSecureWifiPassword(!secureWifiPassword)} 
                  />
                }
              />
              
              <TextInput
                label="Canal"
                value={channel}
                onChangeText={setChannel}
                mode="outlined"
                style={GlobalStyles.input}
                keyboardType="number-pad"
              />
              
              <Divider style={GlobalStyles.divider} />
              
              <Button 
                mode="contained" 
                onPress={applyConfiguration}
                icon="send"
                style={GlobalStyles.button}
                loading={isLoading}
                disabled={isLoading}
              >
                Aplicar Configuração
              </Button>
            </Card.Content>
          </Card>
          
          {result && (
            <Card style={[GlobalStyles.card, { 
              backgroundColor: result.success 
                ? theme.colors.primaryContainer 
                : theme.colors.errorContainer 
            }]}>
              <Card.Content>
                <Text variant="titleMedium" style={{
                  color: result.success 
                    ? theme.colors.primary 
                    : theme.colors.error
                }}>
                  {result.success ? 'Sucesso!' : 'Erro na Configuração'}
                </Text>
                <Text style={{
                  marginTop: 8,
                  color: result.success 
                    ? theme.colors.primary 
                    : theme.colors.error
                }}>
                  {result.message}
                </Text>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 