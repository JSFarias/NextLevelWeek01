import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Home from './src/pages/Home/index'

export default function App() {
  return (
    <View >
      <Home/>
      <StatusBar style="dark" backgroundColor="transparent" translucent/>      
    </View>
  );
}

