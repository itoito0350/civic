import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/authProvider';
import { BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

export default function ListadoEncuestas() {
  const router = useRouter();
  const { accessToken } = useAuth();

  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEncuestas = async () => {
      if (!accessToken) {
        Alert.alert('Error', 'No estás autenticado');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}:8000/encuestas/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error('Error al cargar encuestas');

        const data = await response.json();
        setEncuestas(data.results ?? data);
      } catch (error) {
        Alert.alert('Error', error.message || 'Error al cargar encuestas');
      } finally {
        setLoading(false);
      }
    };

    fetchEncuestas();
  }, [accessToken]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />;

  return (
    <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
        <Text style={styles.titulo}>Listado de encuestas</Text>
          <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {encuestas.length === 0 ? (
              <View style={styles.center}>
                <View style={styles.card}>
                  <Text style={styles.noEncuestas}>No hay encuestas disponibles.</Text>
                </View>
              </View>
            ) : (
              encuestas.map((encuesta) => (
                <TouchableOpacity
                  key={encuesta.id}
                  style={styles.card}
                  onPress={() => router.push(`/detalleEncuesta?id=${encuesta.id}`)}
                >
                  <Text style={styles.titulo}>{encuesta.titulo}</Text>
                  {encuesta.descripcion ? (
                    <Text style={styles.descripcion}>{encuesta.descripcion}</Text>
                  ) : null}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  titulo: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4b6cb7',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b6cb7',
    marginBottom: 6,
  },
  descripcion: {
    fontSize: 14,
    color: '#555',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noEncuestas: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4b6cb7',
    textAlign: 'center',
  },
});
