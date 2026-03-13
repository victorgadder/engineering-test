import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function CodeLeapLoadingTransition({
  iconSrc,
  fullLogoSrc,
  height = 140,
  durationMs = 1800,
  loop = false,
  isActive = true,
  onComplete,
  className,
  alt = "CodeLeap loading transition",
}) {
  const prefersReducedMotion = useReducedMotion();
  const [cycleKey, setCycleKey] = useState(0);

  const timings = useMemo(() => {
    const total = Math.max(durationMs, 900) / 1000;

    return prefersReducedMotion
      ? {
          total,
          iconIn: 0.18,
          iconOut: 0.2,
          logoReveal: 0.35,
          settle: 0.12,
          pause: Math.max(total - 0.85, 0.1),
        }
      : {
          total,
          iconIn: Math.min(total * 0.22, 0.55),
          iconOut: Math.min(total * 0.2, 0.42),
          logoReveal: Math.min(total * 0.42, 1.05),
          settle: Math.min(total * 0.12, 0.28),
          pause: Math.max(total * 0.04, 0.08),
        };
  }, [durationMs, prefersReducedMotion]);

  useEffect(() => {
    if (!isActive) return undefined;

    const timer = window.setTimeout(() => {
      onComplete?.();
      if (loop) setCycleKey((prev) => prev + 1);
    }, timings.total * 1000);

    return () => window.clearTimeout(timer);
  }, [cycleKey, isActive, loop, onComplete, timings.total]);

  if (!isActive) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={cycleKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={cn("codeleap-loading", className)}
        style={{ height }}
        aria-label={alt}
        role="img"
      >
        <div className="codeleap-loading-inner">
          <motion.img
            src={iconSrc}
            alt="CodeLeap icon"
            className="codeleap-loading-icon"
            style={{
              height: Math.max(height * 0.72, 72),
              width: "auto",
            }}
            initial={
              prefersReducedMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.82, filter: "blur(10px)" }
            }
            animate={
              prefersReducedMotion
                ? {
                    opacity: [1, 0.6, 0],
                    scale: [1, 0.98, 0.94],
                  }
                : {
                    opacity: [0, 1, 1, 0],
                    scale: [0.82, 1, 1.06, 0.9],
                    filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(8px)"],
                  }
            }
            transition={{
              duration: timings.iconIn + timings.iconOut + timings.pause,
              times: prefersReducedMotion ? [0, 0.55, 1] : [0, 0.28, 0.68, 1],
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="codeleap-loading-logo-wrap"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.985,
                    filter: "blur(6px)",
                    clipPath: "inset(0 48% 0 48% round 24px)",
                  }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : {
                    opacity: [0, 1, 1],
                    scale: [0.985, 1.008, 1],
                    filter: ["blur(6px)", "blur(0px)", "blur(0px)"],
                    clipPath: [
                      "inset(0 48% 0 48% round 24px)",
                      "inset(0 0% 0 0% round 24px)",
                      "inset(0 0% 0 0% round 24px)",
                    ],
                  }
            }
            transition={{
              delay: prefersReducedMotion
                ? timings.iconIn * 0.7
                : timings.iconIn + timings.iconOut * 0.45,
              duration: prefersReducedMotion
                ? timings.logoReveal
                : timings.logoReveal + timings.settle,
              times: prefersReducedMotion ? undefined : [0, 0.82, 1],
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <motion.img
              src={fullLogoSrc}
              alt="CodeLeap logo"
              className="codeleap-loading-logo"
              initial={prefersReducedMotion ? undefined : { y: 6 }}
              animate={prefersReducedMotion ? undefined : { y: [6, 0, 0] }}
              transition={{
                delay: timings.iconIn + timings.iconOut * 0.45,
                duration: timings.logoReveal + timings.settle,
                times: [0, 0.8, 1],
                ease: "easeOut",
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
