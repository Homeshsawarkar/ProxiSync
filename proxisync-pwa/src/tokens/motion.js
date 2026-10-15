// Motion Tokens (PDF & Prompt specification)
// Fast 150ms, Base 250ms, Slow 450ms, Spring presets
export const motionTokens = {
  duration: {
    fast: 0.15,
    base: 0.25,
    slow: 0.45,
  },
  ease: {
    standard: [0.2, 0.0, 0, 1.0],
    spring: { type: 'spring', stiffness: 300, damping: 25 },
    gentle: { type: 'spring', stiffness: 180, damping: 20 },
    bouncy: { type: 'spring', stiffness: 400, damping: 15 }
  }
};
