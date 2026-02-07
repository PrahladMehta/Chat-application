import { motion } from 'framer-motion';

const PingLogo = ({ size = 'md' }) => {
  const sizes = {
    sm: { wrapper: 'w-10 h-10', inner: 'w-8 h-8', text: 'text-base' },
    md: { wrapper: 'w-12 h-12', inner: 'w-10 h-10', text: 'text-xl' },
    lg: { wrapper: 'w-16 h-16', inner: 'w-14 h-14', text: 'text-2xl' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <div className={`relative flex items-center justify-center ${s.wrapper}`}>
      {/* Outer Pulse Ring - Inherits Theme Accent Color */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-full h-full rounded-full border-2 opacity-50"
        style={{ borderColor: 'var(--color-primary)' }}
      />

      {/* Main Logo Body */}
      <div
        className={`z-10 flex items-center justify-center ${s.inner} rounded-full border`}
        style={{
          background: 'var(--color-glass)',
          borderColor: 'var(--color-border)',
          boxShadow: '0 0 20px var(--color-glow)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span
          className={`font-display font-bold ${s.text}`}
          style={{ color: 'var(--color-primary)' }}
        >
          P
        </span>
      </div>
    </div>
  );
};

export default PingLogo;
