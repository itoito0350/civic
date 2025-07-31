import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
  Alert,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../hooks/authProvider';
import { useLocalSearchParams } from 'expo-router';
import { BASE_URL } from '../config';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const screenWidth = Dimensions.get('window').width;

export default function Eventos() {
  const { accessToken } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  const gradientColors = ['#4b6cb7', '#182848'];

  useEffect(() => {
    const fetchEventos = async () => {
      if (!accessToken) {
        Alert.alert('Error', 'No estás autenticado');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}:8000/eventos/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) throw new Error('Error al cargar eventos');
        const data = await response.json();
        const eventosArray = data.results ?? data;
        setEventos(eventosArray);
      } catch (error) {
        Alert.alert('Error', error.message || 'Error al cargar eventos');
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [accessToken]);

  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const renderEvento = ({ item }) => {
    const imageUri = item.imagen.startsWith('http')
      ? item.imagen
      : `${BASE_URL.replace(/\/$/, '')}${item.imagen}`;

    return (
      <View style={styles.card}>
        <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>
        <Text style={styles.fecha}>{formatearFecha(item.fecha)}</Text>
        {item.imagen && (
          <Image
            source={{ uri: imageUri }}
            style={styles.imagen}
            resizeMode="cover"
          />
        )}
        <Text style={styles.descripcion} numberOfLines={3}>{item.descripcion}</Text>
      </View>
    );
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.gradient}>
      <StatusBar barStyle="light-content" />
      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />
      ) : (
        <>
          <Text style={styles.header}>Últimos Eventos</Text>
          <FlatList
            data={eventos}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.flatListContent, { marginTop: 20 }]}
            renderItem={renderEvento}
            snapToAlignment="start"
            snapToInterval={screenWidth * 0.7 + 16}
            decelerationRate="fast"
          />
          <TouchableOpacity
            onPress={() => {
              // Acción para Agenda Municipal
            }}
            style={styles.agendaButton}
          >
            <Ionicons name="calendar-outline" size={20} color="#4b6cb7" style={{ marginRight: 8 }} />
            <Text style={styles.agendaButtonText}>Agenda Municipal</Text>
          </TouchableOpacity>
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  flatListContent: {
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginRight: 16,
    width: screenWidth * 0.7,
    padding: 12,
    maxHeight: 350,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  titulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 36,
  },
  fecha: {
    fontSize: 12,
    color: '#555',
    marginBottom: 8,
  },
  imagen: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 13,
    color: '#333',
  },
  agendaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignSelf: 'center',
    marginTop: 40,
  },
  agendaButtonText: {
    color: '#4b6cb7',
    fontSize: 16,
    fontWeight: '600',
  },
});
