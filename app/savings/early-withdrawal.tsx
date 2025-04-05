import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { getEthereumLogo } from "../../utils/themeUtils";

const { width } = Dimensions.get("window");

export default function EarlyWithdrawalScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { activeTheme } = useTheme();
  const { pools, withdrawFromEthPool, withdrawFromERC20Pool } =
    useSavingsPool();
  const { address } = useWallet();
  const isDarkMode = activeTheme === "dark";

  // Get theme-based Ethereum logo
  const ethLogo = getEthereumLogo(activeTheme);

  // Define a Charity type for better type safety
  type Charity = {
    id: string;
    name: string;
    description: string;
    logo: any;
    logoUrl: string;
    bannerUrl: string;
    website: string;
    address: string;
    longDescription: string;
    bannerImage: any;
    impact: string;
    tags: string[];
    stats: {
      stat1: string | number;
      stat2: string | number;
      stat3: string | number;
      label1: string;
      label2: string;
      label3: string;
    };
  };

  // Mock charity data - in production this would come from an API
  const CHARITIES = useMemo(
    () => [
      {
        id: "1",
        name: "The Water Project",
        description: "Providing clean water to communities in need across sub-Saharan Africa. Over 2.5M people helped since 2006.",
        longDescription: "The Water Project works to unlock human potential by providing sustainable water projects to communities in sub-Saharan Africa who suffer needlessly from a lack of access to clean water and proper sanitation. Your crypto donation helps build wells, water catchment systems, and spring protections to bring clean, safe water to entire communities.",
        logo: null, // Will be set from logoUrl
        bannerImage: null, // Will be set from bannerUrl
        logoUrl: "https://thewaterproject.org/wp-content/themes/waterproject/images/logo.svg",
        bannerUrl: "https://thewaterproject.org/wp-content/uploads/2021/11/563_913c37cf9fe6a08-1024x683.jpg",
        impact: "One $50 donation provides clean water to a school of 475 students for years to come",
        website: "https://thewaterproject.org",
        address: "0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620", // Example address
        tags: ["Water", "Health", "Africa"],
        stats: {
          stat1: "2.5M+",
          stat2: 32,
          stat3: 1240,
          label1: "People Helped",
          label2: "Countries Served",
          label3: "Projects Completed"
        }
      },
      {
        id: "2",
        name: "Cool Earth",
        description: "Fighting climate change by protecting rainforests in partnership with indigenous communities.",
        longDescription: "Cool Earth is a climate charity that works alongside rainforest communities to halt deforestation and its impact on climate change. Your crypto donation helps support sustainable livelihoods and education programmes, empowering communities to fight back against changing climates and threats to the rainforest.",
        logo: null, // Will be set from logoUrl
        bannerImage: null, // Will be set from bannerUrl
        logoUrl: "https://www.coolearth.org/wp-content/themes/coolearth/dist/img/logo-white.svg",
        bannerUrl: "https://www.coolearth.org/wp-content/uploads/2021/07/©Cool-Earth-Papua-New-Guinea-20201018-WA0015-1024x683.jpg",
        impact: "£25 can help keep tropical rainforest standing, protecting vital habitat for wildlife and thousands of communities",
        website: "https://www.coolearth.org",
        address: "0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620", // Example address
        tags: ["Climate", "Environment", "Rainforest"],
        stats: {
          stat1: "1M+",
          stat2: "3.5M tons",
          stat3: 127,
          label1: "Acres Protected",
          label2: "Carbon Stored",
          label3: "Communities Supported"
        }
      },
      {
        id: "3",
        name: "UNICEF CryptoFund",
        description: "Supporting education and innovation for children through blockchain technology and cryptocurrency.",
        longDescription: "UNICEF's CryptoFund is a new financial vehicle allowing UNICEF to receive, hold, and disburse cryptocurrency - a first for the UN. The fund supports open-source technology benefiting children and young people around the world, with a focus on education, health, and protection.",
        logo: null, // Will be set from logoUrl
        bannerImage: null, // Will be set from bannerUrl
        logoUrl: "https://www.unicef.org/sites/default/files/styles/logo/public/UNICEF-Logo-RGB_150ppi.png",
        bannerUrl: "https://www.unicef.org/innovation/sites/unicef.org.innovation/files/styles/media_large/public/2019-10/Crypto_1.jpg",
        impact: "Your donation helps fund startups working on data science, extended reality, AI and blockchain solutions for children",
        website: "https://www.unicef.org/innovation/stories/unicef-cryptofund",
        address: "0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620", // Example address
        tags: ["Education", "Children", "Innovation"],
        stats: {
          stat1: "12+",
          stat2: 8,
          stat3: "100M+",
          label1: "Startups Funded",
          label2: "Countries Reached",
          label3: "Children Impacted"
        }
      },
      {
        id: "4",
        name: "Save the Children",
        description: "Providing relief to families fighting hunger, climate shocks, and supporting children in conflict zones.",
        longDescription: "For over 100 years Save the Children's mission has been based on the simple principle that all children have the right to be healthy, educated and protected. They provide relief to families fighting the double impacts of a worsening global hunger crisis and climate shocks, while supporting children in dangerous conflict zones.",
        logo: null, // Will be set from logoUrl
        bannerImage: null, // Will be set from bannerUrl
        logoUrl: "https://www.savethechildren.org/content/dam/usa/images/logos/save-the-children-logo-white.png",
        bannerUrl: "https://www.savethechildren.org/content/dam/usa/images/hunger/hunger-crisis-update-2023-hero.jpg",
        impact: "Your donation helps set up temporary learning spaces, provide fuel and water infrastructure, and create safe shelters for children",
        website: "https://www.savethechildren.org",
        address: "0x66aAf3098E1eB1F24348e84F509d8bcfD92D0620", // Example address
        tags: ["Children", "Hunger", "Emergency"],
        stats: {
          stat1: "$8.6M+",
          stat2: 120,
          stat3: "25M+",
          label1: "Crypto Raised",
          label2: "Countries Served",
          label3: "Children Reached"
        }
      },
    ],
    []
  );

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
          selectedCharity.address,
          pool.tokenToSave,
          pool.amountToSave
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
            label: "Go to Dashboard",
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
                    {/* Charity Banner with Logo */}
                    <View style={styles.charityBannerContainer}>
                      {/* Banner Image with Gradient Overlay */}
                      <View style={styles.bannerImageContainer}>
                        <Image
                          source={{ uri: charity.bannerUrl }}
                          style={styles.bannerImage}
                          resizeMode="cover"
                        />
                        <LinearGradient
                          colors={[
                            "rgba(0,0,0,0.7)",
                            "rgba(0,0,0,0.3)",
                            "rgba(0,0,0,0)",
                          ]}
                          style={styles.bannerGradient}
                        />
                      </View>

                      {/* Charity Logo */}
                      <View
                        style={[
                          styles.charityLogoContainer,
                          { backgroundColor: Colors[activeTheme].background },
                        ]}
                      >
                        <Image
                          source={{ uri: charity.logoUrl }}
                          style={styles.charityLogo}
                          resizeMode="contain"
                        />
                      </View>
                    </View>

                    <View style={styles.charityContent}>
                      <View style={styles.charityHeader}>
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
                              Alert.alert(charity.name, charity.longDescription)
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

                      {/* Impact statement */}
                      <View style={styles.impactContainer}>
                        <Ionicons
                          name="flash-outline"
                          size={16}
                          color={Colors[activeTheme].primary}
                        />
                        <Text
                          style={[
                            styles.impactText,
                            { color: Colors[activeTheme].primary },
                          ]}
                        >
                          {charity.impact}
                        </Text>
                      </View>

                      {/* Tags */}
                      <View style={styles.tagsContainer}>
                        {charity.tags.map((tag, index) => (
                          <View
                            key={index}
                            style={[
                              styles.tagPill,
                              { backgroundColor: Colors[activeTheme].secondaryLight },
                            ]}
                          >
                            <Text
                              style={[
                                styles.tagText,
                                { color: Colors[activeTheme].textSecondary },
                              ]}
                            >
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>

                      {/* Stats */}
                      <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                          <Text
                            style={[
                              styles.statValue,
                              { color: Colors[activeTheme].text },
                            ]}
                          >
                            {charity.stats.stat1}
                          </Text>
                          <Text
                            style={[
                              styles.statLabel,
                              { color: Colors[activeTheme].textSecondary },
                            ]}
                          >
                            {charity.stats.label1}
                          </Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statItem}>
                          <Text
                            style={[
                              styles.statValue,
                              { color: Colors[activeTheme].text },
                            ]}
                          >
                            {charity.stats.stat2}
                          </Text>
                          <Text
                            style={[
                              styles.statLabel,
                              { color: Colors[activeTheme].textSecondary },
                            ]}
                          >
                            {charity.stats.label2}
                          </Text>
                        </View>
                      </View>

                      {selectedCharity?.id === charity.id && (
                        <View style={styles.selectedIndicator}>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color={Colors[activeTheme].primary}
                          />
                        </View>
                      )}
                    </View>
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
                    source={{ uri: selectedCharity?.logoUrl }}
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
    marginBottom: 20,
    borderWidth: 2,
    position: "relative",
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  charityBannerContainer: {
    height: 150,
    width: "100%",
    position: "relative",
    marginBottom: 30, // Space for the logo to overlap
  },
  bannerImageContainer: {
    height: "100%",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  charityLogoContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: -30,
    left: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    padding: 5,
  },
  charityLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  charityContent: {
    padding: 16,
    paddingTop: 36,
  },
  charityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  charityTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  charityName: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  charityDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  impactContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "rgba(0, 150, 136, 0.1)",
    padding: 10,
    borderRadius: 8,
  },
  impactText: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    textTransform: "capitalize",
  },
  statDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    alignSelf: "center",
  },
  selectedIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 2,
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
