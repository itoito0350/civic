import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/authProvider';
import { BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

export default function MisIncidencias() {
  const { accessToken } = useAuth();
  const [incidencias, setIncidencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidencias = async () => {
      if (!accessToken) {
        Alert.alert('Error', 'No estás autenticado');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}:8000/incidencias/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error('Error al cargar incidencias');

        const data = await response.json();
        setIncidencias(data.results ?? data);
      } catch (error) {
        Alert.alert('Error', error.message || 'Error al cargar incidencias');
      } finally {
        setLoading(false);
      }
    };

    fetchIncidencias();
  }, [accessToken]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />;

  return (
    <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mis Incidencias</Text>

        {incidencias.length === 0 ? (
          <Text style={styles.emptyText}>No tienes incidencias registradas.</Text>
        ) : (
          incidencias.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.titulo}</Text>

              {item.imagen && (
                <Image
                  source={{ uri: item.imagen }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )}

              <Text style={styles.estado}>Estado: {item.estado}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff', 
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#4b6cb7',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  estado: {
    color: '#ccc',
    fontSize: 14,
    fontStyle: 'italic',
  },
  emptyText: {
    color: '#eee',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
});
