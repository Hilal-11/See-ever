import { useAuth, useSignUp, useSSO } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OAUTH } from "../../../constants";

export default function SignUpScreen() {
  const [showPassword, setShowPassword] = React.useState(false);
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const isSubmitting = fetchStatus === "fetching";

  const { startSSOFlow } = useSSO();
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
  const isGoogleClicked = loadingStrategy === OAUTH.GOOGLE_OAUTH;
  const isAppleClicked = loadingStrategy === OAUTH.APPLE_OAUTH;

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setLoadingStrategy(strategy);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (!createdSessionId || !setActive) {
        Alert.alert("Sign-in failed. Please try again.");
        return;
      }
      await setActive({ session: createdSessionId });
      Alert.alert("Signed in successfully.");
    } catch (error) {
      console.error("Error during social auth:", error);
      Alert.alert(
        "An error occurred during social authentication. Please try again.",
      );
    }
  };
  // redirect once signed in — never call router.replace during render
  React.useEffect(() => {
    if (isSignedIn) {
      router.replace("/");
    }
  }, [isSignedIn, router]);

  const handleSubmit = async () => {
    const { error } = await signUp.password({ emailAddress, password });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }
    await signUp.verifications.sendEmailCode();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 py-10"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="mt-8">
            <Text className="text-3xl font-bold text-neutral-900">Sign up</Text>
            <Text className="mt-2 text-base leading-5 text-neutral-500">
              Create an account to continue using our app.
            </Text>
          </View>

          {/* Form */}
          <View className="mt-8">
            <Text className="mb-1.5 pl-1 text-sm font-semibold text-gray-500">
              Email
            </Text>
            <TextInput
              className={`rounded-xl border bg-white px-5 py-4 text-base text-neutral-900 shadow-sm ${
                errors.fields.emailAddress
                  ? "border-red-400"
                  : "border-neutral-200"
              }`}
              placeholder="example123@gmail.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailAddress}
              onChangeText={setEmailAddress}
              accessibilityLabel="Email address"
            />
            {errors.fields.emailAddress && (
              <Text className="mt-1.5 pl-1 text-sm text-red-500">
                {errors.fields.emailAddress.message}
              </Text>
            )}

            <View className="mt-5">
              <Text className="mb-1.5 pl-1 text-sm font-semibold text-gray-500">
                Password
              </Text>
              <View className="relative justify-center">
                <TextInput
                  className={`rounded-xl border bg-white px-5 py-4 pr-14 text-base text-neutral-900 shadow-sm ${
                    errors.fields.password
                      ? "border-red-400"
                      : "border-neutral-200"
                  }`}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  accessibilityLabel="Password"
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  className="absolute right-5"
                  hitSlop={8}
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#6B7280"
                  />
                </Pressable>
              </View>
              {errors.fields.password && (
                <Text className="mt-1.5 pl-1 text-sm text-red-500">
                  {errors.fields.password.message}
                </Text>
              )}
            </View>
          </View>

          {/* Join now */}
          <Pressable
            className={`mt-7 items-center justify-center rounded-xl py-4 ${
              !emailAddress || !password || isSubmitting
                ? "bg-neutral-800/40"
                : "bg-black active:bg-neutral-800"
            }`}
            onPress={handleSubmit}
            disabled={!emailAddress || !password || isSubmitting}
            accessibilityLabel="Join now"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold tracking-wide text-white">
                Join now
              </Text>
            )}
          </Pressable>

          {/* Divider */}
          <View className="mt-7 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-neutral-200" />
            <Text className="text-xs font-medium uppercase tracking-widest text-neutral-400">
              Or sign up with
            </Text>
            <View className="h-px flex-1 bg-neutral-200" />
          </View>

          {/* Social buttons */}
          <View className="mt-6 gap-3">
            <Pressable
              className={`flex-row items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-4 shadow-sm ${isGoogleClicked ? "opacity-70" : ""}`}
              accessibilityLabel="Continue with Google"
              onPress={() => handleSocialAuth("oauth_google")}
              disabled={isGoogleClicked}
            >
              <Ionicons name="logo-google" size={20} color="#000" />
              <Text className="text-base font-semibold text-neutral-900">
                Continue with Google
              </Text>
            </Pressable>

            <Pressable
              className={`flex-row items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-4 shadow-sm ${isAppleClicked ? "opacity-70" : ""}`}
              accessibilityLabel="Continue with Apple"
              onPress={() => handleSocialAuth("oauth_apple")}
              disabled={isAppleClicked}
            >
              <Ionicons name="logo-apple" size={20} color="#000" />
              <Text className="text-base font-semibold text-neutral-900">
                Continue with Apple
              </Text>
            </Pressable>
          </View>

          {/* Footer */}
          <View className="mt-10 flex-row items-center justify-center gap-1 pb-4">
            <Text className="text-sm text-neutral-500">
              Already have an account?
            </Text>
            <Text className="text-sm font-bold text-orange-500">Sign in</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
