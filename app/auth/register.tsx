import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { KiddoButton } from "../../src/components/ui/KiddoButton";
import { Colors } from "../../src/theme";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Oops!", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Oops!", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Sign Up Failed", error.message);
    } else {
      router.replace("/onboarding/child-setup");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Create Parent Account</Text>
          <Text style={styles.sub}>माता-पिता का अकाउंट बनाएं</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor={Colors.light.textLight}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="parent@email.com"
                placeholderTextColor={Colors.light.textLight}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 6 characters"
                placeholderTextColor={Colors.light.textLight}
                secureTextEntry
              />
            </View>

            <KiddoButton
              label="Create Account"
              onPress={handleRegister}
              loading={loading}
              size="lg"
            />

            <Text style={styles.terms}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
              Your child's data is never shared or sold.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, gap: 8 },
  back: { marginBottom: 16 },
  backText: { fontSize: 16, color: Colors.light.primary, fontWeight: "600" },
  heading: { fontSize: 28, fontWeight: "800", color: Colors.light.text },
  sub: { fontSize: 16, color: Colors.light.textMuted, marginBottom: 24 },
  form: { gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "700", color: Colors.light.text },
  input: {
    height: 54,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingHorizontal: 18,
    fontSize: 15,
    color: Colors.light.text,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  terms: {
    fontSize: 12,
    color: Colors.light.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
