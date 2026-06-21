"use client";

import { useEffect, useRef, useState } from "react";
import { sections, wavingGipenLines } from "@/lib/portfolio-data";
import type { TerminalSectionData } from "@/lib/portfolio-data";
import { AskPanel } from "./AskPanel";
import { GipenAssistant } from "./GipenAssistant";
import { TerminalWindow } from "./TerminalWindow";

export function PortfolioShell() {
  const [activeSectionId, setActiveSectionId] = useState<TerminalSectionData["id"]>("whoami");
  const [overrideLine, setOverrideLine] = useState<string | null>(null);
  const [isPetting, setIsPetting] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const visibleSectionIds = useRef(new Set<string>());
  const overrideTimer = useRef<number | null>(null);
  const petTimer = useRef<number | null>(null);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-terminal-section]"));
    const updateActiveSection = () => {
      const candidates = nodes.filter((node) => visibleSectionIds.current.has(node.dataset.terminalSection ?? ""));
      const pool = candidates.length ? candidates : nodes;
      const closest = pool.reduce<HTMLElement | null>((best, node) => {
        if (!best) return node;
        const targetY = window.innerHeight * 0.42;
        const distance = (item: HTMLElement) => Math.abs(item.getBoundingClientRect().top + item.getBoundingClientRect().height * 0.35 - targetY);
        return distance(node) < distance(best) ? node : best;
      }, null);
      const nextId = closest?.dataset.terminalSection as TerminalSectionData["id"] | undefined;
      if (nextId) setActiveSectionId(nextId);
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.terminalSection;
        if (!id) continue;
        if (entry.isIntersecting) visibleSectionIds.current.add(id);
        else visibleSectionIds.current.delete(id);
      }
      updateActiveSection();
    }, { rootMargin: "-18% 0px -42% 0px", threshold: [0, 0.2, 0.5, 0.8] });
    nodes.forEach((node) => observer.observe(node));
    updateActiveSection();
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (overrideTimer.current) window.clearTimeout(overrideTimer.current);
    if (petTimer.current) window.clearTimeout(petTimer.current);
  }, []);

  const activeSection = sections.find((section) => section.id === activeSectionId) ?? sections[0];
  const setTemporaryLine = (line: string, delay = 2600) => {
    setOverrideLine(line);
    if (overrideTimer.current) window.clearTimeout(overrideTimer.current);
    overrideTimer.current = window.setTimeout(() => setOverrideLine(null), delay);
  };

  return (
    <div className="app-shell">
      <TerminalWindow activeSectionId={activeSectionId} />
      <GipenAssistant
        line={overrideLine ?? activeSection.gipenLine}
        isPetting={isPetting}
        onAsk={() => setAskOpen(true)}
        onPet={() => {
          setIsPetting(true); setTemporaryLine("なでられると回答精度が上がる気がします");
          if (petTimer.current) window.clearTimeout(petTimer.current);
          petTimer.current = window.setTimeout(() => setIsPetting(false), 1800);
        }}
        onWaveStart={() => {
          if (!isPetting) setOverrideLine(wavingGipenLines[Math.floor(Math.random() * wavingGipenLines.length)]);
        }}
        onWaveEnd={() => { if (!isPetting) setOverrideLine(null); }}
      />
      <AskPanel open={askOpen} onClose={() => setAskOpen(false)} />
    </div>
  );
}
