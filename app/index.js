import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Image,
  ScrollView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function Index() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const menuItems = [
    { label: 'Eventos', route: '/eventos', colors: ['#dfe9f3', '#6a85b6'] },
    { label: 'Encuestas', route: '/listadoEncuesta', colors: ['#dfe9f3', '#6a85b6'] },
    { label: 'Incidencias', route: '/reportar-incidencias', colors: ['#dfe9f3', '#6a85b6'] },
    { label: 'Mis incidencias', route: '/mis-incidencias', colors: ['#dfe9f3', '#6a85b6'] },
    { label: 'Reservas', route: '/espacios', colors: ['#dfe9f3', '#6a85b6'] },
    { label: 'Perfil', route: '/perfilUsuario', colors: ['#dfe9f3', '#6a85b6'] },
  ];

  // Filtrar items por texto
  const filteredItems = menuItems.filter(item =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <LinearGradient colors={['#4b6cb7', '#182848']} style={styles.gradientBackground}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Civic@</Text>
          </View>
        </View>

        <TextInput
          placeholder="Buscar..."
          placeholderTextColor="#4b6cb7"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}  
        />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              onPress={() =>
                router.push({
                  pathname: item.route,
                  params: {
                    colors: JSON.stringify(item.colors),
                  },
                })
              }
              activeOpacity={0.9}
              style={{ marginBottom: 12 }}
            >
              <LinearGradient colors={item.colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
                <BlurView intensity={30} tint="light" style={styles.shapeBase} />
                <Text style={styles.cardText}>{item.label}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 56,
    height: 56,
    marginRight: 10,
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  searchInput: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#4b6cb7',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    width: '100%',
    height: 140,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  cardText: {
    color: '#4b6cb7',
    fontSize: 20,
    fontWeight: '600',
  },
  shapeBase: {
    position: 'absolute',
    borderRadius: 150,
    opacity: 0.4,
    width: 280,
    height: 200,
    top: -40,
    left: -60,
    transform: [{ rotate: '30deg' }],
  },
});
