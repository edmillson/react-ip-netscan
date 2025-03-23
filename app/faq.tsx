import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text, List, IconButton, Divider } from 'react-native-paper';
import { router } from 'expo-router';

import { GlobalStyles } from '../styles';

// Dados de perguntas frequentes
const FAQ_ITEMS = [
  {
    question: 'Como escanear minha rede?',
    answer: `Para escanear sua rede, siga estes passos:
1. Na tela inicial, toque no botão "Iniciar Escaneamento".
2. Aguarde enquanto o aplicativo busca por dispositivos na sua rede.
3. Após a conclusão, você verá uma lista de dispositivos encontrados.
    
É importante estar conectado a uma rede Wi-Fi para obter melhores resultados.`
  },
  {
    question: 'Como usar o WinBox para configurar meu roteador MikroTik?',
    answer: `Para acessar o WinBox e configurar seu dispositivo MikroTik:
1. Na tela inicial, toque no botão "WinBox".
2. Selecione a opção "MikroTik (WinBox)" no menu.
3. Escolha o dispositivo MikroTik na lista de dispositivos encontrados.
4. Insira suas credenciais de login quando solicitado.
    
O aplicativo então se conectará ao seu dispositivo MikroTik.`
  },
  {
    question: 'Como configurar um dispositivo Intelbras?',
    answer: `Para configurar um dispositivo Intelbras:
1. Na tela inicial, toque no botão "WinBox".
2. Selecione "Intelbras" no menu de opções.
3. Escolha o dispositivo Intelbras na lista.
4. Insira suas credenciais de acesso (o padrão geralmente é admin/admin).
    
Você será conectado à interface web de gerenciamento do dispositivo.`
  },
  {
    question: 'O que significa quando um dispositivo aparece como "offline"?',
    answer: `Um dispositivo marcado como "offline" significa que ele foi detectado na rede anteriormente, mas não está respondendo no momento. Isso pode ocorrer por vários motivos:
    
1. O dispositivo está desligado ou desconectado da rede.
2. Há um firewall bloqueando as solicitações do aplicativo.
3. O dispositivo pode estar configurado para não responder a solicitações de ping.
    
Tente reiniciar o dispositivo ou verificar sua conexão de rede.`
  },
  {
    question: 'Como visualizar detalhes de um dispositivo específico?',
    answer: `Para ver detalhes completos de um dispositivo:
    
1. Escaneie sua rede ou acesse "Todos os Dispositivos" pelo botão WinBox.
2. Na lista de dispositivos, toque no dispositivo que deseja examinar.
3. Uma tela de detalhes será aberta com informações como endereço IP, MAC, 
   portas abertas e outras informações disponíveis.`
  },
  {
    question: 'O aplicativo funciona com qualquer tipo de roteador?',
    answer: `O IP NetScan é otimizado para trabalhar com dispositivos MikroTik e Intelbras, 
oferecendo funcionalidades específicas para esses fabricantes.
    
No entanto, a função de escaneamento de rede e identificação de dispositivos
funciona com qualquer tipo de rede e roteador. Você poderá ver detalhes básicos de 
todos os dispositivos conectados à sua rede, independentemente do fabricante.`
  },
  {
    question: 'Como atualizar as informações dos dispositivos?',
    answer: `Para atualizar as informações dos dispositivos:
    
1. Na tela de "Todos os Dispositivos", use o botão de atualização (ícone circular) 
   localizado no canto inferior direito da tela.
2. Você também pode iniciar um novo escaneamento completo da rede pela tela inicial
   para atualizar todas as informações.
    
É recomendável atualizar periodicamente para manter as informações precisas.`
  }
];

/**
 * Tela de Perguntas Frequentes (FAQ)
 */
export default function FAQScreen() {
  // Estado para controlar quais itens estão expandidos
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  
  // Função para alternar expansão de um item
  const toggleExpand = (index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
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
        <Text variant="headlineSmall">Perguntas Frequentes</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.introText}>
          Confira abaixo as respostas para as dúvidas mais comuns sobre o uso do IP NetScan.
          Caso não encontre o que procura, entre em contato conosco através da tela de Suporte.
        </Text>
        
        <View style={styles.faqContainer}>
          {FAQ_ITEMS.map((item, index) => (
            <React.Fragment key={index}>
              <List.Accordion
                title={item.question}
                expanded={expandedItems[index] || false}
                onPress={() => toggleExpand(index)}
                titleStyle={styles.questionText}
                style={styles.accordionItem}
              >
                <View style={styles.answerContainer}>
                  <Text style={styles.answerText}>{item.answer}</Text>
                </View>
              </List.Accordion>
              {index < FAQ_ITEMS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </View>
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
  introText: {
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  faqContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  accordionItem: {
    backgroundColor: '#f9f9f9',
  },
  questionText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  answerContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
}); 