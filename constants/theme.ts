export const colors = {
  background: '#121214',
  surface: '#1C1C1E',
  primary: {
    green: '#32D583',
    orange: '#FF6B3C',
    red: '#FF3A1F',
  },
  action: {
    red: '#EF4444',
    purple: '#7B4CF6',
    green: '#32D583',
    gold: '#EAB308',
  },
  chip: '#26282B',
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    muted: '#6B7280',
  },
  gradients: {
    green: 'from-[#32D583] to-[#22C55E]',
    purple: 'from-action-purple to-blue-600',
    gold: 'from-[#FFD700] via-[#FFA500] to-[#FFD700]',
  },
} as const;

export const animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
    xslow: 800,
  },
  easing: {
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    smooth: 'cubic-bezier(0.19, 1, 0.22, 1)',
    bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

export const sizing = {
  borderRadius: {
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    full: '9999px',
    card: '36px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  iconButton: {
    sm: '32px',
    md: '40px',
    lg: '48px',
    xl: '56px',
  },
} as const;

export const swipeConfig = {
  threshold: 100,
  rotationFactor: 0.04,
  exitVelocity: 1500,
} as const;

export const mapConfig = {
  defaultZoom: 14,
  flyToZoom: 15,
  flyToDuration: 0.8,
  tiles: {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  },
} as const;

export const zIndex = {
  base: 0,
  card: 20,
  cardBackground: 10,
  overlay: 30,
  header: 50,
  modal: 100,
  toast: 200,
  bottomNav: 300,
  map: {
    controls: 400,
    infoCard: 400,
    profile: 500,
  },
  matchAnimation: 1000,
} as const;
