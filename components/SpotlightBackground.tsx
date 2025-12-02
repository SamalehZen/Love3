import React from 'react';
import { motion } from 'motion/react';

interface SpotlightProps {
  gradientFirst?: string;
  gradientSecond?: string;
  gradientThird?: string;
  translateY?: number;
  width?: number;
  height?: number;
  smallWidth?: number;
  duration?: number;
  xOffset?: number;
}

const SpotlightLayer: React.FC<SpotlightProps & { direction: 'left' | 'right' }> = ({
  gradientFirst,
  gradientSecond,
  gradientThird,
  translateY,
  width,
  height,
  smallWidth,
  duration,
  xOffset,
  direction,
}) => {
  const isLeft = direction === 'left';
  const rotate = isLeft ? -45 : 45;
  const offset = isLeft ? xOffset : -xOffset;
  return (
    <motion.div
      animate={{ x: [0, offset, 0] }}
      transition={{ duration, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
      className={`absolute top-0 ${isLeft ? 'left-0' : 'right-0'} w-screen h-screen z-20 pointer-events-none`}
    >
      <div
        style={{
          transform: `translateY(${translateY}px) rotate(${rotate}deg)` + (isLeft ? '' : ''),
          background: gradientFirst,
          width,
          height,
        }}
        className={`absolute top-0 ${isLeft ? 'left-0' : 'right-0'} opacity-70 blur-3xl`}
      />
      <div
        style={{
          transform: `rotate(${rotate}deg) translate(${isLeft ? '5%' : '-5%'}, -50%)`,
          background: gradientSecond,
          width: smallWidth,
          height,
        }}
        className={`absolute top-0 ${isLeft ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} opacity-60 blur-2xl`}
      />
      <div
        style={{
          transform: `rotate(${rotate}deg) translate(${isLeft ? '-180%' : '180%'}, -70%)`,
          background: gradientThird,
          width: smallWidth,
          height,
        }}
        className={`absolute top-0 ${isLeft ? 'left-0 origin-top-left' : 'right-0 origin-top-right'} opacity-50 blur-2xl`}
      />
    </motion.div>
  );
};

export const Spotlight: React.FC<SpotlightProps> = ({
  gradientFirst = 'radial-gradient(68.54% 68.72% at 55.02% 31.46%, rgba(50, 213, 131, 0.25) 0%, rgba(34, 197, 94, 0.08) 50%, rgba(20, 83, 45, 0) 80%)',
  gradientSecond = 'radial-gradient(50% 50% at 50% 50%, rgba(50, 213, 131, 0.18) 0%, rgba(34, 197, 94, 0.05) 80%, transparent 100%)',
  gradientThird = 'radial-gradient(50% 50% at 50% 50%, rgba(50, 213, 131, 0.12) 0%, rgba(34, 197, 94, 0.04) 80%, transparent 100%)',
  translateY = -320,
  width = 520,
  height = 1280,
  smallWidth = 220,
  duration = 8,
  xOffset = 120,
} = {}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <SpotlightLayer
        direction="left"
        gradientFirst={gradientFirst}
        gradientSecond={gradientSecond}
        gradientThird={gradientThird}
        translateY={translateY}
        width={width}
        height={height}
        smallWidth={smallWidth}
        duration={duration}
        xOffset={xOffset}
      />
      <SpotlightLayer
        direction="right"
        gradientFirst={gradientFirst}
        gradientSecond={gradientSecond}
        gradientThird={gradientThird}
        translateY={translateY}
        width={width}
        height={height}
        smallWidth={smallWidth}
        duration={duration}
        xOffset={xOffset}
      />
    </motion.div>
  );
};

export const GridBackground: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 z-0"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgba(255,255,255,0.04)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")",
      }}
    />
  );
};
