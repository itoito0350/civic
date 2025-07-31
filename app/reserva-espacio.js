import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Alert,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../hooks/authProvider';
import { BASE_URL } from '../config';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReservaEspacio() {
  const router = useRouter();
  const { espacio: espacioParam } = useLocalSearchParams();
  const { accessToken } = useAuth();

  const [espacio, setEspacio] = useState(null);
  useEffect(() => {
    if (espacioParam) {
      try {
        setEspacio(JSON.parse(espacioParam));
      } catch {
        Alert.alert('Error', 'Datos del espacio no válidos.');
      }
    }
  }, [espacioParam]);

  const [fecha, setFecha] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFin, setHoraFin] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [showFechaPicker, setShowFechaPicker] = useState(false);
  const [showHoraInicioPicker, setShowHoraInicioPicker] = useState(false);
  const [showHoraFinPicker, setShowHoraFinPicker] = useState(false);

  const onChangeFecha = (_, selectedDate) => {
    setShowFechaPicker(false);
    if (selectedDate) setFecha(selectedDate);
  };
  const onChangeHoraInicio = (_, selectedDate) => {
    setShowHoraInicioPicker(false);
    if (selectedDate) setHoraInicio(selectedDate);
  };
  const onChangeHoraFin = (_, selectedDate) => {
    setShowHoraFinPicker(false);
    if (selectedDate) setHoraFin(selectedDate);
  };

  const handleSubmit = async () => {
    if (!espacio) {
      Alert.alert('Error', 'No se ha seleccionado ningún espacio.');
      return;
    }

    if (horaInicio >= horaFin) {
      Alert.alert('Error', 'La hora de inicio debe ser antes que la hora de fin.');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'No estás autenticado');
      return;
    }

    const data = {
      espacio: espacio.id,
      fecha: fecha.toISOString().split('T')[0],
      hora_inicio: horaInicio.toTimeString().slice(0, 8),
      hora_fin: horaFin.toTimeString().slice(0, 8),
    };

    try {
      const response = await fetch(`${BASE_URL}:8000/reservas/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Reserva creada', 'Tu reserva se ha registrado correctamente.');
        router.back();
      } else {
        console.error('Error API reserva:', result);
        Alert.alert('Error', result.non_field_errors?.[0] || result.detail || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error de red:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor: ' + error.message);
    }
  };

  if (!espacio) {
    return (
      <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradient}>
        <Text style={{ color: '#fff', padding: 20 }}>Cargando espacio...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{espacio.nombre}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Descripción:</Text>
          <Text style={styles.value}>{espacio.descripcion || 'Sin descripción'}</Text>

          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>{espacio.tipo}</Text>

          <Text style={styles.label}>Capacidad:</Text>
          <Text style={styles.value}>{espacio.capacidad}</Text>

          <Text style={styles.label}>Ubicación:</Text>
          <Text style={styles.value}>{espacio.ubicacion}</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha de reserva:</Text>
            <TouchableOpacity onPress={() => setShowFechaPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>{fecha.toLocaleDateString()}</Text>
            </TouchableOpacity>
            {showFechaPicker && (
              <DateTimePicker
                value={fecha}
                mode="date"
                display="default"
                onChange={onChangeFecha}
                minimumDate={new Date()}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hora inicio:</Text>
            <TouchableOpacity onPress={() => setShowHoraInicioPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>{horaInicio.toTimeString().slice(0, 5)}</Text>
            </TouchableOpacity>
            {showHoraInicioPicker && (
              <DateTimePicker
                value={horaInicio}
                mode="time"
                display="default"
                onChange={onChangeHoraInicio}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hora fin:</Text>
            <TouchableOpacity onPress={() => setShowHoraFinPicker(true)} style={styles.dateButton}>
              <Text style={styles.dateText}>{horaFin.toTimeString().slice(0, 5)}</Text>
            </TouchableOpacity>
            {showHoraFinPicker && (
              <DateTimePicker
                value={horaFin}
                mode="time"
                display="default"
                onChange={onChangeHoraFin}
              />
            )}
          </View>

          <Button title="Confirmar reserva" onPress={handleSubmit} color="#4b6cb7" />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  scroll: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    color: '#4b6cb7',
    fontWeight: 'bold',
    marginTop: 12,
  },
  value: {
    color: '#4b6cb7',
    marginBottom: 8,
  },
  inputGroup: {
    marginVertical: 10,
  },
  dateButton: {
    backgroundColor: '#f5f7fa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 5,
  },
  dateText: {
    color: '#4b6cb7',
    fontWeight: '600',
  },
});
