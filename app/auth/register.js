import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { useFonts, Allura_400Regular } from '@expo-google-fonts/allura';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';

SplashScreen.preventAutoHideAsync();

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState(new Date(1950, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({ Allura_400Regular });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const onChangeFecha = (event, selectedDate) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setFechaNacimiento(selectedDate);
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !fechaNacimiento) {
      Alert.alert('Faltan datos', 'Por favor, completa todos los campos.');
      return;
    }

    try {
      const response = await fetch('http://192.168.1.41:8000/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          fecha_nacimiento: fechaNacimiento.toISOString().split('T')[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Error al registrar usuario');
      }

      Alert.alert('¡Éxito!', 'Usuario registrado correctamente', [
        {
          text: 'OK',
          onPress: () => router.replace('/auth/login'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo completar el registro');
    }
  };

  return (
    <LinearGradient
      colors={['#FAD7A0', '#FDEBD0']}
      style={styles.container}
      onLayout={onLayoutRootView}
    >
      {/* Filtro blanco translúcido */}
      <View style={styles.overlay} />

      <Text style={styles.slogan}>Crear una cuenta</Text>

      <View style={styles.formBox}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#999"
        />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {fechaNacimiento
              ? fechaNacimiento.toLocaleDateString()
              : 'Fecha de nacimiento'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={fechaNacimiento}
            mode="date"
            display="default"
            minimumDate={new Date(1900, 0, 1)}
            maximumDate={new Date()}
            onChange={onChangeFecha}
          />
        )}

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Registrarse</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)', // Filtro blanco translúcido
  },
  slogan: {
    fontSize: 34,
    color: '#7B3F00',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Allura_400Regular',
    letterSpacing: 1,
    zIndex: 1,
  },
  formBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 17,
    marginBottom: 18,
    backgroundColor: '#fafafa',
  },
  dateButton: {
    backgroundColor: '#D35400',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 18,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 17,
  },
  registerButton: {
    backgroundColor: '#D35400',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 6,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#D35400',
    fontWeight: '700',
    fontSize: 16,
  },
});
