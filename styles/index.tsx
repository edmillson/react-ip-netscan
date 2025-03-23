import { StyleSheet, Platform, Dimensions } from 'react-native';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

/**
 * Estilos globais compartilhados para todo o aplicativo
 * Importar este arquivo para reutilizar estilos comuns entre componentes
 */
export const GlobalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  spacer: {
    width: 24,
  },
  
  // Cards
  card: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  // Form inputs
  input: {
    marginBottom: 12,
  },
  multilineInput: {
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  inputRowItem: {
    width: '48%',
  },
  
  // Buttons
  button: {
    marginBottom: 8,
    paddingVertical: 6,
  },
  buttonContainer: {
    marginTop: 8,
  },
  
  // Terminal/Console
  terminalContainer: {
    backgroundColor: '#263238',
    borderRadius: 8,
    padding: 12,
    minHeight: 150,
    maxHeight: 300,
    marginBottom: 12,
  },
  terminalText: {
    color: '#e0e0e0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  
  // Status indicators
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  
  // Lists and item rows
  listContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  
  // Divisores
  divider: {
    marginVertical: 12,
  },
  
  // Text
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  caption: {
    fontSize: 14,
    color: '#757575',
  },
  
  // Estado vazio e carregamento
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

/**
 * Estilos específicos para formulários
 */
export const FormStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  field: {
    flex: 1,
    marginRight: 8,
  },
  lastField: {
    flex: 1,
  },
  label: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
  },
});

/**
 * Estilos para dispositivos e itens de lista
 */
export const DeviceStyles = StyleSheet.create({
  deviceCard: {
    marginBottom: 16,
    elevation: 2,
    borderRadius: 8,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceInfo: {
    marginLeft: 16,
    flex: 1,
  },
  vendorChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  detailLabel: {
    fontWeight: 'bold',
    opacity: 0.7,
  },
  detailValue: {
    textAlign: 'right',
  },
  actionsContainer: {
    marginTop: 8,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

/**
 * Estilos para cards de status/resultado
 */
export const ResultStyles = StyleSheet.create({
  resultCard: {
    marginBottom: 16,
    elevation: 2,
  },
  successText: {
    color: 'green',
  },
  errorText: {
    color: 'red',
  },
  infoText: {
    color: 'blue',
  },
});

export default {
  GlobalStyles,
  FormStyles,
  DeviceStyles,
  ResultStyles,
}; 