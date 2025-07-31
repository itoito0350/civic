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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../hooks/authProvider';
import { BASE_URL } from '../config';
import { LinearGradient } from 'expo-linear-gradient';

export default function DetalleEncuesta() {
  const { id } = useLocalSearchParams();
  const encuestaId = id ? Number(id) : null;
  const router = useRouter();
  const { accessToken } = useAuth();

  const [encuesta, setEncuesta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [respuestas, setRespuestas] = useState({});
  const [sending, setSending] = useState(false);
  const [yaRespondida, setYaRespondida] = useState(false);

  useEffect(() => {
    if (!encuestaId) {
      Alert.alert('Error', 'No se recibió el ID de la encuesta');
      router.back();
      return;
    }

    const fetchEncuesta = async () => {
      try {
        if (!accessToken) throw new Error('Token no disponible');

        const respRespondida = await fetch(
          `${BASE_URL}:8000/encuestas/${encuestaId}/respondida/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!respRespondida.ok) throw new Error('Error verificando encuesta respondida');

        const dataRespondida = await respRespondida.json();
        setYaRespondida(dataRespondida.respondida);

        if (!dataRespondida.respondida) {
          const respEncuesta = await fetch(
            `${BASE_URL}:8000/encuestas/${encuestaId}/`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (!respEncuesta.ok) throw new Error('Error al cargar encuesta');

          const dataEncuesta = await respEncuesta.json();
          setEncuesta(dataEncuesta);
        }
      } catch (err) {
        Alert.alert('Error', err.message);
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchEncuesta();
  }, [encuestaId, accessToken]);

  const seleccionarOpcion = (preguntaId, opcionId) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionId }));
  };

  const enviarRespuestas = async () => {
    if (!encuesta) return;

    for (const pregunta of encuesta.preguntas) {
      if (!respuestas[pregunta.id]) {
        Alert.alert('Faltan respuestas', 'Por favor responde todas las preguntas');
        return;
      }
    }

    setSending(true);
    try {
      for (const pregunta of encuesta.preguntas) {
        const opcionId = respuestas[pregunta.id];
        const res = await fetch(`${BASE_URL}:8000/respuestas/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ opcion: opcionId }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.detail || 'Error al enviar respuestas');
        }
      }

      Alert.alert('Gracias', 'Tus respuestas fueron enviadas correctamente');
      router.back();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />;

  return (
    <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradient}>
      <SafeAreaView style={{ flex: 1 }}>
         <Text style={styles.titulo}>{encuesta?.titulo || 'Detalle de encuesta'}</Text>

        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} size="large" color="#fff" />
        ) : yaRespondida ? (
          <View style={styles.center}>
            <View style={styles.card}>
              <Text style={styles.mensajeYaRespondida}>
                Ya has realizado esta encuesta. ¡Gracias por tu participación!
              </Text>
            </View>
          </View>
        ) : !encuesta ? null : (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              {encuesta.descripcion ? (
                <Text style={styles.descripcion}>{encuesta.descripcion}</Text>
              ) : null}
              {encuesta.preguntas.map((pregunta) => (
                <View key={pregunta.id} style={styles.preguntaContainer}>
                  <Text style={styles.preguntaTexto}>{pregunta.texto}</Text>
                  {pregunta.opciones.map((opcion) => (
                    <TouchableOpacity
                      key={opcion.id}
                      style={[
                        styles.opcion,
                        respuestas[pregunta.id] === opcion.id && styles.opcionSeleccionada,
                      ]}
                      onPress={() => seleccionarOpcion(pregunta.id, opcion.id)}
                    >
                      <Text
                        style={
                          respuestas[pregunta.id] === opcion.id
                            ? styles.opcionTextoSeleccionada
                            : styles.opcionTexto
                        }
                      >
                        {opcion.texto}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.botonEnviar, sending && styles.botonDisabled]}
              disabled={sending}
              onPress={enviarRespuestas}
            >
              <Text style={styles.botonTexto}>{sending ? 'Enviando...' : 'Enviar respuestas'}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
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
  mensajeYaRespondida: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    textAlign: 'center',
  },
  descripcion: {
    fontSize: 14,
    color: '#555',
    marginBottom: 16,
  },
  preguntaContainer: {
    marginBottom: 20,
  },
  preguntaTexto: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4b6cb7',
  },
  opcion: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 6,
    marginBottom: 8,
  },
  opcionSeleccionada: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  opcionTexto: {
    color: '#333',
  },
  opcionTextoSeleccionada: {
    color: '#fff',
  },
  botonEnviar: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  botonDisabled: {
    backgroundColor: '#999',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
