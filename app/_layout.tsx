import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { MD3LightTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import * as Location from 'expo-location';
import { Alert, View, ActivityIndicator } from 'react-native';

// Impedir que a tela de splash seja ocultada automaticamente
SplashScreen.preventAutoHideAsync();

// Definindo o tema personalizado
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: Colors.light.tint,
    primaryContainer: '#d1e4ff',
    secondary: '#4d5d76',
    secondaryContainer: '#d6e3ff',
    tertiary: '#006875',
    tertiaryContainer: '#95f1ff',
    background: '#f5f5f5',
    error: '#ba1a1a',
  },
};

/**
 * Layout principal do aplicativo
 * Configura o provedor de tema, área segura e pilha de navegação
 * @returns Componente de layout raiz
 */
export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  
  const [isPermissionChecked, setIsPermissionChecked] = useState(false);

  // Função para verificar e solicitar permissões necessárias
  const checkPermissions = async () => {
    try {
      // Verifica permissão de localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'O aplicativo precisa de permissão para acessar sua localização para detectar dispositivos na rede Wi-Fi.',
          [{ text: 'OK' }]
        );
      }
      
      setIsPermissionChecked(true);
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      Alert.alert(
        'Erro ao verificar permissões',
        'Ocorreu um erro ao verificar as permissões necessárias. O aplicativo pode não funcionar corretamente.',
        [{ text: 'OK' }]
      );
      setIsPermissionChecked(true);
    }
  };

  // Efeito para ocultar a tela de splash quando as fontes forem carregadas
  useEffect(() => {
    if (error) throw error;
    
    if (loaded) {
      // Verificar permissões antes de ocultar a tela de splash
      checkPermissions().finally(() => {
        SplashScreen.hideAsync();
      });
    }
  }, [loaded, error]);

  if (!loaded || !isPermissionChecked) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="scan" />
          <Stack.Screen name="device/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="ssh" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="api" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="script" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="history" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="configuracoes" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="winbox" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="intelbras" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="devices" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="support" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="faq" options={{ headerShown: false, animation: 'slide_from_right' }} />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
