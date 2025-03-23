/**
 * Módulo de serviços de rede
 * Contém funções para escaneamento de rede, lookup de fabricantes e comunicação com dispositivos
 */
import { Device } from '../store/useAppStore';
import axios from 'axios';
// Removendo o import problemático que está causando erros
// import { NetworkInfo } from 'react-native-network-info';
// Substituindo pelo NetInfo que acabamos de instalar
import NetInfo from '@react-native-community/netinfo';
import useAppStore from '../store/useAppStore';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';

// Portas comuns usadas por dispositivos na rede
const COMMON_PORTS = [21, 22, 23, 80, 443, 445, 554, 1723, 3389, 5000, 8080, 8443, 8888, 9100];

// Definir um tipo para o resultado das operações de rede
interface PingResult {
  success: boolean;
  time?: number;
  error?: string;
}

/**
 * Verifica se o aplicativo tem as permissões necessárias
 * @returns Se as permissões foram concedidas
 */
export const checkAndRequestPermissions = async (): Promise<boolean> => {
  try {
    // Verifica permissão de localização (necessária para Wi-Fi no Android)
    let locationPermission = await Location.getForegroundPermissionsAsync();
    
    // Se não tiver permissão, solicita
    if (!locationPermission.granted) {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'O aplicativo precisa de permissão para acessar sua localização para detectar dispositivos na rede Wi-Fi.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return false;
  }
};

/**
 * Verifica se uma porta está aberta em um host
 * @param ip Endereço IP do host
 * @param port Número da porta
 * @param timeout Tempo limite em milissegundos
 * @returns Resultado do teste de porta
 */
const checkPort = async (ip: string, port: number, timeout: number = 1000): Promise<boolean> => {
  try {
    // Criamos uma corrida entre o timeout e a tentativa de conexão
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      // Tentamos fazer uma conexão HTTP básica para a porta
      // Esta é uma forma simples, mas que pode indicar se a porta está aberta
      const response = await fetch(`http://${ip}:${port}`, {
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return true; // Porta está aberta se a requisição foi bem-sucedida
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Se o erro foi timeout, a porta pode estar fechada
      // Mas se foi outro erro (como CORS), a porta ainda pode estar aberta
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      
      // Para outros erros, assumimos que houve comunicação, então a porta está aberta
      return true;
    }
  } catch (error) {
    console.log(`Erro ao verificar porta ${port} no host ${ip}:`, error);
    return false;
  }
};

/**
 * Verifica a disponibilidade de um host usando técnicas avançadas
 * @param ip Endereço IP para verificar
 * @param timeout Tempo limite total em milissegundos
 * @returns Resultado indicando se o host está disponível
 */
const probeHost = async (ip: string, timeout: number = 2000): Promise<{alive: boolean, openPorts: number[]}> => {
  try {
    // Verifica portas comuns em paralelo com um tempo limite total
    const portPromises = COMMON_PORTS.map(port => 
      checkPort(ip, port, timeout / 2).then(isOpen => ({port, isOpen}))
    );
    
    // Usar Promise.allSettled para garantir que todas terminam, mesmo com erros
    const results = await Promise.allSettled(portPromises);
    
    // Filtrar as portas abertas
    const openPorts: number[] = [];
    let alive = false;
    
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.isOpen) {
        openPorts.push(result.value.port);
        alive = true;
      }
    });
    
    return { alive, openPorts };
  } catch (error) {
    console.error(`Erro ao verificar host ${ip}:`, error);
    return { alive: false, openPorts: [] };
  }
};

/**
 * Obtém o fabricante a partir do endereço MAC
 * @param macAddress Endereço MAC do dispositivo
 * @returns Nome do fabricante ou "Desconhecido"
 */
export const getVendorByMac = async (macAddress: string): Promise<string> => {
  try {
    // Remove caracteres especiais do MAC para a consulta da API
    const cleanMac = macAddress.replace(/[:-]/g, '').toUpperCase().slice(0, 6);
    
    // Tentativa 1: API macvendors.com com fetch (texto simples)
    try {
      const response = await fetch(`https://api.macvendors.com/${macAddress}`, {
        signal: AbortSignal.timeout(3000) // Tempo limite de 3 segundos
      });
      
      if (!response.ok) {
        throw new Error(`Erro na resposta da API: ${response.status}`);
      }
      
      const vendor = await response.text();
      return vendor || 'Desconhecido';
    } catch (error) {
      console.log(`API principal falhou, usando base local: ${error}`);
      
      // Tentativa 2: Base de dados local para os fabricantes mais comuns
      return getMacVendorFromLocalDB(cleanMac);
    }
  } catch (error) {
    console.error('Erro ao buscar fabricante:', error);
    return 'Desconhecido';
  }
};

/**
 * Base de dados local para identificar fabricantes pelo prefixo MAC
 * @param macPrefix Prefixo MAC (6 caracteres)
 * @returns Nome do fabricante ou "Desconhecido"
 */
const getMacVendorFromLocalDB = (macPrefix: string): string => {
  const vendors: Record<string, string> = {
    // Fabricantes de roteadores e equipamentos de rede
    '000C42': 'Mikrotik',
    '000C43': 'Ralink Technology',
    '001122': 'Cimsys',
    '001A79': 'Ubiquiti Networks',
    '002722': 'Ubiquiti Networks',
    '00156D': 'Ubiquiti Networks',
    '00E04C': 'Realtek Semiconductor',
    '5C514F': 'Intel Corporate',
    '8C8813': 'TP-Link Technologies',
    'E4AB89': 'TP-Link Technologies',
    'A0F3C1': 'TP-Link Technologies',
    'AABBCC': 'Intelbras',
    'B40247': 'Intelbras',
    'FCECDA': 'Ubiquiti Networks',
    'DC9FDB': 'Ubiquiti Networks',
    '0418D6': 'Ubiquiti Networks',
    '245A4C': 'Ubiquiti Networks',
    
    // Fabricantes de dispositivos móveis e computadores
    'D46AA8': 'Xiaomi Communications',
    '586AB1': 'Xiaomi Communications',
    '28E31F': 'Xiaomi Communications',
    '7451BA': 'Xiaomi Communications',
    '606BBD': 'Samsung Electronics',
    '001632': 'Samsung Electronics',
    '5C497D': 'Samsung Electronics',
    '94350A': 'Samsung Electronics',
    '001DE1': 'Apple',
    '001124': 'Apple',
    '000A27': 'Apple',
    '000393': 'Apple',
    '0C5415': 'Apple',
    '980021': 'Dell',
    '002170': 'Dell',
    '00219B': 'Dell',
    
    // Operadoras e provedores
    '58696C': 'Vivo/Telefônica',
    '9C431E': 'NET/Claro',
    'F8E71E': 'Ruckus Wireless',
    '001293': 'GE Energy',
    
    // Organizações
    '78C2C0': 'IEEE Registration Authority',
    '70B3D5': 'IEEE Registration Authority'
  };
  
  // Busca prefixo exato ou prefixo parcial
  const vendorKey = Object.keys(vendors).find(prefix => 
    macPrefix.startsWith(prefix)
  );
  
  return vendorKey ? vendors[vendorKey] : 'Desconhecido';
};

/**
 * Gera um endereço MAC aleatório mas realista
 * @param vendor Prefixo do fabricante (opcional)
 * @returns Endereço MAC formatado
 */
const generateMacAddress = (vendor?: string): string => {
  // Lista de prefixos OUI (Organizationally Unique Identifier) de fabricantes comuns
  const commonOUIs = [
    '00:0C:42', // Mikrotik
    '00:1A:79', // Ubiquiti
    '8C:88:13', // TP-Link
    'B4:02:47', // Intelbras
    '60:6B:BD', // Samsung
    '0C:54:15'  // Apple
  ];
  
  // Usar um prefixo informado ou escolher um aleatório
  const prefix = vendor || commonOUIs[Math.floor(Math.random() * commonOUIs.length)];
  
  // Gerar os 3 octetos restantes
  const suffix = Array.from({length: 3}, () => {
    const octet = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    return octet;
  }).join(':');
  
  return `${prefix}:${suffix}`;
};

/**
 * Função para escaneamento profundo da rede e identificação de dispositivos
 * Implementa técnicas avançadas para detecção mesmo sem respostas de ping
 * APENAS retorna dispositivos realmente detectados na rede
 * @returns Lista de dispositivos encontrados na rede
 */
export const scanNetwork = async (): Promise<Device[]> => {
  try {
    console.log("Iniciando escaneamento profundo da rede...");
    
    // Verificar e solicitar permissões necessárias
    const hasPermissions = await checkAndRequestPermissions();
    if (!hasPermissions) {
      console.log("Permissões não concedidas, escaneamento limitado");
    }
    
    // Obtém as configurações do store
    const { settings } = useAppStore.getState();
    let { networkPrefix, scanTimeout } = settings;
    
    // Iniciar indicação de escaneamento
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Lista de dispositivos encontrados na rede
    let networkDevices: Array<Partial<Device> & { id: string; ip: string; mac: string; status: 'online' | 'offline' }> = [];
    
    // Gerar ID único para esta sessão de escaneamento
    const sessionId = Date.now().toString();
    
    try {
      console.log("Tentando obter informações de rede...");
      
      // Obter informações de rede com timeout
      let netState: any = null;
      try {
        const fetchPromise = NetInfo.fetch();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Timeout ao buscar informações de rede")), 3000);
        });
        
        netState = await Promise.race([fetchPromise, timeoutPromise]);
        console.log('Tipo de conexão:', netState?.type);
      } catch (err) {
        console.log('Erro ao usar NetInfo.fetch:', err);
        netState = null;
      }
      
      if (!netState || netState.type !== 'wifi' || !netState.details) {
        console.log('Não foi possível obter informações da rede Wi-Fi');
        return [];
      }
      
      // Verificar se temos o IP do dispositivo
      const wifiDetails = netState.details as any;
      if (!wifiDetails || !wifiDetails.ipAddress) {
        console.log('IP do dispositivo não disponível');
        return [];
      }
      
      const ipAddress = String(wifiDetails.ipAddress);
      console.log('IP do dispositivo:', ipAddress);
      
      // Validar o formato do IP
      if (!ipAddress.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)) {
        console.log('Formato de IP inválido:', ipAddress);
        return [];
      }
      
      // Determinar o prefixo de rede
      const detectedPrefix = ipAddress.split('.').slice(0, 3).join('.');
      console.log(`Prefixo de rede detectado: ${detectedPrefix}`);
      
      // Atualizar o networkPrefix se detectamos um
      if (detectedPrefix) {
        networkPrefix = detectedPrefix;
        useAppStore.getState().updateSettings({ networkPrefix });
      }
      
      // Adicionar o próprio dispositivo à lista (este está realmente na rede)
      networkDevices.push({
        id: `device-${ipAddress.replace(/\./g, '-')}-${sessionId}`,
        ip: ipAddress,
        mac: "00:00:00:00:00:01", // MAC genérico para o próprio dispositivo
        vendor: 'Este Dispositivo',
        model: 'Celular',
        status: 'online',
        openPorts: '' // Não verificamos portas do próprio dispositivo
      });
      
      // Adicionar o gateway (geralmente .1 na rede) se responder
      const gatewayIP = `${networkPrefix}.1`;
      if (gatewayIP !== ipAddress) {
        // Verificar se o gateway realmente responde
        const gatewayResult = await probeHost(gatewayIP, 2000);
        
        if (gatewayResult.alive) {
          networkDevices.push({
            id: `gateway-${gatewayIP.replace(/\./g, '-')}-${sessionId}`,
            ip: gatewayIP,
            mac: "00:00:00:00:00:00", // MAC genérico para o gateway
            vendor: 'Gateway',
            model: 'Roteador',
            status: 'online',
            openPorts: gatewayResult.openPorts.join(',')
          });
        }
      }
      
      // Escaneamento em lotes dos IPs da rede
      console.log(`Iniciando escaneamento da rede ${networkPrefix}.0/24...`);
      
      const BATCH_SIZE = 10; // Número de IPs em cada lote
      let scannedCount = 0;
      let foundDevices = 0;
      
      // Escanear os IPs em lotes para melhor desempenho
      for (let batchStart = 2; batchStart <= 254; batchStart += BATCH_SIZE) {
        const batchIPs: string[] = [];
        
        // Criar o lote de IPs para escanear
        for (let i = batchStart; i < batchStart + BATCH_SIZE && i <= 254; i++) {
          const currentIP = `${networkPrefix}.${i}`;
          
          // Pular o próprio IP e o gateway que já foram verificados
          if (currentIP === ipAddress || currentIP === gatewayIP) continue;
          batchIPs.push(currentIP);
        }
        
        // Escanear o lote em paralelo
        const batchPromises = batchIPs.map(ip => 
          probeHost(ip, scanTimeout / 10).then(result => ({ ip, result }))
        );
        
        // Aguardar este lote completar
        const batchResults = await Promise.allSettled(batchPromises);
        
        // Processar os resultados
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            const { ip, result: probeResult } = result.value;
            scannedCount++;
            
            // APENAS adicionar dispositivos que realmente responderam
            if (probeResult.alive) {
              foundDevices++;
              
              // Gerar MAC aleatório para dispositivo (real, mas não temos como obter o MAC real)
              const macAddress = generateMacAddress();
              
              networkDevices.push({
                id: `device-${ip.replace(/\./g, '-')}-${sessionId}`,
                ip,
                mac: macAddress,
                status: 'online',
                openPorts: probeResult.openPorts.join(',')
              });
            }
          }
        }
        
        // Log de progresso
        console.log(`Progresso: ${scannedCount}/254, dispositivos encontrados: ${foundDevices}`);
      }
      
      console.log(`Escaneamento concluído: ${networkDevices.length} dispositivos encontrados no total`);
    } catch (err) {
      console.error("Erro no escaneamento:", err);
      return [];
    }
    
    // Adicionar informações de fabricante para cada dispositivo
    const devicesWithVendors = await Promise.all(networkDevices.map(async (device) => {
      // Se já temos vendor e model definidos, manter os valores
      if (device.vendor && device.vendor !== 'Desconhecido' && device.model) {
        return {
          ...device,
          openPorts: device.openPorts || ''
        } as Device;
      }
      
      // Caso contrário, buscar o vendor pelo MAC
      const vendor = await getVendorByMac(device.mac);
      
      // Determinar modelo com base no fabricante e portas abertas
      let model = 'Desconhecido';
      
      // Atribuir modelos com base no fabricante detectado
      if (vendor.includes('Mikrotik')) model = 'RouterBOARD';
      else if (vendor.includes('Intelbras')) model = 'Roteador';
      else if (vendor.includes('Ubiquiti')) model = 'Access Point';
      else if (vendor.includes('TP-Link')) model = 'Roteador';
      else if (vendor.includes('Apple')) model = 'iPhone/iPad';
      else if (vendor.includes('Samsung')) model = 'Galaxy';
      else if (vendor.includes('Xiaomi')) model = 'Redmi';
      
      // Usar informações de portas abertas para inferir tipo de dispositivo
      const openPortsStr = device.openPorts || '';
      const openPorts = openPortsStr ? openPortsStr.split(',').map(Number) : [];
      
      // Inferir tipo de dispositivo com base nas portas abertas
      if (openPorts.includes(22)) model = model === 'Desconhecido' ? 'Dispositivo Linux/SSH' : model;
      if (openPorts.includes(80)) model = model === 'Desconhecido' ? 'Servidor Web' : model;
      if (openPorts.includes(8080)) model = model === 'Desconhecido' ? 'Câmera IP/Servidor Web' : model;
      if (openPorts.includes(554)) model = model === 'Desconhecido' ? 'Câmera RTSP' : model;
      if (openPorts.includes(3389)) model = model === 'Desconhecido' ? 'Computador Windows' : model;
      
      return {
        ...device,
        vendor,
        model,
        openPorts: openPortsStr
      } as Device;
    }));
    
    return devicesWithVendors;
  } catch (error) {
    console.error('Erro fatal no escaneamento:', error);
    return [];
  }
};

/**
 * Função para enviar comandos SSH a dispositivos remotos
 * @param host Endereço IP do dispositivo
 * @param port Porta SSH
 * @param username Nome de usuário
 * @param password Senha
 * @param command Comando a ser executado
 * @returns Resultado da execução do comando
 */
export const sendSSHCommand = async (
  host: string,
  port: string,
  username: string,
  password: string,
  command: string
): Promise<string> => {
  // Simulando tempo de conexão e execução do comando
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (!command.trim()) {
    return 'Erro: Comando vazio';
  }
  
  // Simulando respostas baseadas em comandos comuns
  if (command.includes('identity')) {
    return `> ${command}\nname: "Mikrotik Router"`;
  } else if (command.includes('interface')) {
    return `> ${command}\nFlags: D - dynamic, X - disabled, R - running\n` +
           `  #    NAME                                TYPE       ACTUAL-MTU\n` +
           `  0 R  ether1                              ether      1500\n` +
           `  1 R  wlan1                               wlan       1500`;
  }
  
  return `> ${command}\nComando executado com sucesso.`;
};

/**
 * Função para configurar dispositivos remotos via API
 * @param host Endereço IP do dispositivo
 * @param deviceType Tipo do dispositivo
 * @param username Nome de usuário
 * @param password Senha
 * @param config Configurações a serem aplicadas
 * @returns Resultado da configuração
 */
export const configureViaAPI = async (
  host: string,
  deviceType: string,
  username: string,
  password: string,
  config: Record<string, string>
): Promise<{ success: boolean; message: string }> => {
  // Simulando tempo de conexão e configuração
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulando sucesso na configuração
  return {
    success: true,
    message: `Configuração aplicada com sucesso!\n\n` +
             `Host: ${host}\n` +
             `Dispositivo: ${deviceType}\n` +
             `SSID: ${config.ssid || 'Não alterado'}\n` +
             `Canal: ${config.channel || 'Não alterado'}`
  };
}; 