export interface ThemeColors {
  bg: string;
  surface: string;
  textMain: string;
  textSub: string;
  border: string;
  headerBg: string;
  headerBorder: string;
  iconBtn: string;
  iconBtnBorder: string;
  iconBtnHover: string;
  chip: string;
  chipBorder: string;
  cardBorder: string;
  cardShadow: string;
  inputBg: string;
  inputBorder: string;
  overlay: string;
  shimmerText: string;
  sliderBg: string;
  typingDot: string;
  userBubble: string;
  aiBubble: string;
  suggestionBg: string;
  suggestionText: string;
}

export const darkTheme: ThemeColors = {
  bg: 'bg-[#000]',
  surface: 'bg-surface',
  textMain: 'text-white',
  textSub: 'text-gray-400',
  border: 'border-white/10',
  headerBg: 'bg-[#121214]/90',
  headerBorder: 'border-white/5',
  iconBtn: 'bg-[#1C1C1E]',
  iconBtnBorder: 'border-white/10',
  iconBtnHover: 'hover:bg-white/10',
  chip: 'bg-chip',
  chipBorder: 'border-white/5',
  cardBorder: 'border-white/5',
  cardShadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.5)]',
  inputBg: 'bg-surface',
  inputBorder: 'border-white/10',
  overlay: 'from-[#32D583]/20 via-[#121214] to-[#121214]',
  shimmerText: 'from-white/20 via-white to-white/20',
  sliderBg: 'bg-[#1C1C1E] border-white/10',
  typingDot: 'bg-gray-500',
  userBubble: 'bg-[#FF6B3C] text-white',
  aiBubble: 'bg-surface border border-white/5 text-gray-200',
  suggestionBg: 'bg-white/5 border-white/10 hover:bg-white/10',
  suggestionText: 'text-gray-300',
};

export const lightTheme: ThemeColors = {
  bg: 'bg-[#F2F2F7]',
  surface: 'bg-white',
  textMain: 'text-gray-900',
  textSub: 'text-gray-500',
  border: 'border-black/5',
  headerBg: 'bg-white/90',
  headerBorder: 'border-gray-200',
  iconBtn: 'bg-white',
  iconBtnBorder: 'border-black/5',
  iconBtnHover: 'hover:bg-gray-50',
  chip: 'bg-white',
  chipBorder: 'border-gray-200',
  cardBorder: 'border-black/5',
  cardShadow: 'shadow-[0_20px_50px_rgba(0,0,0,0.1)]',
  inputBg: 'bg-white',
  inputBorder: 'border-gray-200',
  overlay: 'from-[#32D583]/10 via-[#F2F2F7] to-[#F2F2F7]',
  shimmerText: 'from-gray-400 via-gray-900 to-gray-400',
  sliderBg: 'bg-white border-gray-200 shadow-sm',
  typingDot: 'bg-gray-400',
  userBubble: 'bg-[#FF6B3C] text-white',
  aiBubble: 'bg-white border border-gray-200 text-gray-800 shadow-sm',
  suggestionBg: 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm',
  suggestionText: 'text-gray-700',
};

export const colors = {
  background: '#121214',
  surface: '#1C1C1E',
  primary: {
    orange: '#FF6B3C',
    red: '#FF3A1F',
  },
  action: {
    red: '#E84B3C',
    purple: '#7B4CF6',
    green: '#32D583',
  },
  chip: '#26282B',
  gold: '#FFD700',
  goldSecondary: '#FFA500',
};

export const animations = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.19, 1, 0.22, 1)',
    bouncy: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
};

export const sizing = {
  borderRadius: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '36px',
    full: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
};
