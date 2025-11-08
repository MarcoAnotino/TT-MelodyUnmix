// AlertCard.jsx
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fadeLift } from "../ui/motion";

export default function AlertCard({ open, title, description, onClose }) {
  if (typeof document === "undefined") return null;

  const overlay = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            variants={fadeLift}
            initial="initial" animate="animate" exit="exit"
            className="relative z-[61] w-full max-w-[450px] rounded-3xl p-6
                       border border-white/10 shadow-2xl
                       bg-[linear-gradient(180deg,#3E0F62_0%,#0A1424_100%)]"
            role="dialog" aria-modal="true"
          >
            <h3 className="text-white text-2xl font-semibold text-center">{title}</h3>
            <p className="mt-2 text-white/85 text-center">{description}</p>
            <div className="mt-6">
              <button
                onClick={onClose}
                className="mx-auto block rounded-2xl px-6 py-2 bg-[#6FE7E1] text-black font-semibold hover:brightness-105 active:scale-[0.99]"
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
