import { Alert } from "react-native";

export const showErrorAlert = (
  error,
  fallbackTitle = "Something went wrong",
  fallbackMessage = "Please try again later."
) => {
  const errorMessage =
    error?.response?.data?.message || // Axios-like API error
    error?.message || // JS native error
    fallbackMessage;

  Alert.alert(fallbackTitle, errorMessage);
};
