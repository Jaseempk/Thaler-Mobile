import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { useTheme } from "../../contexts/ThemeContext";
import { useSavingsPool } from "../../context/SavingsPoolContext";
import { useWallet } from "../../context/WalletContext";
import * as Haptics from "expo-haptics";
import { MotiView } from "moti";
import Slider from "@react-native-community/slider";
import { BlurView } from "expo-blur";
import { SavingsPool } from "../../models/savings";
import StatusModal from "../../components/modals/StatusModal";

const { width } = Dimensions.get("window");

// Mock charity data - in production this would come from an API
const CHARITIES = [
  {
    id: "1",
    name: "Global Water Foundation",
    description: "Providing clean water to communities in need",
    logo: require("../../assets/images/ethereum.png"), // Using existing assets as placeholders
    website: "https://water.org",
    address: "0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620",
  },
  {
    id: "2",
    name: "Climate Action Now",
    description: "Fighting climate change through reforestation",
    logo: require("../../assets/images/ethereum.png"),
    website: "https://climateactionnow.org",
    address: "0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620",
  },
  {
    id: "3",
    name: "Education For All",
    description: "Supporting education in underserved communities",
    logo: require("../../assets/images/usdc.png"),
    website: "https://educationforall.org",
    address: "0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620",
  },
  {
    id: "4",
    name: "Hunger Relief Initiative",
    description: "Providing meals to those facing food insecurity",
    logo: require("../../assets/images/usdc.png"),
    website: "https://hungerrelief.org",
    address: "0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620",
  },
];

// Define a Charity type for better type safety
type Charity = {
  id: string;
  name: string;
  description: string;
  logo: any;
  website: string;
  address: string;
};

export default function EarlyWithdrawalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activeTheme } = useTheme();
  const { pools, withdrawFromEthPool, withdrawFromERC20Pool } =
    useSavingsPool();
  const { address } = useWallet();
  const isDarkMode = activeTheme === "dark";

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // State variables
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [donationAmount, setDonationAmount] = useState(0);
  const [donationPercentage, setDonationPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pool, setPool] = useState<SavingsPool | null>(null);
  const [minimumDonationPercentage, setMinimumDonationPercentage] = useState(0);
  const [minimumDonationAmount, setMinimumDonationAmount] = useState(0);

  // Status modal state
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    amount: string;
    amountLabel: string;
    transactionHash: string;
    timestamp: Date;
    actionButtons: Array<{
      label: string;
      onPress: () => void;
      primary?: boolean;
    }>;
  }>({
    visible: false,
    type: "success",
    title: "",
    message: "",
    amount: "",
    amountLabel: "",
    transactionHash: "",
    timestamp: new Date(),
    actionButtons: [],
  });

  // Find the pool based on the ID
  useEffect(() => {
    if (pools && pools.length > 0 && id) {
      const foundPool = pools.find((p) => p.savingsPoolId === id);
      if (foundPool) {
        setPool(foundPool);

        // Calculate if we're before or after halfway point
        const totalDuration = foundPool.endDate - foundPool.startDate;
        const currentTime = Date.now();
        const elapsed = currentTime - foundPool.startDate;

        // Calculate progress as percentage (0-100)
        const progressPercentage = (elapsed / totalDuration) * 100;

        // For display purposes, ensure the progress is at least 1% to show on timeline
        // but for calculation purposes, use the actual progress
        foundPool.progress = Math.max(progressPercentage, 1);

        // Set minimum donation percentage based on actual progress
        // If less than 50% through the savings cycle, donation is 25%
        // Otherwise, donation is 12.5%
        const minPercentage = progressPercentage < 50 ? 25 : 12.5;
        setMinimumDonationPercentage(minPercentage);

        // Calculate minimum donation amount
        const totalSaved = parseFloat(foundPool.totalSaved);
        const minAmount = (totalSaved * minPercentage) / 100;
        setMinimumDonationAmount(minAmount);
        setDonationAmount(minAmount);
        setDonationPercentage(minPercentage);
      }
    }
  }, [pools, id]);

  // Run animations when component mounts
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Handle step changes with animation
  const goToNextStep = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change step
      setCurrentStep(currentStep + 1);

      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(30);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const goToPreviousStep = () => {
    if (currentStep === 1) {
      router.back();
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change step
      setCurrentStep(currentStep - 1);

      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(-30);

      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  // Handle donation percentage change
  const handleDonationPercentageChange = (percentage: number) => {
    setDonationPercentage(percentage);
    if (pool) {
      const totalSaved = parseFloat(pool.totalSaved);
      const amount = (totalSaved * percentage) / 100;
      setDonationAmount(amount);
    }
  };

  // Handle charity selection
  const handleCharitySelect = (charity: Charity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCharity(charity);
  };

  // Handle final confirmation
  const handleConfirmWithdrawal = async () => {
    if (
      !pool ||
      !selectedCharity ||
      donationPercentage < minimumDonationPercentage
    ) {
      Alert.alert("Error", "Please complete all required fields");
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoading(true);

    try {
      console.log("poolisETh:", pool.isEth);
      let txHash = "";

      // Call the appropriate withdrawal function based on pool type
      if (pool.isEth) {
        txHash = await withdrawFromEthPool(
          pool.savingsPoolId,
          selectedCharity.address
        );
      } else {
        txHash = await withdrawFromERC20Pool(
          pool.savingsPoolId,
          selectedCharity.address
        );
      }

      // Show success modal
      setStatusModal({
        visible: true,
        type: "success",
        title: "Transaction Success",
        message: `You've successfully withdrawn from your savings pool with a ${donationPercentage}% donation to ${selectedCharity.name}.`,
        amount: pool.totalSaved,
        amountLabel: pool.isEth ? "ETH" : pool.tokenSymbol || "Tokens",
        transactionHash: txHash,
        timestamp: new Date(),
        actionButtons: [
          {
            label: "View Details",
            onPress: () => {
              // Handle viewing transaction details
              setStatusModal((prev) => ({ ...prev, visible: false }));
            },
            primary: false,
          },
          {
            label: "Share Receipt",
            onPress: () => {
              // Handle sharing receipt
              setStatusModal((prev) => ({ ...prev, visible: false }));
            },
            primary: false,
          },
          {
            label: "Go to Home",
            onPress: () => {
              setStatusModal((prev) => ({ ...prev, visible: false }));
              router.replace("/tabs");
            },
            primary: true,
          },
        ],
      });

      setIsLoading(false);
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      setIsLoading(false);

      // Show error modal
      setStatusModal({
        visible: true,
        type: "error",
        title: "Transaction Failed",
        message: "Failed to process withdrawal. Please try again.",
        amount: "",
        amountLabel: "",
        transactionHash: "",
        timestamp: new Date(),
        actionButtons: [
          {
            label: "Try Again",
            onPress: () => {
              setStatusModal((prev) => ({ ...prev, visible: false }));
            },
            primary: true,
          },
        ],
      });
    }
  };

  if (!pool) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: Colors[activeTheme].background },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[activeTheme].primary} />
          <Text
            style={[styles.loadingText, { color: Colors[activeTheme].text }]}
          >
            Loading pool details...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[activeTheme].background },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousStep} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={Colors[activeTheme].text}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[activeTheme].text }]}>
          Early Withdrawal
        </Text>
        <View style={styles.stepIndicator}>
          {[1, 2, 3].map((step) => (
            <View key={step} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      step === currentStep
                        ? Colors[activeTheme].primary
                        : step < currentStep
                        ? Colors[activeTheme].success
                        : "transparent",
                    width: step === currentStep ? 12 : 8,
                    height: step === currentStep ? 12 : 8,
                    borderRadius: step === currentStep ? 6 : 4,
                    borderColor:
                      step < currentStep
                        ? Colors[activeTheme].success
                        : Colors[activeTheme].border,
                    transform: [{ scale: step === currentStep ? 1.1 : 1 }],
                  },
                ]}
              />
              {step < 3 && (
                <View
                  style={[
                    styles.stepConnector,
                    {
                      backgroundColor:
                        step < currentStep
                          ? Colors[activeTheme].success
                          : Colors[activeTheme].border,
                    },
                  ]}
                />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Step 1: Information */}
          {currentStep === 1 && (
            <View style={styles.stepContainer}>
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "timing", duration: 500 }}
              >
                <View
                  style={[
                    styles.infoCard,
                    { backgroundColor: Colors[activeTheme].card },
                  ]}
                >
                  <View style={styles.warningHeader}>
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={28}
                      color="#FFA500"
                    />
                    <Text
                      style={[
                        styles.warningTitle,
                        { color: Colors[activeTheme].text },
                      ]}
                    >
                      Early Withdrawal Notice
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.infoText,
                      { color: Colors[activeTheme].textSecondary },
                    ]}
                  >
                    You're withdrawing from your savings pool before the
                    intended end date. To maintain accountability, a donation to
                    charity is required.
                  </Text>

                  <View style={styles.timelineContainer}>
                    <View style={styles.timeline}>
                      <View style={styles.timelineLine} />
                      <View
                        style={[
                          styles.timelineProgress,
                          { width: `${Math.min(pool.progress, 100)}%` },
                        ]}
                      />
                      <View style={[styles.timelineMarker, { left: "0%" }]}>
                        <Text style={styles.timelineMarkerLabel}>Start</Text>
                      </View>
                      <View style={[styles.timelineMarker, { left: "50%" }]}>
                        <Text style={styles.timelineMarkerLabel}>Halfway</Text>
                      </View>
                      <View style={[styles.timelineMarker, { left: "100%" }]}>
                        <Text style={styles.timelineMarkerLabel}>End</Text>
                      </View>

                      {/* Position the current marker based on actual progress */}
                      <View
                        style={[
                          styles.timelineCurrentMarker,
                          {
                            // Snap to key points if close to them
                            left:
                              pool.progress < 5
                                ? "0%"
                                : pool.progress > 45 && pool.progress < 55
                                ? "50%"
                                : pool.progress > 95
                                ? "100%"
                                : `${pool.progress}%`,
                          },
                        ]}
                      >
                        <Text style={styles.currentMarkerLabel}>
                          You are here
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.donationRequirementCard}>
                    <Text
                      style={[
                        styles.requirementTitle,
                        { color: Colors[activeTheme].text },
                      ]}
                    >
                      Donation Requirement
                    </Text>
                    <Text
                      style={[
                        styles.requirementText,
                        { color: Colors[activeTheme].textSecondary },
                      ]}
                    >
                      {pool.progress < 50
                        ? "Since you're withdrawing before the halfway point, a 25% donation of your total saved amount is required."
                        : "Since you're past the halfway point but before the end date, a 12.5% donation of your total saved amount is required."}
                    </Text>

                    <View style={styles.amountSummary}>
                      <View style={styles.amountRow}>
                        <Text
                          style={[
                            styles.amountLabel,
                            { color: Colors[activeTheme].textSecondary },
                          ]}
                        >
                          Total Saved:
                        </Text>
                        <Text
                          style={[
                            styles.amountValue,
                            { color: Colors[activeTheme].text },
                          ]}
                        >
                          {pool.totalSaved} {pool.tokenSymbol}
                        </Text>
                      </View>
                      <View style={styles.amountRow}>
                        <Text
                          style={[
                            styles.amountLabel,
                            { color: Colors[activeTheme].textSecondary },
                          ]}
                        >
                          Minimum Donation:
                        </Text>
                        <Text
                          style={[
                            styles.amountValue,
                            { color: Colors[activeTheme].primary },
                          ]}
                        >
                          {minimumDonationAmount.toFixed(6)} {pool.tokenSymbol}{" "}
                          ({minimumDonationPercentage}%)
                        </Text>
                      </View>
                      <View style={styles.amountRow}>
                        <Text
                          style={[
                            styles.amountLabel,
                            { color: Colors[activeTheme].textSecondary },
                          ]}
                        >
                          You'll Receive:
                        </Text>
                        <Text
                          style={[
                            styles.amountValue,
                            { color: Colors[activeTheme].success },
                          ]}
                        >
                          {(
                            parseFloat(pool.totalSaved) - minimumDonationAmount
                          ).toFixed(6)}{" "}
                          {pool.tokenSymbol}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </MotiView>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  { backgroundColor: Colors[activeTheme].primary },
                ]}
                onPress={goToNextStep}
              >
                <Text style={styles.nextButtonText}>Choose a Charity</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2: Charity Selection */}
          {currentStep === 2 && (
            <View style={styles.stepContainer}>
              <Text
                style={[styles.stepTitle, { color: Colors[activeTheme].text }]}
              >
                Select a Charity
              </Text>
              <Text
                style={[
                  styles.stepDescription,
                  { color: Colors[activeTheme].textSecondary },
                ]}
              >
                Choose a charity to receive your donation. Your contribution
                will make a difference.
              </Text>

              <View style={styles.charitiesContainer}>
                {CHARITIES.map((charity) => (
                  <TouchableOpacity
                    key={charity.id}
                    style={[
                      styles.charityCard,
                      {
                        backgroundColor: Colors[activeTheme].card,
                        borderColor:
                          selectedCharity?.id === charity.id
                            ? Colors[activeTheme].primary
                            : Colors[activeTheme].border,
                      },
                    ]}
                    onPress={() => handleCharitySelect(charity)}
                  >
                    <View style={styles.charityHeader}>
                      <Image source={charity.logo} style={styles.charityLogo} />
                      <View style={styles.charityTitleContainer}>
                        <Text
                          style={[
                            styles.charityName,
                            { color: Colors[activeTheme].text },
                          ]}
                        >
                          {charity.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.infoButton}
                          onPress={() =>
                            Alert.alert(charity.name, charity.description)
                          }
                        >
                          <Ionicons
                            name="information-circle-outline"
                            size={16}
                            color={Colors[activeTheme].primary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.charityDescription,
                        { color: Colors[activeTheme].textSecondary },
                      ]}
                    >
                      {charity.description}
                    </Text>

                    {selectedCharity?.id === charity.id && (
                      <View style={styles.selectedIndicator}>
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={Colors[activeTheme].primary}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  {
                    backgroundColor: selectedCharity
                      ? Colors[activeTheme].primary
                      : Colors[activeTheme].gray,
                  },
                ]}
                onPress={goToNextStep}
                disabled={!selectedCharity}
              >
                <Text style={styles.nextButtonText}>Set Donation Amount</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Step 3: Donation Amount */}
          {currentStep === 3 && (
            <View style={styles.stepContainer}>
              <Text
                style={[styles.stepTitle, { color: Colors[activeTheme].text }]}
              >
                Donation Amount
              </Text>
              <Text
                style={[
                  styles.stepDescription,
                  { color: Colors[activeTheme].textSecondary },
                ]}
              >
                Set your donation amount. The minimum required is{" "}
                {minimumDonationPercentage}% of your savings.
              </Text>

              <View
                style={[
                  styles.donationCard,
                  { backgroundColor: Colors[activeTheme].card },
                ]}
              >
                <View style={styles.selectedCharityRow}>
                  <Image
                    source={selectedCharity?.logo}
                    style={styles.smallCharityLogo}
                  />
                  <Text
                    style={[
                      styles.selectedCharityName,
                      { color: Colors[activeTheme].text },
                    ]}
                  >
                    {selectedCharity?.name}
                  </Text>
                </View>

                <View style={styles.donationAmountContainer}>
                  <Text
                    style={[
                      styles.donationAmountLabel,
                      { color: Colors[activeTheme].textSecondary },
                    ]}
                  >
                    Donation Amount
                  </Text>
                  <View style={styles.donationAmountRow}>
                    <Text
                      style={[
                        styles.donationAmount,
                        { color: Colors[activeTheme].text },
                      ]}
                    >
                      {donationAmount.toFixed(6)}
                    </Text>
                    <Text
                      style={[
                        styles.donationCurrency,
                        { color: Colors[activeTheme].primary },
                      ]}
                    >
                      {pool?.tokenSymbol || "ETH"}
                    </Text>
                  </View>
                </View>

                <View style={styles.sliderContainer}>
                  <Text
                    style={[
                      styles.sliderLabel,
                      { color: Colors[activeTheme].textSecondary },
                    ]}
                  >
                    {donationPercentage.toFixed(1)}% of total savings
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={minimumDonationPercentage}
                    maximumValue={100}
                    step={0.5}
                    value={donationPercentage}
                    onValueChange={handleDonationPercentageChange}
                    minimumTrackTintColor={Colors[activeTheme].primary}
                    maximumTrackTintColor={Colors[activeTheme].border}
                    thumbTintColor={Colors[activeTheme].primary}
                  />
                  <View style={styles.sliderLabels}>
                    <Text
                      style={[
                        styles.sliderMinLabel,
                        { color: Colors[activeTheme].textSecondary },
                      ]}
                    >
                      Min ({minimumDonationPercentage}%)
                    </Text>
                    <Text
                      style={[
                        styles.sliderMaxLabel,
                        { color: Colors[activeTheme].textSecondary },
                      ]}
                    >
                      100%
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: Colors[activeTheme].textSecondary },
                      ]}
                    >
                      Total Saved:
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: Colors[activeTheme].text },
                      ]}
                    >
                      {pool.totalSaved} {pool.tokenSymbol}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: Colors[activeTheme].textSecondary },
                      ]}
                    >
                      Donation:
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        { color: Colors[activeTheme].primary },
                      ]}
                    >
                      {donationAmount.toFixed(6)} {pool.tokenSymbol}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: Colors[activeTheme].border },
                    ]}
                  />
                  <View style={styles.summaryRow}>
                    <Text
                      style={[
                        styles.summaryLabel,
                        { color: Colors[activeTheme].textSecondary },
                      ]}
                    >
                      You'll Receive:
                    </Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color: Colors[activeTheme].success,
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {(parseFloat(pool.totalSaved) - donationAmount).toFixed(
                        6
                      )}{" "}
                      {pool.tokenSymbol}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.confirmButton,
                  { backgroundColor: Colors[activeTheme].primary },
                ]}
                onPress={handleConfirmWithdrawal}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.confirmButtonText}>
                      Confirm Withdrawal
                    </Text>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </TouchableOpacity>

              <Text
                style={[
                  styles.disclaimerText,
                  { color: Colors[activeTheme].textSecondary },
                ]}
              >
                By confirming, you agree to donate{" "}
                {donationPercentage.toFixed(1)}% of your savings to{" "}
                {selectedCharity?.name || "charity"}. The remaining amount will
                be transferred to your wallet.
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Status Modal */}
      <StatusModal
        visible={statusModal.visible}
        onClose={() => setStatusModal((prev) => ({ ...prev, visible: false }))}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        amount={statusModal.amount}
        amountLabel={statusModal.amountLabel}
        transactionHash={statusModal.transactionHash}
        timestamp={statusModal.timestamp}
        actionButtons={statusModal.actionButtons}
        theme={activeTheme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 100,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  stepConnector: {
    width: 16,
    height: 2,
    marginHorizontal: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  warningHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  timelineContainer: {
    marginVertical: 24,
    paddingHorizontal: 8,
  },
  timeline: {
    height: 40,
    marginTop: 20,
    marginBottom: 40,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
  },
  timelineProgress: {
    position: "absolute",
    top: 8,
    left: 0,
    height: 4,
    backgroundColor: "#4CAF50",
    borderRadius: 2,
  },
  timelineMarker: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 20,
    marginLeft: -10,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  timelineMarkerLabel: {
    position: "absolute",
    top: 24,
    fontSize: 12,
    color: "#888888",
    width: 60,
    textAlign: "center",
    marginLeft: -20,
  },
  timelineCurrentMarker: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 20,
    marginLeft: -10,
    backgroundColor: "#FF9800",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    zIndex: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  currentMarkerLabel: {
    position: "absolute",
    bottom: 24,
    fontSize: 12,
    fontWeight: "500",
    color: "#FF9800",
    width: 80,
    textAlign: "center",
    marginLeft: -30,
  },
  donationRequirementCard: {
    backgroundColor: "rgba(255, 152, 0, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  amountSummary: {
    marginTop: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  nextButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  charitiesContainer: {
    marginBottom: 24,
  },
  charityCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    position: "relative",
  },
  charityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  charityLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  charityTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  charityName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  infoButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  charityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  donationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  selectedCharityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  smallCharityLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  selectedCharityName: {
    fontSize: 16,
    fontWeight: "600",
  },
  donationAmountContainer: {
    marginBottom: 16,
  },
  donationAmountLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  donationAmountRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  donationAmount: {
    fontSize: 24,
    fontWeight: "700",
    marginRight: 4,
  },
  donationCurrency: {
    fontSize: 16,
    fontWeight: "600",
  },
  sliderContainer: {
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderMinLabel: {
    fontSize: 12,
  },
  sliderMaxLabel: {
    fontSize: 12,
  },
  summaryContainer: {
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 12,
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  confirmButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 16,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  disclaimerText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 16,
  },
});
