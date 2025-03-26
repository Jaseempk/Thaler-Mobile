// Primary colors
const primaryGreen = '#4CAF50';
const primaryGreenLight = '#8BC34A';
const primaryGreenDark = '#2E7D32';

// Accent colors
const accentBlue = '#1E88E5';
const accentBlueDark = '#1565C0';
const accentBlueLight = '#64B5F6';

// Token colors
const ethGradient = ['#627EEA', '#3C5BE0'];
const usdcGradient = ['#2775CA', '#2775CA'];
const usdtGradient = ['#26A17B', '#1A9270'];
const maticGradient = ['#8247E5', '#6F3CD0'];

// Interface for type checking
interface ColorScheme {
  text: string;
  background: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  success: string;
  error: string;
  warning: string;
  border: string;
  textSecondary: string;
  card: string;
  shadow: string;
  welcomeBackground: string;
  chart: {
    blue: string;
    green: string;
    yellow: string;
    orange: string;
    red: string;
  };
  chartBlue: string;
  chartGreen: string;
  chartYellow: string;
  chartOrange: string;
  chartRed: string;
  gray: string;
  cardGradient: string[];
  elevation: {
    small: string;
    medium: string;
    large: string;
  };
}

const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: primaryGreen,
    tabIconDefault: '#CCCCCC',
    tabIconSelected: primaryGreen,
    primary: primaryGreen,
    primaryLight: primaryGreenLight,
    secondary: '#F5F8FA',
    secondaryLight: '#EDF2F7',
    accent: accentBlue,
    success: '#4CD964',
    error: '#FF3B30',
    warning: '#FFCC00',
    border: '#E1E1E1',
    textSecondary: '#8E8E93',
    card: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.1)',
    welcomeBackground: '#A5D6A7', // Light green for welcome screen
    chart: {
      blue: accentBlue,
      green: primaryGreen,
      yellow: '#FFCC00',
      orange: '#FF9500',
      red: '#FF3B30',
    },
    chartBlue: accentBlue,
    chartGreen: primaryGreen,
    chartYellow: '#FFCC00',
    chartOrange: '#FF9500',
    chartRed: '#FF3B30',
    gray: '#8E8E93',
    cardGradient: ['#FFFFFF', '#F5F8FA'],
    elevation: {
      small: 'rgba(0, 0, 0, 0.05)',
      medium: 'rgba(0, 0, 0, 0.1)',
      large: 'rgba(0, 0, 0, 0.15)',
    },
  },
  dark: {
    text: '#FFFFFF',
    background: '#121212',
    tint: primaryGreenLight,
    tabIconDefault: '#8E8E93',
    tabIconSelected: primaryGreenLight,
    primary: primaryGreenLight,
    primaryLight: primaryGreen,
    secondary: '#1C1C1E',
    secondaryLight: '#2C2C2E',
    accent: accentBlueLight,
    success: '#32D74B',
    error: '#FF453A',
    warning: '#FFD60A',
    border: '#38383A',
    textSecondary: '#8E8E93',
    card: '#1E1E1E',
    shadow: 'rgba(0, 0, 0, 0.3)',
    welcomeBackground: '#2E7D32', // Dark green for welcome screen
    chart: {
      blue: '#64B5F6',
      green: primaryGreenLight,
      yellow: '#FFD60A',
      orange: '#FF9F0A',
      red: '#FF453A',
    },
    chartBlue: '#64B5F6',
    chartGreen: primaryGreenLight,
    chartYellow: '#FFD60A',
    chartOrange: '#FF9F0A',
    chartRed: '#FF453A',
    gray: '#8E8E93',
  },
} as { light: ColorScheme; dark: ColorScheme };

export default Colors;
