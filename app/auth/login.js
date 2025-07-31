import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Allura_400Regular } from '@expo-google-fonts/allura';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../hooks/authProvider';

SplashScreen.preventAutoHideAsync();

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const [fontsLoaded] = useFonts({ Allura_400Regular });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const handleLogin = async () => {
    try {
      await login(username, password);
    } catch (error) {
      Alert.alert('Error de login', error.message);
    }
  };

  return (
    <LinearGradient
      colors={['#4b6cb7', '#182848']}
      style={styles.container}
      onLayout={onLayoutRootView}
    >
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo} 
        resizeMode="contain" 
      />
      <Text style={styles.slogan}>Conecta con tu Ayuntamiento</Text>

      <View style={styles.loginBox}>
        <TextInput
          style={styles.input}
          placeholder="Nombre de usuario"
          placeholderTextColor="black"  
          value={username}
          onChangeText={setUsername}
          selectionColor="##4b6cb7"       
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor="black"  
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          selectionColor="#4b6cb7"      
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>Regístrate</Text>
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

  logo: {
    width: 240,
    height: 240,
    alignSelf: 'center',
    marginBottom: 30,
  },

  slogan: {
    fontSize: 34,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
    fontFamily: 'Allura_400Regular',
    letterSpacing: 1,
  },

  loginBox: {
    padding: 0,
    borderRadius: 0,
    shadowColor: 'transparent',
    elevation: 0,
    alignItems: 'center', 
    fontSize: 14,
  },

  input: {
    width: 280,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    color: '#4b6cb7',
    textAlignVertical: 'center',
  },

  loginButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 12,
    width: 280,        
    alignItems: 'center',
  },

  loginButtonText: {
    color: '#4b6cb7',
    fontWeight: '700',
    fontSize: 16,
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
  },

  registerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',   
    textAlign: 'center',
  },

  registerLink: {
    
    fontWeight: '700',
    fontSize: 16,
    color:'#ffff',
  },
});
