import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text, Button, IconButton, Card, Divider, List } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { GlobalStyles } from '../styles';

// Chaves para armazenamento no AsyncStorage
const STORAGE_KEYS = {
  WHATSAPP_NUMBER: 'settings.whatsapp_number',
  WHATSAPP_MESSAGE: 'settings.whatsapp_message'
};

/**
 * Tela de suporte e contato
 */
export default function SupportScreen() {
  const [whatsappNumber, setWhatsappNumber] = useState('5500000000000');
  const [whatsappMessage, setWhatsappMessage] = useState('Olá! Estou usando o aplicativo IP NetScan e preciso de ajuda.');
  
  // Carregar configurações do WhatsApp do armazenamento local
  useEffect(() => {
    const loadWhatsAppSettings = async () => {
      try {
        const storedNumber = await AsyncStorage.getItem(STORAGE_KEYS.WHATSAPP_NUMBER);
        const storedMessage = await AsyncStorage.getItem(STORAGE_KEYS.WHATSAPP_MESSAGE);
        
        if (storedNumber) setWhatsappNumber(storedNumber);
        if (storedMessage) setWhatsappMessage(storedMessage);
      } catch (error) {
        console.error('Erro ao carregar configurações do WhatsApp:', error);
      }
    };
    
    loadWhatsAppSettings();
  }, []);

  // Função para abrir o WhatsApp com mensagem predefinida
  const openWhatsApp = async () => {
    try {
      // Criar a URL do WhatsApp com o número e a mensagem
      const whatsappUrl = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}`;
      
      // Verificar se o WhatsApp pode ser aberto
      Linking.canOpenURL(whatsappUrl)
        .then(supported => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            // Tentar abrir o WhatsApp Web como alternativa
            const webWhatsapp = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(whatsappMessage)}`;
            Linking.openURL(webWhatsapp).catch(() => {
              Alert.alert(
                'WhatsApp não disponível',
                'O WhatsApp não está instalado ou não pode ser aberto neste dispositivo.',
                [{ text: 'OK' }]
              );
            });
          }
        })
        .catch(err => {
          console.error('Erro ao abrir WhatsApp:', err);
          Alert.alert(
            'Erro',
            'Não foi possível abrir o WhatsApp. Tente novamente mais tarde.',
            [{ text: 'OK' }]
          );
        });
    } catch (error) {
      console.error('Erro ao ler configurações do WhatsApp:', error);
      Alert.alert(
        'Erro',
        'Não foi possível abrir o WhatsApp com as configurações salvas.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Função para abrir o email
  const openEmail = () => {
    const email = 'suporte@example.com';
    const subject = 'Suporte IP NetScan';
    const body = 'Olá, estou precisando de ajuda com o aplicativo IP NetScan.\n\n';
    
    const emailUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.canOpenURL(emailUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(emailUrl);
        } else {
          Alert.alert(
            'Email não configurado',
            'Não foi possível abrir o aplicativo de email. Por favor, envie um email para suporte@example.com.',
            [{ text: 'OK' }]
          );
        }
      })
      .catch(err => {
        console.error('Erro ao abrir email:', err);
        Alert.alert(
          'Erro',
          'Não foi possível abrir o email. Tente novamente mais tarde.',
          [{ text: 'OK' }]
        );
      });
  };
  
  return (
    <SafeAreaView style={GlobalStyles.container}>
      <StatusBar style="auto" />
      <View style={GlobalStyles.header}>
        <IconButton 
          icon="arrow-left" 
          size={24} 
          onPress={() => router.back()}
        />
        <Text variant="headlineSmall">Suporte</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.card}>
          <Card.Cover source={require('../../assets/support-image.jpg')} style={styles.coverImage} />
          <Card.Content>
            <Text variant="titleLarge" style={styles.title}>Como podemos ajudar?</Text>
            <Text variant="bodyMedium" style={styles.description}>
              Estamos aqui para ajudar com qualquer dúvida sobre o IP NetScan. 
              Escolha uma das opções abaixo para entrar em contato com nossa equipe de suporte.
            </Text>
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Opções de Contato</Text>
            <Divider style={styles.divider} />
            
            <List.Item
              title="WhatsApp"
              description="Atendimento rápido via mensagens"
              left={props => <List.Icon {...props} icon="whatsapp" color="#25D366" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={openWhatsApp}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Email"
              description="suporte@example.com"
              left={props => <List.Icon {...props} icon="email" color="#0288d1" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={openEmail}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Perguntas Frequentes"
              description="Consulte nossa base de conhecimento"
              left={props => <List.Icon {...props} icon="frequently-asked-questions" color="#FFC107" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => router.push("/faq")}
              style={styles.listItem}
            />
          </Card.Content>
        </Card>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Sobre o Aplicativo</Text>
            <Divider style={styles.divider} />
            
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>Versão:</Text> 1.0.0
            </Text>
            
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>Desenvolvido por:</Text> Sua Empresa
            </Text>
            
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: 'bold' }}>Website:</Text> www.example.com
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  coverImage: {
    height: 150,
    resizeMode: 'cover',
  },
  title: {
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    color: '#666',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 8,
  },
  infoText: {
    marginBottom: 8,
  },
}); 