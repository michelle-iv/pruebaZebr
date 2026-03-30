import { useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useDataWedgeScanner } from '../../src/common/hooks/use-datawedge-scanner.hook';
import type { ScannedData } from '../../src/common/types';

const getHandleScannedData = async () => {
  const module = await import('../../src/features/home/services/handle-scanned-data.service');
  console.log('handleScannedData module keys:', Object.keys(module), 'default present?', !!module.default);

  const handleScannedData = module?.handleScannedData ?? module?.default?.handleScannedData ?? module?.default;

  if (!handleScannedData) {
    throw new Error('handleScannedData no está disponible desde el módulo importado');
  }

  return handleScannedData;
};

export default function PaseScreen() {
  const [scanInput, setScanInput] = useState('');
  const [responseText, setResponseText] = useState('Esperando escaneo...');
  const [loading, setLoading] = useState(false);

  const processScanData = async (data: string) => {
    console.log('DataWedge scan:', data);
    setScanInput(data);
    setLoading(true);

    const handleScannedData = await getHandleScannedData();
    const result = await handleScannedData(data);

    setLoading(false);
    console.log('API response:', result);

    if (!result.success) {
      setResponseText(`Error de escaneo: ${result.message}`);
      return;
    }

    const typedData = result.data as ScannedData;
    const textResponse = JSON.stringify(typedData.bundle, null, 2);
    setResponseText(textResponse);
  };

  useDataWedgeScanner(processScanData, {
    profileName: 'ZebraScanner',
    packageName: 'com.mich_iv.myapp',
  });

  const handleScan = async () => {
    if (!scanInput.trim()) {
      setResponseText('Ingresa el contenido del código o QR.');
      return;
    }

    setLoading(true);
    const handleScannedData = await getHandleScannedData();
    const result = await handleScannedData(scanInput.trim());
    setLoading(false);

    if (!result.success) {
      setResponseText(`Error de escaneo: ${result.message}`);
      return;
    }

    const typedData = result.data as ScannedData;
    const textResponse = JSON.stringify(typedData.bundle, null, 2);
    setResponseText(textResponse);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pase</Text>
      <Text style={styles.subtitle}> Escaneo de código o QR</Text>

      <TextInput
        style={styles.input}
        placeholder="Pega aquí el texto del código o QR"
        value={scanInput}
        onChangeText={setScanInput}
        multiline
        editable={!loading}
      />
      <Button title={loading ? 'Consultando...' : 'Buscar pase'} onPress={handleScan} disabled={loading} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resultado</Text>
        <Text style={styles.result}>{responseText || 'Aquí aparecerá la respuesta de la API.'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Escaneo Zebra</Text>
        <Text style={styles.helpText}>
          Usa el escáner DataWedge de Zebra para leer códigos y pasar los datos aquí.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 24,
  },
  input: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  result: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    color: '#111827',
    minHeight: 120,
  },
  helpText: {
    color: '#6b7280',
  },
});
