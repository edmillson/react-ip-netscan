import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Button, Text, useTheme, IconButton } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalStyles } from '../styles';
import { router } from 'expo-router';

/**
 * Tela inicial do aplicativo
 * Apresenta o logo e botões de navegação para as principais funcionalidades
 * @returns Componente da tela inicial
 */
export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  /**
   * Navega para a tela de configurações
   */
  const handleOpenSettings = () => {
    router.push('/configuracoes');
  };

  /**
   * Navega para a tela de WinBox
   */
  const handleOpenWinBox = () => {
    router.push('/winbox' as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <IconButton
          icon="cog"
          size={24}
          onPress={handleOpenSettings}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>IP NetScan</Text>
          <Text 
            style={styles.appSubtitle}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            Escaneie sua rede, identifique dispositivos, gerencie suas configurações
          </Text>
          
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Para melhor funcionamento do app, certifique-se de estar conectado a uma rede Wi-Fi.
            </Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Link href="/scan" asChild>
            <Button 
              mode="contained" 
              style={styles.button}
              icon="magnify"
            >
              Iniciar Escaneamento
            </Button>
          </Link>
          
          <Button 
            mode="contained"
            style={[styles.button, { backgroundColor: theme.colors.secondary }]}
            icon="application-cog"
            onPress={handleOpenWinBox}
          >
            WinBox
          </Button>
          
          <Link href="/history" asChild>
            <Button 
              mode="outlined" 
              style={[styles.button, styles.secondaryButton]}
              icon="history"
            >
              Histórico
            </Button>
          </Link>
        </View>
      </View>
      <View style={styles.supportButtonContainer}>
        <TouchableOpacity 
          style={styles.supportButton}
          onPress={() => router.push('/support')}
        >
          <IconButton icon="help-circle" size={24} />
          <Text style={styles.supportButtonText}>Suporte</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerSpacer: {
    width: 40, // Para manter o ícone de configurações alinhado à direita
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  warningContainer: {
    backgroundColor: '#ffd700',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
    width: '100%',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  supportButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  supportButton: {
    backgroundColor: '#5271ff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  supportButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
}); 