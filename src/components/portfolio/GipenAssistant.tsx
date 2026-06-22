"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type GipenAssistantProps = {
  line: string;
  isPetting: boolean;
  onAsk: () => void;
  onPet: () => void;
  onWaveEnd: () => void;
  onWaveStart: () => void;
};

export function GipenAssistant({
  line, isPetting, onAsk, onPet, onWaveEnd, onWaveStart,
}: GipenAssistantProps) {
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  const spriteState = isPetting ? "is-petting" : isHovered ? "is-waving" : "is-idle";
  return (
    <aside className="gipen-assistant" aria-label="ぎぺんAI助手">
      <AnimatePresence mode="wait">
        <motion.div
          key={line}
          className="gipen-bubble"
          initial={reducedMotion ? false : { opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          aria-live="polite"
        >
          <span>ぎぺん「{line}」</span>
          <button type="button" className="ask-trigger" onClick={onAsk}>質問する</button>
        </motion.div>
      </AnimatePresence>
      <button
        className="gipen-button"
        type="button"
        onClick={onPet}
        onPointerEnter={() => { setIsHovered(true); onWaveStart(); }}
        onPointerLeave={() => { setIsHovered(false); onWaveEnd(); }}
        aria-label="ぎぺんを撫でる"
      >
        <span className={`gipen-sprite ${spriteState}`} aria-hidden="true" />
      </button>
    </aside>
  );
}
