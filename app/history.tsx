import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import useAppStore, { HistoryItem } from '../store/useAppStore';

// Dados simulados - serão substituídos por AsyncStorage
const MOCK_HISTORY = [
  { 
    id: '1', 
    type: 'ssh', 
    device: '192.168.1.1', 
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), 
    action: 'Comando SSH: /system identity print',
    status: 'success'
  },
  { 
    id: '2', 
    type: 'api', 
    device: '192.168.1.2', 
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), 
    action: 'Configuração de SSID via API',
    status: 'success'
  },
  { 
    id: '3', 
    type: 'script', 
    device: '192.168.1.3', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), 
    action: 'Execução de script (3 comandos)',
    status: 'error'
  },
  { 
    id: '4', 
    type: 'ssh', 
    device: '192.168.1.1', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    action: 'Comando SSH: /interface print',
    status: 'success'
  },
];

export default function HistoryScreen() {
  const theme = useTheme();
  const history = useAppStore(state => state.history);
  const clearHistory = useAppStore(state => state.clearHistory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'ssh': return 'console';
      case 'api': return 'api';
      case 'script': return 'script-text';
      default: return 'history';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? theme.colors.primary : theme.colors.error;
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <Card style={styles.historyCard}>
      <TouchableRipple onPress={() => {/* Implementar visualização de detalhes */}}>
        <Card.Content>
          <View style={styles.historyHeader}>
            <IconButton 
              icon={getIconForType(item.type)} 
              size={24} 
              style={{ margin: 0 }}
            />
            <Text variant="titleMedium" style={styles.deviceText}>
              {item.device}
            </Text>
            <Chip 
              mode="outlined" 
              style={[
                styles.statusChip, 
                { borderColor: getStatusColor(item.status) }
              ]}
              textStyle={{ color: getStatusColor(item.status) }}
            >
              {item.status === 'success' ? 'Sucesso' : 'Erro'}
            </Chip>
          </View>
          
          <Text style={styles.actionText}>{item.action}</Text>
          
          <View style={styles.timestampContainer}>
            <Text style={styles.timestamp}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        </Card.Content>
      </TouchableRipple>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall">Histórico de Ações</Text>
        <IconButton 
          icon="delete-outline" 
          size={24} 
          onPress={clearHistory} 
          disabled={history.length === 0}
        />
      </View>

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum histórico disponível.</Text>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  historyCard: {
    marginBottom: 12,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceText: {
    flex: 1,
    marginLeft: 8,
  },
  statusChip: {
    height: 28,
  },
  actionText: {
    marginBottom: 8,
  },
  timestampContainer: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
}); 