import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { BottomNavigation, Icon, useTheme } from "react-native-paper";
import { CommonActions } from "@react-navigation/native";

export default function MainLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // animation: Platform.select({
        //   android: "fade_from_bottom",
        //   ios: "default"
        // }),
        // tabBarStyle: { height: 10, borderColor: "red", borderWidth: 2 },
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          style={{
            maxHeight: 85,
          }}
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({ focused, color, size: 24 });
            }

            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;

            return label as string;
          }}
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => {
            return <Icon source="home" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="users/index"
        options={{
          title: "Users",
          tabBarLabel: "Users",
          tabBarIcon: ({ color, size }) => {
            return <Icon source="account-group" size={size} color={color} />;
          },
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: "Products",
          tabBarLabel: "Products",
          tabBarIcon: ({ color, size }) => {
            return <Icon source="package-variant" size={size} color={color} />;
          },
        }}
      />
    </Tabs>
  );
}
