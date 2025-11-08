// Reutilizable para cards/modals
export const easeOut = [0.22, 0.61, 0.36, 1];
export const easeIn  = [0.4, 0, 1, 1];

export const fadeLift = {
  initial: { opacity: 0, y: 16, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.10, ease: easeOut } },
  exit:    { opacity: 0, y: 8, filter: "blur(2px)", transition: { duration: 0.12, ease: easeIn } },
};
