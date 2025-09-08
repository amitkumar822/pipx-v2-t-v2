import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Optionally configure static options outside the route.*/}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="email/[type]" options={{ headerShown: false }} />
      <Stack.Screen name="phone/[type]" options={{ headerShown: false }} />
    </Stack>
  );
}
