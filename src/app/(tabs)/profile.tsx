import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [bio, setBio] = useState((user?.unsafeMetadata?.bio as string) || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  const handleSaveProfile = async () => {
    try {
      setIsUpdating(true);
      await user?.update({
        firstName,
        lastName,
        unsafeMetadata: { bio },
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Try again.");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", onPress: () => null },
      {
        text: "Logout",
        onPress: async () => {
          try {
            setIsLoggingOut(true);
            await signOut();
            router.replace("/(auth)/sign-up");
          } catch (error) {
            Alert.alert("Error", "Failed to logout");
            console.error(error);
          } finally {
            setIsLoggingOut(false);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be deleted permanently.",
      [
        { text: "Cancel", onPress: () => null },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setIsUpdating(true);
              await user?.delete();
              router.replace("/(auth)/sign-up");
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
              console.error(error);
            } finally {
              setIsUpdating(false);
            }
          },
          style: "destructive",
        },
      ],
    );
  };

  const email = user?.primaryEmailAddress?.emailAddress || "No email";
  const displayName =
    `${user?.firstName || "User"} ${user?.lastName || ""}`.trim();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={["#F8FAFC", "#F1F5F9", "#E2E8F0", "#CBD5E1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-neutral-900">Profile</Text>
        </View>

        {/* Profile Card */}
        <View className="mb-8 items-center">
          {/* Avatar */}
          <Image
            source={{
              uri: user?.imageUrl || "https://via.placeholder.com/120",
            }}
            className="w-24 h-24 rounded-full bg-neutral-200 mb-4"
          />
          {/* Name & Email */}
          <Text className="text-2xl font-bold text-neutral-900">
            {displayName}
          </Text>
          <Text className="text-sm text-neutral-500 mt-1">{email}</Text>
        </View>

        {/* User Info Section */}
        {!isEditing && (
          <View className="mb-8 bg-neutral-50 rounded-xl p-5 border border-neutral-200">
            <View className="mb-4">
              <Text className="text-xs font-semibold text-neutral-500 uppercase mb-1">
                First Name
              </Text>
              <Text className="text-base text-neutral-900">
                {user?.firstName || "Not set"}
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-xs font-semibold text-neutral-500 uppercase mb-1">
                Last Name
              </Text>
              <Text className="text-base text-neutral-900">
                {user?.lastName || "Not set"}
              </Text>
            </View>

            <View>
              <Text className="text-xs font-semibold text-neutral-500 uppercase mb-1">
                Bio
              </Text>
              <Text className="text-base text-neutral-900">
                {(user?.unsafeMetadata?.bio as string) || "No bio added"}
              </Text>
            </View>
          </View>
        )}

        {/* Edit Form */}
        {isEditing && (
          <View className="mb-8 bg-neutral-50 rounded-xl p-5 border border-neutral-200">
            <Text className="text-sm font-semibold text-neutral-700 mb-4">
              Edit Profile
            </Text>

            <View className="mb-4">
              <Text className="mb-1.5 pl-1 text-xs font-semibold text-neutral-600">
                First Name
              </Text>
              <TextInput
                className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900"
                placeholder="First name"
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View className="mb-4">
              <Text className="mb-1.5 pl-1 text-xs font-semibold text-neutral-600">
                Last Name
              </Text>
              <TextInput
                className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900"
                placeholder="Last name"
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="mb-1.5 pl-1 text-xs font-semibold text-neutral-600">
                Bio
              </Text>
              <TextInput
                className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-base text-neutral-900 min-h-[100px]"
                placeholder="Tell us about yourself"
                value={bio}
                onChangeText={setBio}
                multiline
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>

            {/* Edit Buttons */}
            <View className="flex-row gap-3 mt-6">
              <Pressable
                onPress={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-lg border border-neutral-200 bg-white active:bg-neutral-100"
                disabled={isUpdating}
              >
                <Text className="text-center font-semibold text-neutral-900">
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSaveProfile}
                disabled={isUpdating}
                className="flex-1 py-3 rounded-lg bg-blue-500 active:bg-blue-600"
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-center font-semibold text-white">
                    Save
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Edit Button */}
        {!isEditing && (
          <Pressable
            onPress={() => setIsEditing(true)}
            className="flex-row items-center justify-center gap-2 py-3 rounded-lg border border-neutral-200 bg-white active:bg-neutral-100 mb-4"
          >
            <Ionicons name="pencil-outline" size={18} color="#007AFF" />
            <Text className="font-semibold text-blue-500">Edit Profile</Text>
          </Pressable>
        )}

        {/* Account Info */}
        <View className="mb-8 bg-neutral-50 rounded-xl p-5 border border-neutral-200">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">
            Account
          </Text>

          <View className="flex-row justify-between items-center py-3 border-b border-neutral-200">
            <Text className="text-sm text-neutral-600">Email Address</Text>
            <Text className="text-sm font-semibold text-neutral-900">
              Verified ✓
            </Text>
          </View>

          <View className="flex-row justify-between items-center py-3">
            <Text className="text-sm text-neutral-600">Member Since</Text>
            <Text className="text-sm font-semibold text-neutral-900">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—"}
            </Text>
          </View>
        </View>

        {/* Security Section */}
        <View className="mb-8 bg-neutral-50 rounded-xl p-5 border border-neutral-200">
          <Text className="text-sm font-semibold text-neutral-700 mb-3">
            Security
          </Text>

          <Pressable className="flex-row items-center justify-between py-3 border-b border-neutral-200">
            <View className="flex-row items-center gap-2">
              <Ionicons name="lock-closed-outline" size={18} color="#666" />
              <Text className="text-sm text-neutral-600">Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>

          <Pressable className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-2">
              <Ionicons name="shield-outline" size={18} color="#666" />
              <Text className="text-sm text-neutral-600">Two-Factor Auth</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </Pressable>
        </View>

        {/* Danger Zone */}
        <View className="mb-8 gap-3">
          <Pressable
            onPress={handleLogout}
            disabled={isLoggingOut}
            className="flex-row items-center justify-center gap-2 py-3 rounded-lg bg-orange-50 border border-orange-200 active:bg-orange-100"
          >
            <Ionicons name="log-out-outline" size={18} color="#EA580C" />
            <Text className="font-semibold text-orange-600">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDeleteAccount}
            disabled={isUpdating}
            className="flex-row items-center justify-center gap-2 py-3 rounded-lg bg-red-50 border border-red-200 active:bg-red-100"
          >
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
            <Text className="font-semibold text-red-600">Delete Account</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View className="py-6 border-t border-neutral-200">
          <Text className="text-xs text-center text-neutral-500">
            SeeEver App v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
