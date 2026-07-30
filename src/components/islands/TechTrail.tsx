import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { TechGroup, TechnologyDepth } from "../../data/portfolio";
import "./TechTrail.css";

type Language = "en" | "vi";

type Props = {
  groups: TechGroup[];
};

const depthLabels: Record<TechnologyDepth, Record<Language, string>> = {
  primary: { en: "Primary", vi: "Chủ lực" },
  production: { en: "Production", vi: "Thực chiến" },
  applied: { en: "Applied", vi: "Đã dùng" },
};

export default function TechTrail({ groups }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [language, setLanguage] = useState<Language>("en");
  const reduceMotion = useReducedMotion();
  const active = groups[activeIndex];

  useEffect(() => {
    setLanguage(document.documentElement.lang === "vi" ? "vi" : "en");

    const handleLanguage = (event: Event) => {
      const nextLanguage = (event as CustomEvent<{ language: Language }>).detail.language;
      setLanguage(nextLanguage);
    };

    window.addEventListener("portfolio:language", handleLanguage);
    return () => window.removeEventListener("portfolio:language", handleLanguage);
  }, []);

  const selectTab = (index: number) => {
    const nextIndex = (index + groups.length) % groups.length;
    setActiveIndex(nextIndex);
    const nextTab = document.getElementById(`technology-tab-${nextIndex}`);
    nextTab?.focus();
    nextTab?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const handleTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      selectTab(index + 1);
    }

    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab(index - 1);
    }

    if (event.key === "Home") {
      event.preventDefault();
      selectTab(0);
    }

    if (event.key === "End") {
      event.preventDefault();
      selectTab(groups.length - 1);
    }
  };

  return (
    <div className="tech-island">
      <div
        className="trail-tabs"
        role="tablist"
        aria-label={language === "vi" ? "Nhóm năng lực kỹ thuật" : "Technical capability groups"}
      >
        <div className="trail-line" aria-hidden="true" />
        {groups.map((group, index) => {
          const selected = index === activeIndex;
          return (
            <motion.button
              key={group.step}
              id={`technology-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="technology-panel"
              tabIndex={selected ? 0 : -1}
              className="trail-tab"
              onClick={() => selectTab(index)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              whileHover={reduceMotion ? undefined : { y: -4 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            >
              <span className="trail-node">
                {selected && (
                  <motion.i
                    layoutId="active-tech-node"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                )}
                <b>{group.short}</b>
              </span>
              <span className="trail-label">
                <small>{group.step}</small>
                <strong>{group.title[language]}</strong>
              </span>
            </motion.button>
          );
        })}
      </div>

      <div
        className="trail-panel panel"
        id="technology-panel"
        role="tabpanel"
        aria-labelledby={`technology-tab-${activeIndex}`}
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.step}
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="trail-panel-content"
          >
            <div className="trail-panel-heading">
              <div>
                <span className="trail-step">
                  {language === "vi" ? "NĂNG LỰC" : "CAPABILITY"} {active.step}
                </span>
                <h3>{active.title[language]}</h3>
              </div>
              <div className="trail-signal">
                <strong>{active.signal.value}</strong>
                <span>{active.signal.label[language]}</span>
              </div>
            </div>

            <p className="trail-description">{active.description[language]}</p>

            <div className="trail-details">
              <div className="trail-detail">
                <h4>{language === "vi" ? "NĂNG LỰC" : "CAPABILITIES"}</h4>
                <ul className="capability-list">
                  {active.capabilities.map((capability) => (
                    <li key={capability.en}>{capability[language]}</li>
                  ))}
                </ul>
              </div>

              <div className="trail-detail">
                <h4>{language === "vi" ? "STACK CỐT LÕI" : "CORE STACK"}</h4>
                <div className="tech-list">
                  {active.technologies.map((technology) => (
                    <motion.span
                      key={technology.name}
                      className={`tech-item tech-item--${technology.depth}`}
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <i aria-hidden="true" />
                      <b>{technology.name}</b>
                      <small>{depthLabels[technology.depth][language]}</small>
                    </motion.span>
                  ))}
                </div>
              </div>
            </div>

            <div className="trail-proof">
              <h4>{language === "vi" ? "BẰNG CHỨNG" : "PROOF"}</h4>
              <div className="proof-list">
                {active.proofs.map((proof) => {
                  const content = (
                    <>
                      <strong>{proof.value}</strong>
                      {proof.label && <span>{proof.label[language]}</span>}
                      {proof.href && <i aria-hidden="true">↗</i>}
                    </>
                  );

                  return proof.href ? (
                    <a key={`${proof.value}-${proof.href}`} href={proof.href}>
                      {content}
                    </a>
                  ) : (
                    <span key={`${proof.value}-${proof.label?.en ?? ""}`}>{content}</span>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
