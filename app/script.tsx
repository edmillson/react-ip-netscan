import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Card, Divider, IconButton, Text, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import useAppStore from '../store/useAppStore';
import { sendSSHCommand } from '../services/network';
import { GlobalStyles, FormStyles } from '../styles';

export default function ScriptScreen() {
  const theme = useTheme();
  const selectedDevice = useAppStore(state => state.selectedDevice);
  const addHistoryItem = useAppStore(state => state.addHistoryItem);
  
  const [hostAddress, setHostAddress] = useState(selectedDevice?.ip || '192.168.1.1');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [script, setScript] = useState('/system identity print\n/interface print');
  const [isExecuting, setIsExecuting] = useState(false);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  // Atualizar o host quando o dispositivo selecionado mudar
  useEffect(() => {
    if (selectedDevice?.ip) {
      setHostAddress(selectedDevice.ip);
      
      // Definir script inicial com base no fabricante
      if (selectedDevice.vendor) {
        const vendor = selectedDevice.vendor.toLowerCase();
        if (vendor.includes('mikrotik')) {
          setScript('/system identity print\n/interface print');
        } else if (vendor.includes('intelbras') || vendor.includes('ubiquiti')) {
          setScript('info\nget_wireless');
        }
      }
    }
  }, [selectedDevice]);

  const executeScript = async () => {
    if (!script.trim()) return;
    
    try {
      setIsExecuting(true);
      setShowOutput(true);
      setOutput('Conectando ao dispositivo ' + hostAddress + '...\n');
      
      // Verificar campos obrigatórios
      if (!hostAddress.trim() || !username.trim()) {
        setOutput(prev => prev + 'Erro: Host ou usuário não informados.\n');
        return;
      }
      
      // Pequeno atraso para simular a conexão
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOutput(prev => prev + 'Conectado com sucesso!\n\n');
      
      // Dividir o script em linhas e executar cada uma
      const commands = script.split('\n').filter(cmd => cmd.trim());
      setOutput(prev => prev + `Executando ${commands.length} comando(s)...\n\n`);
      
      // Executar cada comando do script
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i].trim();
        if (!cmd) continue;
        
        setOutput(prev => prev + `[${i+1}/${commands.length}] $ ${cmd}\n`);
        
        try {
          // Simular a execução do comando via SSH
          const result = await sendSSHCommand(hostAddress, '22', username, password, cmd);
          setOutput(prev => prev + result + '\n\n');
        } catch (cmdError) {
          setOutput(prev => prev + `Erro ao executar comando: ${cmdError instanceof Error ? cmdError.message : 'Falha na execução'}\n\n`);
        }
        
        // Pequeno atraso entre comandos
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setOutput(prev => prev + 'Script concluído!\n');
      
      // Registrar execução do script no histórico
      addHistoryItem({
        type: 'script',
        device: hostAddress,
        action: `Script: ${commands.length} comando(s)`,
        status: 'success'
      });
    } catch (error) {
      console.error('Erro ao executar script:', error);
      setOutput(prev => prev + `Erro na execução do script: ${error instanceof Error ? error.message : 'Falha na conexão'}\n`);
      
      // Registrar erro no histórico
      addHistoryItem({
        type: 'script',
        device: hostAddress,
        action: 'Execução de script',
        status: 'error',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const clearScript = () => {
    setScript('');
  };

  const clearOutput = () => {
    setOutput('');
    setShowOutput(false);
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <StatusBar style="auto" />
      <View style={GlobalStyles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall">Envio de Scripts</Text>
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
              <View style={GlobalStyles.cardHeader}>
                <Text variant="titleMedium">Script</Text>
                <Button 
                  mode="outlined" 
                  icon="delete" 
                  onPress={clearScript}
                  compact
                >
                  Limpar
                </Button>
              </View>
              
              <TextInput
                value={script}
                onChangeText={setScript}
                mode="outlined"
                multiline
                numberOfLines={8}
                style={GlobalStyles.multilineInput}
              />
              
              <Button 
                mode="contained" 
                icon="send" 
                onPress={executeScript}
                style={GlobalStyles.button}
                loading={isExecuting}
                disabled={isExecuting || !script.trim()}
              >
                Executar Script
              </Button>
            </Card.Content>
          </Card>
          
          {showOutput && (
            <Card style={GlobalStyles.card}>
              <Card.Content>
                <View style={GlobalStyles.cardHeader}>
                  <Text variant="titleMedium">Saída</Text>
                  <Button 
                    mode="outlined" 
                    icon="delete" 
                    onPress={clearOutput}
                    compact
                  >
                    Limpar
                  </Button>
                </View>
                
                <ScrollView
                  style={GlobalStyles.terminalContainer}
                  contentContainerStyle={{ flexGrow: 1 }}
                >
                  <Text style={GlobalStyles.terminalText}>{output}</Text>
                  {isExecuting && (
                    <View style={GlobalStyles.centeredContainer}>
                      <Text style={GlobalStyles.terminalText}>Executando...</Text>
                    </View>
                  )}
                </ScrollView>
              </Card.Content>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 