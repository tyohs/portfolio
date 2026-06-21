"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { TerminalSectionData } from "@/lib/portfolio-data";
import { projects } from "@/lib/portfolio-data";

type TerminalSectionProps = {
  section: TerminalSectionData;
  isActive: boolean;
};

export function TerminalSection({ section, isActive }: TerminalSectionProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hasPlayed, setHasPlayed] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);
  const output = section.output ?? "";

  useEffect(() => {
    if (!isActive || hasPlayed || prefersReducedMotion || !output) return;
    const interval = window.setInterval(() => {
      setVisibleChars((current) => {
        const next = current + 1;
        if (next >= output.length) {
          window.clearInterval(interval);
          setHasPlayed(true);
          return output.length;
        }
        return next;
      });
    }, 14);
    return () => window.clearInterval(interval);
  }, [hasPlayed, isActive, output, prefersReducedMotion]);

  const visibleOutput = prefersReducedMotion || hasPlayed || !isActive
    ? output
    : output.slice(0, visibleChars);

  return (
    <motion.section
      id={section.id}
      className="terminal-section"
      data-active={isActive}
      data-terminal-section={section.id}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      aria-label={section.label}
    >
      <div className="command-row">
        <span className="prompt">$</span>
        <span className="command-text">{section.command}</span>
      </div>
      {section.id === "projects" ? (
        <div className="project-list terminal-output">
          {projects.map((project) => (
            <a href={project.href} key={project.name} target="_blank" rel="noreferrer">
              <strong>{project.name}/</strong>
              <span>{project.description}</span>
              <code>{project.stack}</code>
            </a>
          ))}
        </div>
      ) : (
        <pre className="terminal-output">
          {visibleOutput}
          {!prefersReducedMotion && !hasPlayed && isActive && output ? (
            <span className="cursor" />
          ) : null}
        </pre>
      )}
    </motion.section>
  );
}
