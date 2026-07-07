import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { GlassCard } from '@/components/GlassCard';
import { TextInput } from '@/components/TextInput';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function TryOnScreen() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(null);
  const [url, setUrl] = useState('');

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleGenerate = () => {
    if (!photo) {
      Alert.alert('Missing Photo', 'Please upload a photo first.');
      return;
    }
    // Simple demo logic: push to result
    router.push({ pathname: '/try-on-result', params: { sourcePhoto: photo } });
  };

  return (
    <Screen safeArea withBottomNav>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TypographyText variant="h1" style={styles.title}>Virtual Try-On</TypographyText>
          <TypographyText variant="body" color={Colors.textMuted}>See how any item looks on you.</TypographyText>
        </View>

        <View style={styles.stepContainer}>
          <TypographyText variant="h3" style={styles.stepTitle}>1. Upload your photo</TypographyText>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            <GlassCard style={styles.uploadCard}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.uploadedImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="camera-outline" size={48} color={Colors.primary} />
                  <TypographyText variant="bodySemibold" style={styles.uploadText}>Tap to choose photo</TypographyText>
                  <TypographyText variant="small" color={Colors.textMuted}>Use a clear, full-body shot</TypographyText>
                </View>
              )}
            </GlassCard>
          </TouchableOpacity>
        </View>

        <View style={styles.stepContainer}>
          <TypographyText variant="h3" style={styles.stepTitle}>2. Choose clothing</TypographyText>
          <TextInput
            placeholder="Paste product URL..."
            value={url}
            onChangeText={setUrl}
            leftIcon={<Ionicons name="link-outline" size={20} color={Colors.textMuted} />}
          />
          <View style={styles.orDivider}>
            <View style={styles.dividerLine} />
            <TypographyText variant="small" color={Colors.textMuted} style={styles.orText}>OR</TypographyText>
            <View style={styles.dividerLine} />
          </View>
          <Button 
            title="Choose from Store" 
            variant="outline"
            onPress={() => router.push('/(tabs)/store')} 
          />
        </View>

        <Button 
          title="Generate Try-On" 
          onPress={handleGenerate} 
          style={styles.generateButton}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
  },
  stepContainer: {
    marginBottom: 32,
  },
  stepTitle: {
    marginBottom: 16,
  },
  uploadCard: {
    height: 240,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    backgroundColor: 'rgba(21, 21, 34, 0.2)',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  uploadText: {
    marginTop: 8,
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    marginHorizontal: 16,
  },
  generateButton: {
    marginTop: 16,
  }
});
