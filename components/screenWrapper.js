import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ScreenWrapper({ title, children, gradientColors = ['#4b6cb7', '#182848'] }) {
  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo superior */}
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Título opcional */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* Contenido principal */}
        <View style={styles.content}>
          {children}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 90,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  content: {
    width: '100%',
  },
});
