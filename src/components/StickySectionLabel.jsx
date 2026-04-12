import { motion } from "framer-motion";

function StickySectionLabel({ label, align = "left" }) {
  return (
    <div
      className={`pointer-events-none sticky top-24 z-20 mb-6 hidden md:block ${
        align === "right" ? "flex justify-end" : "flex justify-start"
      }`}
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase shadow-sm backdrop-blur"
      >
        {label}
      </motion.span>
    </div>
  );
}

export default StickySectionLabel;
