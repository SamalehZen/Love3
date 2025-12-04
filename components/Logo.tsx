import React from 'react';

interface LogoProps {
  variant?: 'icon' | 'icon-filled' | 'full' | 'icon-white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  sm: { icon: 24, full: 80 },
  md: { icon: 32, full: 120 },
  lg: { icon: 44, full: 144 },
  xl: { icon: 64, full: 200 },
};

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'icon-filled', 
  size = 'md',
  className = '' 
}) => {
  const iconSize = sizes[size].icon;
  const fullWidth = sizes[size].full;

  if (variant === 'icon') {
    return (
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 44 45" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect opacity="0.4" x="10.1484" y="10.5071" width="23.7037" height="23.7037" rx="4.74074" fill="currentColor"/>
        <rect opacity="0.2" x="6" y="14.655" width="23.7037" height="23.7037" rx="4.74074" fill="currentColor"/>
        <rect x="14.2969" y="6.35864" width="23.7037" height="23.7037" rx="4.74074" fill="currentColor"/>
      </svg>
    );
  }

  if (variant === 'icon-white') {
    return (
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 44 45" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect opacity="0.4" x="10.1484" y="10.5071" width="23.7037" height="23.7037" rx="4.74074" fill="white"/>
        <rect opacity="0.2" x="6" y="14.655" width="23.7037" height="23.7037" rx="4.74074" fill="white"/>
        <rect x="14.2969" y="6.35864" width="23.7037" height="23.7037" rx="4.74074" fill="white"/>
      </svg>
    );
  }

  if (variant === 'icon-filled') {
    return (
      <svg 
        width={iconSize} 
        height={iconSize} 
        viewBox="0 0 46 45" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g clipPath="url(#clip0_logo)">
          <g filter="url(#filter0_logo)">
            <rect x="1" y="0.358643" width="44" height="44" rx="9.5" fill="#32D583"/>
            <rect x="1.91667" y="1.27531" width="42.1667" height="42.1667" rx="8.58333" stroke="url(#paint0_logo)" strokeWidth="1.83333"/>
            <rect opacity="0.4" x="12.6328" y="11.988" width="20.741" height="20.741" rx="4.1482" fill="white"/>
            <rect opacity="0.2" x="9" y="15.6177" width="20.741" height="20.741" rx="4.1482" fill="white"/>
            <rect x="16.2578" y="8.3584" width="20.741" height="20.741" rx="4.1482" fill="white"/>
          </g>
        </g>
        <rect x="0.93125" y="0.289893" width="44.1375" height="44.1375" rx="9.56875" stroke="black" strokeOpacity="0.6" strokeWidth="0.1375"/>
        <defs>
          <filter id="filter0_logo" x="1" y="-17.5164" width="44" height="61.875" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="-17.875"/>
            <feGaussianBlur stdDeviation="11"/>
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.196 0 0 0 0 0.835 0 0 0 0 0.514 0 0 0 0.3 0"/>
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
          </filter>
          <linearGradient id="paint0_logo" x1="23" y1="0.358643" x2="23" y2="44.3586" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ADE80"/>
            <stop offset="1" stopColor="#22C55E"/>
          </linearGradient>
          <clipPath id="clip0_logo">
            <rect x="1" y="0.358643" width="44" height="44" rx="9.5" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    );
  }

  if (variant === 'full') {
    const scale = fullWidth / 144;
    const height = 45 * scale;
    return (
      <svg 
        width={fullWidth} 
        height={height} 
        viewBox="0 0 144 45" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g clipPath="url(#clip0_full)">
          <g filter="url(#filter0_full)">
            <rect x="1" y="0.358643" width="44" height="44" rx="9.5" fill="#32D583"/>
            <rect x="1.91667" y="1.27531" width="42.1667" height="42.1667" rx="8.58333" stroke="url(#paint0_full)" strokeWidth="1.83333"/>
            <rect opacity="0.4" x="12.6328" y="11.988" width="20.741" height="20.741" rx="4.1482" fill="white"/>
            <rect opacity="0.2" x="9" y="15.6177" width="20.741" height="20.741" rx="4.1482" fill="white"/>
            <rect x="16.2578" y="8.3584" width="20.741" height="20.741" rx="4.1482" fill="white"/>
          </g>
        </g>
        <rect x="0.93125" y="0.289893" width="44.1375" height="44.1375" rx="9.56875" stroke="black" strokeOpacity="0.6" strokeWidth="0.1375"/>
        <path d="M70.648 27.1746C68.952 28.8546 66.888 29.6946 64.456 29.6946C62.024 29.6946 59.96 28.8546 58.264 27.1746C56.568 25.4946 55.72 23.4226 55.72 20.9586C55.72 18.4946 56.568 16.4226 58.264 14.7426C59.96 13.0626 62.024 12.2226 64.456 12.2226C66.888 12.2226 68.952 13.0626 70.648 14.7426C72.344 16.4226 73.192 18.4946 73.192 20.9586C73.192 23.4226 72.344 25.4946 70.648 27.1746ZM60.952 24.5586C61.896 25.4866 63.064 25.9506 64.456 25.9506C65.848 25.9506 67.008 25.4866 67.936 24.5586C68.88 23.6306 69.352 22.4306 69.352 20.9586C69.352 19.4866 68.88 18.2866 67.936 17.3586C67.008 16.4306 65.848 15.9666 64.456 15.9666C63.064 15.9666 61.896 16.4306 60.952 17.3586C60.024 18.2866 59.56 19.4866 59.56 20.9586C59.56 22.4306 60.024 23.6306 60.952 24.5586ZM82.8901 17.3586H86.8741L82.4341 29.3586H78.3541L73.9141 17.3586H77.8981L80.3941 24.9666L82.8901 17.3586ZM90.9423 24.7986C91.3583 25.9186 92.3183 26.4786 93.8223 26.4786C94.7983 26.4786 95.5663 26.1746 96.1263 25.5666L99.0063 27.2226C97.8223 28.8706 96.0783 29.6946 93.7743 29.6946C91.7583 29.6946 90.1423 29.0946 88.9263 27.8946C87.7263 26.6946 87.1263 25.1826 87.1263 23.3586C87.1263 21.5506 87.7183 20.0466 88.9023 18.8466C90.1023 17.6306 91.6383 17.0226 93.5103 17.0226C95.2543 17.0226 96.7023 17.6306 97.8543 18.8466C99.0223 20.0466 99.6063 21.5506 99.6063 23.3586C99.6063 23.8706 99.5583 24.3506 99.4623 24.7986H90.9423ZM90.8703 22.1106H96.0303C95.6783 20.8466 94.8303 20.2146 93.4863 20.2146C92.0943 20.2146 91.2223 20.8466 90.8703 22.1106ZM105.248 19.4946C105.472 18.7266 105.92 18.1426 106.592 17.7426C107.28 17.3266 108.032 17.1186 108.848 17.1186V21.1986C107.968 21.0546 107.144 21.2066 106.376 21.6546C105.624 22.0866 105.248 22.8466 105.248 23.9346V29.3586H101.648V17.3586H105.248V19.4946ZM110.531 29.3586V11.8386H114.131V29.3586H110.531ZM125.477 17.3586H129.077V29.3586H125.477V28.2306C124.629 29.2066 123.437 29.6946 121.901 29.6946C120.317 29.6946 118.965 29.0866 117.845 27.8706C116.725 26.6386 116.165 25.1346 116.165 23.3586C116.165 21.5826 116.725 20.0866 117.845 18.8706C118.965 17.6386 120.317 17.0226 121.901 17.0226C123.437 17.0226 124.629 17.5106 125.477 18.4866V17.3586ZM120.557 25.4946C121.085 26.0226 121.773 26.2866 122.621 26.2866C123.469 26.2866 124.157 26.0226 124.685 25.4946C125.213 24.9666 125.477 24.2546 125.477 23.3586C125.477 22.4626 125.213 21.7506 124.685 21.2226C124.157 20.6946 123.469 20.4306 122.621 20.4306C121.773 20.4306 121.085 20.6946 120.557 21.2226C120.029 21.7506 119.765 22.4626 119.765 23.3586C119.765 24.2546 120.029 24.9666 120.557 25.4946ZM139.278 17.3586H143.118L139.014 28.9986C138.342 30.8866 137.454 32.2386 136.35 33.0546C135.262 33.8706 133.87 34.2386 132.174 34.1586V30.7986C133.006 30.7986 133.646 30.6466 134.094 30.3426C134.542 30.0546 134.902 29.5426 135.174 28.8066L130.398 17.3586H134.358L137.022 24.7026L139.278 17.3586Z" fill="currentColor"/>
        <defs>
          <filter id="filter0_full" x="1" y="-17.5164" width="44" height="61.875" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="-17.875"/>
            <feGaussianBlur stdDeviation="11"/>
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0.196 0 0 0 0 0.835 0 0 0 0 0.514 0 0 0 0.3 0"/>
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow"/>
          </filter>
          <linearGradient id="paint0_full" x1="23" y1="0.358643" x2="23" y2="44.3586" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4ADE80"/>
            <stop offset="1" stopColor="#22C55E"/>
          </linearGradient>
          <clipPath id="clip0_full">
            <rect x="1" y="0.358643" width="44" height="44" rx="9.5" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    );
  }

  return null;
};

export const LogoText: React.FC<{ className?: string; isDark?: boolean }> = ({ className = '', isDark = true }) => (
  <span className={`font-bold text-xl tracking-tight ${className}`}>
    <span style={{ color: '#32D583' }}>Overlay</span>
  </span>
);

export const BRAND = {
  name: 'Overlay',
  tagline: 'Trouvez votre match',
  colors: {
    primary: '#32D583',
    primaryLight: '#4ADE80',
    primaryDark: '#22C55E',
    gradient: 'linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)',
  }
};
