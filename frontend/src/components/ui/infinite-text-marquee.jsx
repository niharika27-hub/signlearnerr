import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function InfiniteTextMarquee({
  text = "Start Learning Sign Language",
  link = "/learn",
  speed = 30,
  showTooltip = true,
  tooltipText = "Tap to continue",
  fontSize = "clamp(2.4rem, 8vw, 7rem)",
  textColor = "",
  hoverColor = "",
}) {
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!showTooltip) return undefined;

    const handleMouseMove = (event) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });

      const midpoint = window.innerWidth / 2;
      const distanceFromMidpoint = Math.abs(event.clientX - midpoint);
      const nextRotation = (distanceFromMidpoint / midpoint) * 8;
      setRotation(event.clientX > midpoint ? nextRotation : -nextRotation);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [showTooltip]);

  const repeatedText = Array.from({ length: 10 }, () => text).join("  -  ");

  return (
    <>
      {showTooltip && (
        <div
          className={`pointer-events-none fixed z-[90] rounded-3xl bg-cyan-200 px-8 py-4 text-sm font-bold tracking-wide text-slate-900 transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            top: `${cursorPosition.y}px`,
            left: `${cursorPosition.x}px`,
            transform: `rotateZ(${rotation}deg) translate(-50%, -140%)`,
          }}
        >
          {tooltipText}
        </div>
      )}

      <div className="relative w-full overflow-hidden">
        <motion.div
          className="whitespace-nowrap"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          animate={{
            x: [0, -1000],
            transition: {
              repeat: Infinity,
              duration: speed,
              ease: "linear",
            },
          }}
        >
          <Link to={link}>
            <span
              className={`inline-block py-8 font-display font-semibold tracking-tight transition-colors ${
                textColor ? "" : "text-slate-800"
              }`}
              style={{
                fontSize,
                color: textColor || undefined,
              }}
            >
              <span
                className="hoverable-text"
                style={{
                  transition: "color 0.28s ease",
                }}
              >
                {repeatedText}
              </span>
            </span>
          </Link>
        </motion.div>
      </div>

      <style>{`
        .hoverable-text:hover {
          color: ${hoverColor || "rgb(196, 181, 253)"};
        }
      `}</style>
    </>
  );
}
