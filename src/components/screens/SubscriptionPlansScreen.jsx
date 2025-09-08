import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { ProfileHeader } from "../helper/profile/ProfileHeader";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";
import { BackHeader } from "../helper/auth/BackHeader";
import { useLocalSearchParams } from "expo-router";
import {
  useStripe,
  createPaymentMethod,
  CardField,
  confirmPayment,
} from "@stripe/stripe-react-native";

export const SubscriptionPlansScreen = () => {
  const { signalProviderId } = useLocalSearchParams();
  const { isInitialized } = useStripe(); // Add Stripe hook

  // State management
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [userSubscribed, setUserSubscribed] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(true); // Add Stripe loading state

  // Card form state
  const [showCardForm, setShowCardForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [cardDetails, setCardDetails] = useState(null); // Stripe card details
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userEmail, setUserEmail] = useState({});

  useEffect(() => {
    initializeScreen();
    getUserEmail();
  }, []);

  // Monitor Stripe initialization
  useEffect(() => {
    if (isInitialized) {
      setStripeLoading(false);
      console.log("Stripe is now initialized and ready");
    } else {
      console.log("Stripe is still initializing...");
    }
  }, [isInitialized]);

  const getUserEmail = async () => {
    const response = await apiService.getUserProfile();
    setUserEmail(response.data);
  };

  // Initialize screen with data fetching
  const initializeScreen = useCallback(async () => {
    try {
      await Promise.all([fetchPlans(), fetchUserSubscriptions()]);
    } catch (error) {
      console.error("Screen initialization error:", error);
    }
  }, []);

  // Handle subscription cancellation
  const handleCancelSubscription = useCallback(
    async (plan) => {
      Alert.alert(
        "Cancel Subscription",
        `Are you sure you want to cancel your ${plan.name} subscription?\n\nThis action cannot be undone.`,
        [
          {
            text: "No, Keep It",
            style: "cancel",
          },
          {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
              try {
                // Show loading state
                Toast.show({
                  type: "info",
                  text1: "Cancelling Subscription...",
                  text2: "Please wait while we process your request",
                  visibilityTime: 3000,
                });

                // Make API call to cancel subscription
                const response = await apiService.cancelSubscription({
                  subscription_id: plan.subscription_id || "active",
                  signal_provider_id: signalProviderId,
                });

                if (response?.statusCode === 200) {
                  Toast.show({
                    type: "success",
                    text1: "Subscription Cancelled",
                    text2: "Your subscription has been cancelled successfully",
                    visibilityTime: 4000,
                  });

                  // Refresh data to show available plans
                  await fetchPlans();
                  await fetchUserSubscriptions();
                } else {
                  throw new Error(
                    response?.message || "Failed to cancel subscription"
                  );
                }
              } catch (error) {
                console.error("Error cancelling subscription:", error);
                Alert.alert(
                  "Cancellation Failed",
                  error.message ||
                    "An error occurred while cancelling your subscription. Please try again or contact support.",
                  [{ text: "OK" }]
                );
              }
            },
          },
        ]
      );
    },
    [signalProviderId]
  );

  // Fetch subscription plans
  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getSubscriptionPlans({
        signal_provider: signalProviderId,
      });

      console.log("Response", response);

      if (response?.statusCode === 200) {
        // Check if user is already subscribed to a plan
        if (
          response.message === "User is already subscribed to a plan" &&
          response.data
        ) {
          // User is subscribed - show active plan details
          setPlans([
            {
              id: "active",
              name: response.data.plan_name,
              price: response.data.plan_price,
              isActive: true,
              description: "Your current active subscription plan",
              subscription_end_date: response.data.subscription_end_date,
            },
          ]);
          setUserSubscribed(true);
        } else if (response.data && Array.isArray(response.data)) {
          // User is not subscribed - show available plans
          setPlans(response.data);
          setUserSubscribed(false);
        } else {
          setError("Invalid response format from server");
        }
      } else {
        setError(response?.message || "Failed to fetch subscription plans");
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      setError("Failed to fetch subscription plans");
    } finally {
      setLoading(false);
    }
  }, [signalProviderId]);

  // Fetch user's current subscriptions
  const fetchUserSubscriptions = useCallback(async () => {
    try {
      const response = await apiService.getUserSubscriptions();
      if (response.statusCode === 200 && response.data) {
        setUserSubscriptions(response.data);
      }
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      // Don't show error toast for this as it's not critical
    }
  }, []);

  // Check if user is already subscribed to this plan
  const isSubscribedToPlan = useCallback(
    (planId) => {
      return userSubscriptions.some(
        (subscription) =>
          subscription.subscription_plan.id === planId &&
          subscription.is_active &&
          new Date(subscription.subscription_end_date) > new Date()
      );
    },
    [userSubscriptions]
  );

  // Handle subscribe button click
  const handleSubscribe = useCallback(async (planDetails) => {
    setSelectedPlan(planDetails);
    setShowCardForm(true);
  }, []);

  // Handle card form submission
  const handleCardSubmit = useCallback(async () => {
    if (!cardDetails) {
      Alert.alert("Missing Information", "Please fill in all card details.");
      return;
    }

    setIsProcessing(true);

    try {
      // Validate CardField data
      if (!cardDetails.complete) {
        throw new Error("Please complete all card details");
      }

      if (!cardholderName.trim()) {
        throw new Error("Please enter cardholder name");
      }

      // Create payment method using the proper Stripe React Native API
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: "Card",
        paymentMethodParams: {
          billingDetails: {
            name: cardholderName.trim(),
            email: userEmail.email,
          },
        },
      });

      if (error) {
        console.error("Stripe API Error Details:", error);
        throw new Error(`Stripe Error: ${error.message}`);
      }

      if (!paymentMethod) {
        throw new Error("No payment method returned from Stripe");
      }

      const apiData = {
        subscription_plan_id: selectedPlan.id,
        signal_provider_id: parseInt(signalProviderId),
        amount: selectedPlan.price,
        currency_code: "INR",
        payment_method_id: paymentMethod.id,
      };

      try {
        const backendResponse =
          await apiService.useCreateSubscriptionPayment(apiData);

        if (
          backendResponse?.success === true ||
          backendResponse?.statusCode === 200 ||
          backendResponse?.statusCode === 201 ||
          backendResponse?.requiresPaymentConfirmation === true
        ) {
          // Check if payment requires confirmation
          if (
            backendResponse?.requiresPaymentConfirmation &&
            backendResponse?.clientSecret
          ) {
            // Confirm the payment
            try {
              const { error: confirmError, paymentIntent } =
                await confirmPayment(backendResponse.clientSecret, {
                  paymentMethodType: "Card",
                });

              if (confirmError) {
                throw new Error(
                  `Payment confirmation failed: ${confirmError.message}`
                );
              }

              if (
                paymentIntent?.status === "succeeded" ||
                paymentIntent?.status === "Succeeded"
              ) {
                Toast.show({
                  type: "success",
                  text1: "Subscription Activated!",
                  text2: `Welcome to ${selectedPlan.name}! Payment confirmed.`,
                  visibilityTime: 3000,
                });

                // Refresh page after success to show active subscription
                setTimeout(async () => {
                  try {
                    await Promise.all([fetchPlans(), fetchUserSubscriptions()]);
                  } catch (refreshError) {
                    Toast.show({
                      type: "error",
                      text1: "Error refreshing subscription data",
                      text2: refreshError.message,
                      visibilityTime: 4000,
                    });
                  }
                }, 1000); // 2.5 seconds delay to let user see the success message
              } else {
                Toast.show({
                  type: "info",
                  text1: "Payment Processing",
                  text2:
                    "Your payment is being processed. You'll be notified when complete.",
                });
              }
            } catch (confirmationError) {
              Toast.show({
                type: "error",
                text1: "Payment confirmation error",
                text2: confirmationError.message,
              });
              throw confirmationError;
            }
          } else if (backendResponse?.status === "succeeded") {
            Toast.show({
              type: "success",
              text1: "Subscription Activated!",
              text2: `Welcome to ${selectedPlan.name}!`,
              visibilityTime: 3000,
            });

            // Refresh page after success to show active subscription
            setTimeout(async () => {
              try {
                await Promise.all([fetchPlans(), fetchUserSubscriptions()]);
              } catch (refreshError) {
                Toast.show({
                  type: "error",
                  text1: "Error refreshing subscription data",
                  text2: refreshError.message,
                  visibilityTime: 4000,
                });
              }
            }, 2500);
          } else {
            Toast.show({
              type: "success",
              text1: "Subscription Created!",
              text2: `Welcome to ${selectedPlan.name}!`,
              visibilityTime: 4000,
            });
          }
        } else {
          throw new Error(backendResponse?.message || "Backend request failed");
        }
      } catch (backendError) {
        throw new Error(`Backend Error: ${backendError.message}`);
      }

      // Close form and refresh data
      setShowCardForm(false);
      setSelectedPlan(null);
      setCardDetails(null); // Clear card details
      await fetchPlans();
      await fetchUserSubscriptions();
    } catch (error) {
      Alert.alert(
        "Payment Method Creation Failed",
        error.message ||
          "An error occurred while creating your payment method. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    cardDetails,
    cardholderName,
    selectedPlan,
    userEmail,
    signalProviderId,
    isInitialized,
    stripeLoading,
    handleCardSubmit,
  ]);

  // Reset card form
  const resetCardForm = useCallback(() => {
    setCardDetails(null);
    setCardholderName("");
  }, []);

  // Close card form
  const closeCardForm = useCallback(() => {
    setShowCardForm(false);
    setSelectedPlan(null);
    resetCardForm();
  }, [resetCardForm]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchPlans(), fetchUserSubscriptions()]);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error refreshing subscription data",
        text2: error.message,
        visibilityTime: 4000,
      });
    } finally {
      setRefreshing(false);
    }
  }, [fetchPlans, fetchUserSubscriptions]);

  const renderPlanItem = useCallback(
    ({ item }) => {
      const isSubscribed = isSubscribedToPlan(item.id);

      return (
        <View
          style={[styles.planCard, isSubscribed && styles.planCardSubscribed]}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planName}>{item.name}</Text>
            <View style={styles.planTypeContainer}>
              <Text style={styles.planType}>{item?.plan_type?.name}</Text>
              {isSubscribed && (
                <Text style={styles.subscribedBadge}>Active</Text>
              )}
            </View>
          </View>

          {item.description && (
            <Text style={styles.planDescription}>{item.description}</Text>
          )}

          {item.price && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>₹{item.price}</Text>
              <Text style={styles.priceSubtext}>
                per {item?.plan_type?.name?.toLowerCase() || "period"}
              </Text>
            </View>
          )}

          {item.isActive ? (
            // Active subscription card - no subscribe button
            <View style={styles.activePlanContent}>
              <View style={styles.expiryInfoContainer}>
                <Text style={styles.expiryLabel}>Expires on:</Text>
                <Text style={styles.expiryDate}>
                  {new Date(item.subscription_end_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </Text>
                <Text style={styles.expiryTime}>
                  {new Date(item.subscription_end_date).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    }
                  )}
                </Text>
              </View>

              {/* Cancellation Button */}
              <Pressable
                style={styles.cancelButton}
                onPress={() => handleCancelSubscription(item)}
              >
                <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
              </Pressable>
            </View>
          ) : (
            // Regular subscription plan card
            <View style={styles.planFooter}>
              <Pressable
                style={styles.subscribeButton}
                onPress={() => handleSubscribe(item)}
              >
                <Text style={styles.subscribeButtonText}>Subscribe</Text>
              </Pressable>
            </View>
          )}
        </View>
      );
    },
    [isSubscribedToPlan, handleSubscribe, handleCancelSubscription]
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No subscription plans available</Text>
      <Text style={styles.emptySubText}>Check back later for new plans</Text>
    </View>
  );

  // Render card form
  const renderCardForm = () => {
    if (!showCardForm || !selectedPlan) return null;

    return (
      <View style={styles.cardFormOverlay}>
        <View style={styles.cardFormContainer}>
          <View style={styles.cardFormHeader}>
            <Text style={styles.cardFormTitle}>Complete Your Subscription</Text>
            <Pressable style={styles.closeButton} onPress={closeCardForm}>
              <Text style={styles.closeButtonText}>×</Text>
            </Pressable>
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.cardFormContent}
          >
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Card Details</Text>
              <CardField
                postalCodeEnabled={false}
                placeholders={{
                  number: "4242 4242 4242 4242",
                  expiry: "MM/YY",
                  cvc: "123",
                }}
                cardStyle={{
                  backgroundColor: "#FFFFFF",
                  textColor: "#000000",
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#E5E5E5",
                }}
                style={styles.cardField}
                onCardChange={(cardDetails) => {
                  console.log("Card details changed:", cardDetails);
                  setCardDetails(cardDetails);
                }}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="John Doe"
                value={cardholderName}
                onChangeText={setCardholderName}
                placeholderTextColor="#999"
              />
            </View>

            <Pressable
              style={[
                styles.submitButton,
                isProcessing && styles.submitButtonDisabled,
              ]}
              onPress={handleCardSubmit}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <View style={styles.processingContent}>
                  <ActivityIndicator size="small" color="#FFF" />
                  <Text style={styles.processingText}>Processing...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>
                  Create Payment Method
                </Text>
              )}
            </Pressable>

            <Text style={styles.securityNote}>
              🔒 Your payment information is secure and encrypted
            </Text>
          </KeyboardAvoidingView>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ProfileHeader
          backtxt="Subscription Plans"
          righttxt=""
          righticon={null}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading plans...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ProfileHeader
          backtxt="Subscription Plans"
          righttxt=""
          righticon={null}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchPlans}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackHeader />

      <View style={styles.main}>
        <View style={styles.headerSection}>
          {!userSubscribed ? (
            <>
              <Text style={styles.headerTitle}>Choose your plan</Text>
              <Text style={styles.headerSubtitle}>
                Subscribe to get premium signals and features
              </Text>
            </>
          ) : (
            <Text style={styles.headerTitle}>Your Active Subscription</Text>
          )}
        </View>

        <FlatList
          data={plans}
          renderItem={renderPlanItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.plansList}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={renderEmptyComponent}
          showsVerticalScrollIndicator={false}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={3}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate item height
            offset: 200 * index,
            index,
          })}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#007AFF"]}
              tintColor="#007AFF"
            />
          }
        />
      </View>

      {/* Card Form Bottom Sheet */}
      {renderCardForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  main: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerSection: {
    paddingVertical: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E1E1E",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  plansList: {
    flex: 1,
  },
  planCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  planCardSubscribed: {
    borderColor: "#28a745",
    borderWidth: 2,
    backgroundColor: "#f8fff9",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1E1E1E",
    textTransform: "capitalize",
  },
  planTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  planType: {
    fontSize: 14,
    color: "#007AFF",
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: "500",
  },
  subscribedBadge: {
    fontSize: 12,
    color: "#28a745",
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontWeight: "600",
  },
  priceContainer: {
    alignItems: "center",
    marginVertical: 12,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E1E1E",
  },
  priceSubtext: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  planDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  planFooter: {
    alignItems: "center",
  },
  subscribeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
  },
  subscribeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  activePlanContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  expiryInfoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  expiryLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E1E",
    marginBottom: 4,
  },
  expiryTime: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E1E",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#FF3B30",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 120,
    alignItems: "center",
    marginTop: 16,
  },
  cancelButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
  // Card Form Styles - Stripe Style
  cardFormOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  cardFormContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 20,
  },
  cardFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  cardFormTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E1E1E",
    flex: 1,
  },
  cardFormSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
    fontWeight: "300",
  },
  cardFormContent: {
    paddingHorizontal: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: "row",
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E1E1E",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#1E1E1E",
    backgroundColor: "#FFFFFF",
  },
  cardField: {
    height: 50,
    width: "100%",
    marginVertical: 8,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  processingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  processingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  securityNote: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  stripeStatusContainer: {
    backgroundColor: "#FFE5E5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  stripeStatusText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "600",
  },
});
