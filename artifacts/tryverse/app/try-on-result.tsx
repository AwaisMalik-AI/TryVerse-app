import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { TypographyText } from '@/components/Typography';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TryOnResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [isSaved, setIsSaved] = useState(false);

  // Use a demo generated image
  const resultImage = require('../assets/images/poses/model-turn.jpg');

  const handleSave = () => {
    setIsSaved(!isSaved);
    Alert.alert(isSaved ? 'Removed' : 'Saved', isSaved ? 'Look removed from saved.' : 'Look saved successfully!');
  };

  return (
    <Screen safeArea={false}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <TypographyText variant="h3">Result</TypographyText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={resultImage} style={styles.image} />
          
          <TouchableOpacity onPress={handleSave} style={styles.saveIcon}>
            <Ionicons name={isSaved ? "heart" : "heart-outline"} size={28} color={isSaved ? Colors.primary : Colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionContainer}>
          <Button 
            title="Save Look" 
            onPress={handleSave} 
            variant={isSaved ? "outline" : "primary"}
            style={styles.actionBtn}
          />
          <Button 
            title="Try Another" 
            onPress={() => router.push('/(tabs)/try-on')} 
            variant="outline"
            style={styles.actionBtn}
          />
        </View>

        <View style={styles.secondaryActions}>
          <TouchableOpacity style={styles.iconAction} onPress={() => router.push('/(tabs)/stylo')}>
            <View style={styles.iconCircle}>
              <Ionicons name="chatbubbles-outline" size={24} color={Colors.tertiary} />
            </View>
            <TypographyText variant="bodySemibold">Ask Stylo</TypographyText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconAction} onPress={() => router.push('/(tabs)/store')}>
            <View style={styles.iconCircle}>
              <Ionicons name="search-outline" size={24} color={Colors.tertiary} />
            </View>
            <TypographyText variant="bodySemibold">Shop Similar</TypographyText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3/4,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  saveIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(21, 21, 34, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionContainer: {
    gap: 16,
    marginBottom: 32,
  },
  actionBtn: {
    width: '100%',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
  },
  iconAction: {
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  }
});
