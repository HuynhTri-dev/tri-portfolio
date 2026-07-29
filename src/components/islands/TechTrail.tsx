import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { TechGroup } from "../../data/portfolio";
import "./TechTrail.css";

type Language = "en" | "vi";

type Props = {
  groups: TechGroup[];
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

  return (
    <div className="tech-island">
      <div className="trail-tabs" role="tablist" aria-label="Technology groups">
        <div className="trail-line" aria-hidden="true" />
        {groups.map((group, index) => {
          const selected = index === activeIndex;
          return (
            <motion.button
              key={group.step}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="technology-panel"
              className="trail-tab"
              onClick={() => setActiveIndex(index)}
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

      <div className="trail-panel panel" id="technology-panel" role="tabpanel" aria-live="polite">
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
                <span className="trail-step">CHECKPOINT {active.step}</span>
                <h3>{active.title[language]}</h3>
              </div>
              <span className="trail-evidence">{active.evidence[language]}</span>
            </div>
            <p>{active.description[language]}</p>
            <div className="tech-list">
              {active.technologies.map((technology) => (
                <motion.span
                  key={technology}
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {technology}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
