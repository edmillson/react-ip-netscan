import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import { Text, TextInput, Button, Switch, Card, List, Divider } from 'react-native-paper';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAppStore from '../store/useAppStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

/**
 * Tela de configurações do aplicativo
 * Permite ao usuário configurar o prefixo de rede, timeout do escaneamento e modo de simulação
 * @returns Componente de tela de configurações
 */
export default function ConfiguracoesScreen() {
  const router = useRouter();
  const { settings, updateSettings, handleResetSettings } = useAppStore();
  
  // Estado local para os campos de configuração
  const [networkPrefix, setNetworkPrefix] = useState(settings.networkPrefix);
  const [scanTimeout, setScanTimeout] = useState(settings.scanTimeout.toString());
  
  // Atualiza o estado local quando as configurações do store mudarem
  useEffect(() => {
    setNetworkPrefix(settings.networkPrefix);
    setScanTimeout(settings.scanTimeout.toString());
  }, [settings]);
  
  /**
   * Salva as configurações no store após validar os valores inseridos
   */
  const handleSaveSettings = () => {
    try {
      // Validar prefixo de rede
      if (!networkPrefix.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)) {
        Alert.alert(
          'Prefixo de Rede Inválido',
          'O prefixo de rede deve estar no formato "xxx.xxx.xxx" (ex: 192.168.0)'
        );
        return;
      }
      
      // Validar timeout
      const timeoutValue = parseInt(scanTimeout, 10);
      if (isNaN(timeoutValue) || timeoutValue < 1000 || timeoutValue > 30000) {
        Alert.alert(
          'Timeout Inválido',
          'O timeout deve ser um número entre 1000 e 30000 milissegundos'
        );
        return;
      }
      
      // Atualizar configurações
      updateSettings({
        networkPrefix,
        scanTimeout: timeoutValue,
      });
      
      Alert.alert('Sucesso', 'Configurações salvas com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar as configurações.');
    }
  };
  
  /**
   * Reseta as configurações para os valores padrão após confirmação do usuário
   * Usa a função centralizada do store para garantir consistência
   */
  const onResetSettings = () => {
    handleResetSettings();
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Configurações',
          headerStyle: {
            backgroundColor: Colors.light.tint,
          },
          headerTintColor: '#fff',
        }}
      />
      
      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Title title="Configurações de Rede" />
          <Card.Content>
            <Text style={styles.label}>Prefixo de Rede</Text>
            <TextInput
              style={styles.input}
              value={networkPrefix}
              onChangeText={setNetworkPrefix}
              placeholder="Ex: 192.168.0"
              mode="outlined"
              right={<TextInput.Affix text=".x" />}
            />
            <Text style={styles.helpText}>
              Define a faixa de IPs que será escaneada. O app tenta detectar automaticamente, mas você pode configurar manualmente.
            </Text>
            
            <Text style={styles.label}>Timeout do Escaneamento (ms)</Text>
            <TextInput
              style={styles.input}
              value={scanTimeout}
              onChangeText={setScanTimeout}
              placeholder="5000"
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text="ms" />}
            />
            <Text style={styles.helpText}>
              Tempo máximo (em milissegundos) para aguardar o escaneamento de rede. Recomendado: 5000ms.
            </Text>
          </Card.Content>
        </Card>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained" 
            onPress={handleSaveSettings}
            style={styles.button}
            buttonColor={Colors.light.tint}
          >
            Salvar Configurações
          </Button>
          
          <Button 
            mode="outlined" 
            onPress={onResetSettings}
            style={styles.button}
          >
            Resetar para Padrão
          </Button>
        </View>
        
        <Card style={styles.card}>
          <Card.Title title="Informações" />
          <Card.Content>
            <List.Item
              title="IP NetScan"
              description="Versão 1.0.0"
              left={props => <List.Icon {...props} icon="information" />}
            />
            
            <Divider style={styles.divider} />
            
            <List.Item
              title="Sobre este App"
              description="Aplicativo para escaneamento de rede, detecção de fabricantes e gerenciamento de dispositivos."
              left={props => <List.Icon {...props} icon="cellphone-link" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    margin: 16,
  },
  button: {
    marginVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
}); 