import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../hooks/authProvider';
import { BASE_URL } from '../config';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Espacios() {
  const { accessToken } = useAuth();
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchEspacios = async () => {
      try {
        const response = await fetch(`${BASE_URL}:8000/espacios/`);
        if (!response.ok) throw new Error('Error al cargar espacios');
        const data = await response.json();
        setEspacios(data);
      } catch (error) {
        alert(error.message || 'Error al cargar espacios');
      } finally {
        setLoading(false);
      }
    };

    fetchEspacios();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.nombre}>{item.nombre}</Text>
      <Text style={styles.label}>Tipo: <Text style={styles.value}>{item.tipo}</Text></Text>
      <Text style={styles.label}>Capacidad: <Text style={styles.value}>{item.capacidad}</Text></Text>
      <Text style={styles.label}>Ubicación: <Text style={styles.value}>{item.ubicacion}</Text></Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({ pathname: '/reserva-espacio', params: { espacio: JSON.stringify(item) } })
        }
      >
        <Text style={styles.buttonText}>Reservar</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradient}>
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradient}>
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={espacios}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>No hay espacios disponibles.</Text>}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  nombre: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b6cb7',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    color: '#4b6cb7',
    marginTop: 4,
  },
  value: {
    fontWeight: 'normal',
    color: '#4b6cb7',
  },
  button: {
    marginTop: 15,
    backgroundColor: '#4b6cb7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
  },
});
