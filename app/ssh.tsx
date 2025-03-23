import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Card, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAppStore from '../store/useAppStore';
import { sendSSHCommand } from '../services/network';
import { GlobalStyles, FormStyles } from '../styles';

export default function SSHScreen() {
  const theme = useTheme();
  const selectedDevice = useAppStore(state => state.selectedDevice);
  const addHistoryItem = useAppStore(state => state.addHistoryItem);

  // Estados para formulário e conexão
  const [host, setHost] = useState(selectedDevice?.ip || '192.168.1.1');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Atualizar o host quando o dispositivo selecionado mudar
  useEffect(() => {
    if (selectedDevice?.ip) {
      setHost(selectedDevice.ip);
    }
  }, [selectedDevice]);

  const connect = async () => {
    try {
      setIsConnected(false);
      setIsExecuting(true);
      setOutput('Conectando ao dispositivo ' + host + ':' + port + '...\n');
      
      // Simulação de um pequeno atraso para representar a conexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Conexão bem-sucedida (simulada)
      setIsConnected(true);
      setOutput(prev => prev + 'Conectado com sucesso!\n');
      
      // Registrar ação no histórico
      addHistoryItem({
        type: 'ssh',
        device: host,
        action: 'Conexão SSH',
        status: 'success'
      });
    } catch (error) {
      console.error('Erro na conexão SSH:', error);
      setOutput(prev => prev + 'Falha ao conectar: ' + (error instanceof Error ? error.message : 'Erro desconhecido') + '\n');
      
      // Registrar erro no histórico
      addHistoryItem({
        type: 'ssh',
        device: host,
        action: 'Conexão SSH',
        status: 'error',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setOutput(prev => prev + '\nDesconectado do servidor.\n');
    
    // Registrar ação no histórico
    addHistoryItem({
      type: 'ssh',
      device: host,
      action: 'Desconexão SSH',
      status: 'success'
    });
  };

  const executeCommand = async () => {
    if (!command.trim()) return;
    
    setIsExecuting(true);
    setOutput(prev => prev + '\n$ ' + command + '\n');
    
    try {
      // Aqui usaríamos a função real de SSH
      // Com conexão simulada, usamos a função de mock do serviço
      const result = await sendSSHCommand(host, port, username, password, command);
      setOutput(prev => prev + result + '\n');
      
      // Registrar comando no histórico
      addHistoryItem({
        type: 'ssh',
        device: host,
        action: `Comando: ${command}`,
        status: 'success'
      });
    } catch (error) {
      console.error('Erro ao executar comando:', error);
      setOutput(prev => prev + 'Erro: ' + (error instanceof Error ? error.message : 'Falha na execução') + '\n');
      
      // Registrar erro no histórico
      addHistoryItem({
        type: 'ssh',
        device: host,
        action: `Comando: ${command}`,
        status: 'error',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setCommand('');
      setIsExecuting(false);
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <StatusBar style="auto" />
      <View style={GlobalStyles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall">Acesso SSH</Text>
        <View style={GlobalStyles.spacer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={GlobalStyles.content}>
          {!isConnected ? (
            <Card style={GlobalStyles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={FormStyles.sectionTitle}>
                  Configuração da Conexão SSH
                </Text>
                
                <TextInput
                  label="Host"
                  value={host}
                  onChangeText={setHost}
                  mode="outlined"
                  style={GlobalStyles.input}
                />
                
                <TextInput
                  label="Porta"
                  value={port}
                  onChangeText={setPort}
                  mode="outlined"
                  keyboardType="number-pad"
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
                
                <Button 
                  mode="contained" 
                  onPress={connect}
                  icon="connection"
                  style={GlobalStyles.button}
                  loading={isExecuting}
                  disabled={isExecuting}
                >
                  Conectar
                </Button>
              </Card.Content>
            </Card>
          ) : (
            <>
              <Card style={GlobalStyles.card}>
                <Card.Content>
                  <View style={GlobalStyles.cardHeader}>
                    <Text variant="titleMedium">
                      Conectado a: {host}:{port}
                    </Text>
                    <Button 
                      mode="outlined" 
                      onPress={disconnect}
                      icon="connection-off"
                      compact
                    >
                      Desconectar
                    </Button>
                  </View>
                  
                  <TextInput
                    label="Comando SSH"
                    value={command}
                    onChangeText={setCommand}
                    mode="outlined"
                    style={GlobalStyles.input}
                    right={
                      <TextInput.Icon 
                        icon="send" 
                        onPress={executeCommand}
                        disabled={isExecuting || !command.trim()} 
                      />
                    }
                  />
                </Card.Content>
              </Card>
              
              <Card style={GlobalStyles.card}>
                <Card.Content>
                  <Text variant="titleMedium" style={FormStyles.sectionTitle}>
                    Saída do Terminal
                  </Text>
                  <ScrollView
                    style={GlobalStyles.terminalContainer}
                    contentContainerStyle={{ flexGrow: 1 }}
                  >
                    <Text style={GlobalStyles.terminalText}>{output}</Text>
                    {isExecuting && (
                      <View style={{
                        marginTop: 8,
                        padding: 4,
                        backgroundColor: '#37474F',
                        borderRadius: 4,
                        alignSelf: 'flex-start',
                      }}>
                        <Text style={GlobalStyles.terminalText}>Executando...</Text>
                      </View>
                    )}
                  </ScrollView>
                </Card.Content>
              </Card>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 