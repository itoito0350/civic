import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../hooks/authProvider';
import { BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

export default function PerfilUsuario() {
  const { accessToken } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editable, setEditable] = useState(false);

  const fetchPerfil = async () => {
    try {
      const res = await fetch(`${BASE_URL}:8000/profile/detail/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPerfil(data);
        if (data.perfil?.fecha_nacimiento) {
          setFechaNacimiento(new Date(data.perfil.fecha_nacimiento));
        }
      } else {
        Alert.alert("Error", "No se pudo cargar el perfil");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error de red", error.message);
    }
  };

  const handleGuardar = async () => {
    try {
      const res = await fetch(`${BASE_URL}:8000/profile/detail/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          first_name: perfil.first_name,
          last_name: perfil.last_name,
          email: perfil.email,
          perfil: {
            fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Perfil actualizado");
        setEditable(false);
      } else {
        Alert.alert("Error", JSON.stringify(data));
      }
    } catch (error) {
      Alert.alert("Error de red", error.message);
    }
  };

  useEffect(() => {
    fetchPerfil();
  }, []);

  if (!perfil) return <Text style={{ color: 'white', padding: 20 }}>Cargando...</Text>;

  return (
    <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Mi perfil</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Usuario:</Text>
          <Text style={styles.value}>{perfil.username}</Text>

          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            editable={editable}
            value={perfil.first_name}
            onChangeText={(text) => setPerfil({ ...perfil, first_name: text })}
          />

          <Text style={styles.label}>Apellido</Text>
          <TextInput
            style={styles.input}
            editable={editable}
            value={perfil.last_name}
            onChangeText={(text) => setPerfil({ ...perfil, last_name: text })}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            editable={editable}
            value={perfil.email}
            onChangeText={(text) => setPerfil({ ...perfil, email: text })}
          />

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TouchableOpacity
            onPress={() => editable && setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Text style={styles.dateText}>{fechaNacimiento.toLocaleDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={fechaNacimiento}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setFechaNacimiento(date);
              }}
            />
          )}

          {editable ? (
            <Button title="Guardar cambios" onPress={handleGuardar} color="#4b6cb7" />
          ) : (
            <Button title="Editar perfil" onPress={() => setEditable(true)} color="#4b6cb7" />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40,
  },
  scroll: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: '#4b6cb7',
    backgroundColor: '#f5f7fa',
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: '#f5f7fa',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateText: {
    color: '#4b6cb7',
  },
});
