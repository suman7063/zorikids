import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../src/lib/supabase";
import { KiddoButton } from "../../src/components/ui/KiddoButton";
import { Colors } from "../../src/theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Oops!", "Please enter email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert("Login Failed", error.message);
    } else {
      router.replace("/(tabs)/home");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.light.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Welcome Back! 👋</Text>
          <Text style={styles.sub}>वापस स्वागत है!</Text>

          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
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
                placeholder="••••••"
                placeholderTextColor={Colors.light.textLight}
                secureTextEntry
              />
            </View>

            <KiddoButton
              label="Log In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
            />

            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text style={styles.signupText}>
                No account?{" "}
                <Text style={{ color: Colors.light.primary, fontWeight: "700" }}>
                  Sign Up Free
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  back: { marginBottom: 24 },
  backText: { fontSize: 16, color: Colors.light.primary, fontWeight: "600" },
  heading: { fontSize: 28, fontWeight: "800", color: Colors.light.text },
  sub: { fontSize: 16, color: Colors.light.textMuted, marginBottom: 32 },
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
  signupText: { fontSize: 14, color: Colors.light.textMuted, textAlign: "center" },
});
