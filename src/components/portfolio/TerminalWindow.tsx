import { footerLinks, sections } from "@/lib/portfolio-data";
import type { TerminalSectionData } from "@/lib/portfolio-data";
import { TerminalSection } from "./TerminalSection";

type TerminalWindowProps = { activeSectionId: TerminalSectionData["id"] };

export function TerminalWindow({ activeSectionId }: TerminalWindowProps) {
  const activeSection = sections.find((section) => section.id === activeSectionId);
  return (
    <main className="terminal-wrap" aria-label="神永陽のポートフォリオ">
      <div className="terminal-window">
        <header className="terminal-titlebar">
          <div className="window-controls" aria-hidden="true">
            <span className="control red" />
            <span className="control yellow" />
            <span className="control green" />
          </div>
          <div className="terminal-title">yoh-kaminaga: ~/portfolio</div>
          <div className="terminal-status">
            {activeSection?.label.toLowerCase() ?? "ready"}
          </div>
        </header>
        <div className="terminal-body">
          <div className="hero-block">
            <span className="overline">portfolio / whoami</span>
            <h1>ヨウ / 神永 陽</h1>
            <p>東洋大学 INIAD / 学部2年</p>
            <p>Web・AI・開発に取り組んでいます</p>
          </div>
          {sections.map((section) => (
            <TerminalSection
              key={section.id}
              section={section}
              isActive={section.id === activeSectionId}
            />
          ))}
        </div>
        <footer className="terminal-footer" aria-label="外部リンク">
          {footerLinks.map((item) => (
            <a className="footer-pill" href={item.href} key={item.label} target="_blank" rel="noreferrer">
              <span>{item.label}</span><code>{item.value}</code>
            </a>
          ))}
        </footer>
      </div>
    </main>
  );
}
