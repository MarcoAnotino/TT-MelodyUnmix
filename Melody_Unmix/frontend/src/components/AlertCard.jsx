// AlertCard.jsx
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { fadeLift } from "../ui/motion";

export default function AlertCard({ open, title, description, onClose }) {
  if (typeof document === "undefined") return null;

  const overlay = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 sm:px-6">
          {/* Fondo */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          {/* Card */}
          <motion.div
            variants={fadeLift}
            initial="initial"
            animate="animate"
            exit="exit"
            className="
              relative z-[61] w-full max-w-sm sm:max-w-[450px]
              rounded-2xl sm:rounded-3xl
              p-4 sm:p-6
              border border-white/10 shadow-2xl
              bg-[linear-gradient(180deg,#3E0F62_0%,#0A1424_100%)]
              max-h-[80vh] overflow-y-auto
            "
            role="dialog"
            aria-modal="true"
          >
            <h3 className="text-white text-lg sm:text-2xl font-semibold text-center">
              {title}
            </h3>
            <p className="mt-2 text-sm sm:text-base text-white/85 text-center">
              {description}
            </p>
            <div className="mt-5 sm:mt-6">
              <button
                onClick={onClose}
                className="
                  mx-auto block
                  rounded-2xl px-5 py-2 sm:px-6
                  bg-[#6FE7E1] text-black font-semibold
                  text-sm sm:text-base
                  hover:brightness-105 active:scale-[0.99]
                "
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
