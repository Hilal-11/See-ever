// import { useAuth, useSignUp, useSSO } from "@clerk/expo";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import React, { useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   ScrollView,
//   Text,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { OAUTH } from "../../../constants";

// export default function SignUpScreen() {
//   const [showPassword, setShowPassword] = React.useState(false);
//   const { signUp, errors, fetchStatus } = useSignUp();
//   const { isSignedIn } = useAuth();
//   const router = useRouter();
//   const [emailAddress, setEmailAddress] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [code, setCode] = React.useState("");
//   const [step, setStep] = React.useState<"signup" | "verification">("signup"); // ✅ ADD THIS
//   const isSubmitting = fetchStatus === "fetching";

// const { startSSOFlow } = useSSO();
// const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);
// const isGoogleClicked = loadingStrategy === OAUTH.GOOGLE_OAUTH;
// const isAppleClicked = loadingStrategy === OAUTH.APPLE_OAUTH;

//   // ✅ REDIRECT FIX - Use (tabs) not /
//   React.useEffect(() => {
//     if (isSignedIn) {
//       router.replace("/(tabs)"); // ✅ FIXED
//     }
//   }, [isSignedIn, router]);

// const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
//   setLoadingStrategy(strategy);
//   try {
//     const { createdSessionId, setActive } = await startSSOFlow({ strategy });
//     if (!createdSessionId || !setActive) {
//       Alert.alert("Sign-in failed. Please try again.");
//       return;
//     }
//     await setActive({ session: createdSessionId });
//     // Social auth should automatically redirect via useEffect
//   } catch (error) {
//     console.error("Error during social auth:", error);
//     Alert.alert(
//       "An error occurred during social authentication. Please try again.",
//     );
//   } finally {
//     setLoadingStrategy(null);
//   }
// };

//   return (
//     <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
//       <KeyboardAvoidingView
//         behavior={Platform.OS === "ios" ? "padding" : undefined}
//         className="flex-1"
//       >
//         <ScrollView
//           contentContainerClassName="flex-grow px-6 py-10"
//           keyboardShouldPersistTaps="handled"
//         >
//           {/* Header */}
//           <View className="mt-8">
//             <Text className="text-3xl font-bold text-neutral-900">Sign up</Text>
//             <Text className="mt-2 text-base leading-5 text-neutral-500">
//               Create an account to continue using our app.
//             </Text>
//           </View>

//           {/* Form */}
//           {/* <View className="mt-8">
//             <Text className="mb-1.5 pl-1 text-sm font-semibold text-gray-500">
//               Email
//             </Text>
//             <TextInput
//               className={`rounded-xl border bg-white px-5 py-4 text-base text-neutral-900 shadow-sm ${
//                 errors.fields.emailAddress
//                   ? "border-red-400"
//                   : "border-neutral-200"
//               }`}
//               placeholder="example123@gmail.com"
//               placeholderTextColor="#9CA3AF"
//               autoCapitalize="none"
//               keyboardType="email-address"
//               value={emailAddress}
//               onChangeText={setEmailAddress}
//               accessibilityLabel="Email address"
//             />
//             {errors.fields.emailAddress && (
//               <Text className="mt-1.5 pl-1 text-sm text-red-500">
//                 {errors.fields.emailAddress.message}
//               </Text>
//             )}

//             <View className="mt-5">
//               <Text className="mb-1.5 pl-1 text-sm font-semibold text-gray-500">
//                 Password
//               </Text>
//               <View className="relative justify-center">
//                 <TextInput
//                   className={`rounded-xl border bg-white px-5 py-4 pr-14 text-base text-neutral-900 shadow-sm ${
//                     errors.fields.password
//                       ? "border-red-400"
//                       : "border-neutral-200"
//                   }`}
//                   placeholder="Password"
//                   placeholderTextColor="#9CA3AF"
//                   autoCapitalize="none"
//                   secureTextEntry={!showPassword}
//                   value={password}
//                   onChangeText={setPassword}
//                   accessibilityLabel="Password"
//                 />
//                 <Pressable
//                   onPress={() => setShowPassword((v) => !v)}
//                   className="absolute right-5"
//                   hitSlop={8}
//                   accessibilityLabel={
//                     showPassword ? "Hide password" : "Show password"
//                   }
//                 >
//                   <Ionicons
//                     name={showPassword ? "eye-off-outline" : "eye-outline"}
//                     size={22}
//                     color="#6B7280"
//                   />
//                 </Pressable>
//               </View>
//               {errors.fields.password && (
//                 <Text className="mt-1.5 pl-1 text-sm text-red-500">
//                   {errors.fields.password.message}
//                 </Text>
//               )}
//             </View>
//           </View> */}

//           {/* Join now */}
//           {/* <Pressable
//             className={`mt-7 items-center justify-center rounded-xl py-4 ${
//               !emailAddress || !password || isSubmitting
//                 ? "bg-neutral-800/40"
//                 : "bg-black active:bg-neutral-800"
//             }`}
//             onPress={handleSubmit}
//             disabled={!emailAddress || !password || isSubmitting}
//             accessibilityLabel="Join now"
//           >
//             {isSubmitting ? (
//               <ActivityIndicator color="#fff" />
//             ) : (
//               <Text className="text-base font-bold tracking-wide text-white">
//                 Join now
//               </Text>
//             )}
//           </Pressable> */}

//           {/* Divider */}
//           <View className="mt-7 flex-row items-center gap-3">
//             <View className="h-px flex-1 bg-neutral-200" />
//             <Text className="text-xs font-medium uppercase tracking-widest text-neutral-400">
//               Or sign up with
//             </Text>
//             <View className="h-px flex-1 bg-neutral-200" />
//           </View>

//           {/* Social buttons */}
// <View className="mt-6 gap-3">
//   <Pressable
//     className={`flex-row items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-4 shadow-sm ${isGoogleClicked ? "opacity-70" : ""}`}
//     accessibilityLabel="Continue with Google"
//     onPress={() => handleSocialAuth("oauth_google")}
//     disabled={isGoogleClicked}
//   >
//     {isGoogleClicked ? (
//       <ActivityIndicator size="small" color="#000" />
//     ) : (
//       <>
//         <Ionicons name="logo-google" size={20} color="#000" />
//         <Text className="text-base font-semibold text-neutral-900">
//           Continue with Google
//         </Text>
//       </>
//     )}
//   </Pressable>

//   <Pressable
//     className={`flex-row items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-4 shadow-sm ${isAppleClicked ? "opacity-70" : ""}`}
//     accessibilityLabel="Continue with Apple"
//     onPress={() => handleSocialAuth("oauth_apple")}
//     disabled={isAppleClicked}
//   >
//     {isAppleClicked ? (
//       <ActivityIndicator size="small" color="#000" />
//     ) : (
//       <>
//         <Ionicons name="logo-apple" size={20} color="#000" />
//         <Text className="text-base font-semibold text-neutral-900">
//           Continue with Apple
//         </Text>
//       </>
//     )}
//   </Pressable>
// </View>

//           {/* Footer */}
//           <View className="mt-10 flex-row items-center justify-center gap-1 pb-4">
//             <Text className="text-sm text-neutral-500">
//               Already have an account?
//             </Text>
//             <Text className="text-sm font-bold text-orange-500">Sign in</Text>
//           </View>
//         </ScrollView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

import { useAuth, useSignUp, useSSO } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OAUTH } from "../../../constants";

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
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
      Alert.alert("Sign-in successfully.");
      // Social auth should automatically redirect via useEffect
    } catch (error) {
      console.error("Error during social auth:", error);
      Alert.alert(
        "An error occurred during social authentication. Please try again.",
      );
    } finally {
      setLoadingStrategy(null);
    }
  };

  const handleSubmit = async () => {
    const { error } = await signUp.password({
      emailAddress,
      password,
    });
    if (error) {
      console.error(JSON.stringify(error, null, 2));
      return;
    }

    if (!error) await signUp.verifications.sendEmailCode();
  };

  const handleVerify = async () => {
    await signUp.verifications.verifyEmailCode({
      code,
    });
    if (signUp.status === "complete") {
      await signUp.finalize({
        // Redirect the user to the home page after signing up
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            // Handle pending session tasks
            // See https://clerk.com/docs/guides/development/custom-flows/authentication/session-tasks
            console.log(session?.currentTask);
            return;
          }

          const url = decorateUrl("/");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url as Href);
          }
        },
      });
    } else {
      // Check why the sign-up is not complete
      console.error("Sign-up attempt not complete:", signUp);
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <View style={styles.container}>
        <Text type="title" style={styles.title}>
          Verify your account
        </Text>
        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#666666"
          onChangeText={(code) => setCode(code)}
          keyboardType="numeric"
        />
        {errors.fields.code && (
          <Text style={styles.error}>{errors.fields.code.message}</Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            fetchStatus === "fetching" && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={styles.buttonText}>Verify</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => signUp.verifications.sendEmailCode()}
        >
          <Text style={styles.secondaryButtonText}>I need a new code</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <View className="px-4 pt-7">
        <Text className="text-center text-4xl font-bold font-sans">
          Sign up
        </Text>

        <Text style={styles.label}>Email address</Text>
        <TextInput
          className="flex w--full py-4.5 border border-gray-400 rounded-lg bg-white px-3 mt-2 mb-4"
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#666666"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
          keyboardType="email-address"
        />
        {errors.fields.emailAddress && (
          <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>
        )}
        <Text style={styles.label}>Password</Text>
        <TextInput
          className="flex w--full py-5 border border-gray-400 rounded-lg bg-white px-3 mt-2 mb-4"
          value={password}
          placeholder="Enter password"
          placeholderTextColor="#666666"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
        />
        {errors.fields.password && (
          <Text style={styles.error}>{errors.fields.password.message}</Text>
        )}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            (!emailAddress || !password || fetchStatus === "fetching") &&
              styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleSubmit}
          disabled={!emailAddress || !password || fetchStatus === "fetching"}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </Pressable>

        {/* Social logins */}
        <View className="mt-6 gap-3">
          <Pressable
            className={`flex-row items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-4 shadow-sm ${isGoogleClicked ? "opacity-70" : ""}`}
            accessibilityLabel="Continue with Google"
            onPress={() => handleSocialAuth("oauth_google")}
            disabled={isGoogleClicked}
          >
            {isGoogleClicked ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Text className="text-base font-semibold text-neutral-900">
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            className={`flex-row items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-4 shadow-sm ${isAppleClicked ? "opacity-70" : ""}`}
            accessibilityLabel="Continue with Apple"
            onPress={() => handleSocialAuth("oauth_apple")}
            disabled={isAppleClicked}
          >
            {isAppleClicked ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <Text className="text-base font-semibold text-neutral-900">
                  Continue with Apple
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View className="flex justify-center items-center text-center pt-3">
          <Text>Already have an account? </Text>
          <Link href="/sign-in">
            <Text type="link" className="text-orange-500 font-bold underline">
              Sign in
            </Text>
          </Link>
        </View>

        {/* Required for sign-up flows. Clerk's bot sign-up protection is enabled by default */}
        <View nativeID="clerk-captcha" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    marginBottom: 8,
  },
  label: {
    fontWeight: "600",
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "orange",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    gap: 4,
    marginTop: 12,
    alignItems: "center",
  },
  error: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: -8,
  },
  debug: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 8,
  },
});
