import React, { useState } from 'react';
import { View, FlatList } from 'react-native';
import { Avatar, Button, Card, Divider, IconButton, Text, TouchableRipple, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../styles';

// Tipos para as mensagens, caso necessário no futuro
type MessageType = 'alert' | 'notification' | 'update';

interface Message {
  id: string;
  title: string;
  content: string;
  timestamp: string;
  type: MessageType;
  read: boolean;
}

// Lista vazia de mensagens
const MOCK_MESSAGES: Message[] = [];

export default function WinBoxScreen() {
  const theme = useTheme();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);

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

  const getIconForType = (type: MessageType) => {
    switch (type) {
      case 'alert': return 'alert-circle';
      case 'notification': return 'bell';
      case 'update': return 'update';
      default: return 'email';
    }
  };

  const getIconColorForType = (type: MessageType) => {
    switch (type) {
      case 'alert': return theme.colors.error;
      case 'notification': return theme.colors.primary;
      case 'update': return theme.colors.secondary;
      default: return theme.colors.primary;
    }
  };
  
  const markAllAsRead = () => {
    setMessages(messages.map(msg => ({ ...msg, read: true })));
  };

  const markAsRead = (id: string) => {
    setMessages(messages.map(msg => 
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const deleteMessage = (id: string) => {
    setMessages(messages.filter(msg => msg.id !== id));
  };

  const renderMessageItem = ({ item }: { item: Message }) => (
    <Card 
      style={[
        GlobalStyles.card, 
        { opacity: item.read ? 0.8 : 1 }
      ]}
    >
      <TouchableRipple 
        onPress={() => markAsRead(item.id)}
        style={{ borderRadius: 8 }}
      >
        <Card.Content>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Avatar.Icon 
              size={40} 
              icon={getIconForType(item.type)} 
              style={{ backgroundColor: getIconColorForType(item.type) }}
            />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text variant="titleMedium" style={{ fontWeight: item.read ? 'normal' : 'bold' }}>
                {item.title}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {formatDate(item.timestamp)}
              </Text>
            </View>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => deleteMessage(item.id)}
            />
          </View>
          
          <Text variant="bodyMedium" style={{ marginBottom: 4 }}>
            {item.content}
          </Text>
          
          {!item.read && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text 
                variant="labelSmall" 
                style={{ 
                  color: theme.colors.primary,
                  backgroundColor: theme.colors.primaryContainer,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 4
                }}
              >
                Nova
              </Text>
            </View>
          )}
        </Card.Content>
      </TouchableRipple>
    </Card>
  );

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <StatusBar style="auto" />
      <View style={GlobalStyles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => router.back()} />
        <Text variant="headlineSmall">WinBox</Text>
        <View style={GlobalStyles.spacer} />
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={GlobalStyles.content}
        ListEmptyComponent={
          <View style={GlobalStyles.emptyStateContainer}>
            <Text style={{ color: theme.colors.outline }}>Sem dados para exibir</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
} 