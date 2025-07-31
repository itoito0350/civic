import React, { useEffect, useState } from 'react';
import { Alert, Button, Image, Text, TextInput, View, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../hooks/authProvider';
import { BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReportarIncidencia() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [manualMode, setManualMode] = useState(false);
  const { accessToken } = useAuth();

  useEffect(() => {
    (async () => {
      try {
        const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
        const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const locationStatus = await Location.requestForegroundPermissionsAsync();

        if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
          Alert.alert('Permisos requeridos', 'Se necesitan permisos para usar la cámara y galería.');
        }

        if (locationStatus.status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la ubicación.');
        } else {
          const loc = await Location.getCurrentPositionAsync({});
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch (err) {
        console.error('Error al pedir permisos:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: false, quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: false, quality: 0.7 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  const handleSubmit = async () => {
    if (!titulo || !descripcion || !location || !image) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('descripcion', descripcion);
    formData.append('latitud', location.latitude.toFixed(6));
    formData.append('longitud', location.longitude.toFixed(6));

    const filename = image.split('/').pop() || 'foto.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('imagen', {
      uri: image,
      name: filename,
      type,
    });

    try {
      if (!accessToken) {
        Alert.alert('Error', 'No se pudo recuperar el token de autenticación.');
        return;
      }

      const response = await fetch(`${BASE_URL}:8000/incidencias/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Incidencia enviada correctamente.');
        setTitulo('');
        setDescripcion('');
        setImage(null);
        setLocation(null);
      } else {
        console.error('Error al enviar:', data);
        Alert.alert('Error', 'No se pudo enviar la incidencia.');
      }
    } catch (error) {
      console.error('Error al enviar la incidencia:', error);
      Alert.alert('Error', 'Algo salió mal.');
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />;

  return (
    <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradient}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Reportar Incidencia</Text>

        <Text style={styles.description}>
        Esta sección te permite reportar cualquier problema que veas en tu barrio. 
        Puedes avisar si hay una farola rota, una raíz de árbol que obstaculiza 
        el paso, o si algo está bloqueando la entrada de tu casa...por ejemplo. Adjunta una foto, una breve descripción 
        y marca la ubicación exacta para que podamos ayudarte lo antes posible.
        </Text>

        <TextInput
          placeholder="Título"
          placeholderTextColor="#aaa"
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
        />

        <TextInput
          placeholder="Descripción"
          placeholderTextColor="#aaa"
          style={[styles.input, styles.textArea]}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
        />

        <View style={styles.imageContainer}>
          {image && <Image source={{ uri: image }} style={styles.image} />}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>Tomar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={pickImage}>
              <Text style={styles.buttonText}>Elegir Imagen</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.mapToggle} onPress={() => setManualMode(!manualMode)}>
          <Text style={styles.mapToggleText}>
            {manualMode ? 'Usar ubicación automática' : 'Elegir ubicación manualmente'}
          </Text>
        </TouchableOpacity>

        {manualMode && location && (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onPress={handleMapPress}
          >
            <Marker coordinate={location} />
          </MapView>
        )}

        {!manualMode && location && (
          <Text style={styles.coords}>
            Ubicación actual: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Enviar Incidencia</Text>
        </TouchableOpacity>
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
  marginTop: 20,     
  marginBottom: 12,  
  textAlign: 'center',
},
  description: {
    fontSize: 16,
    color: '#f0f0f0',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
    },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#4b6cb7',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  mapToggle: {
    marginBottom: 12,
    marginTop: 8,
  },
  mapToggleText: {
    color: '#fff',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  coords: {
    color: '#eee',
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#4b6cb7',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
