import React from "react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center text-center">
      <h2 className="text-white font-mazzard-m-semi-bold mb-10 sm:mb-16 text-3xl sm:text-4xl md:text-5xl">
        Comienza Gratis
      </h2>

      <button
        onClick={() => navigate("/signup")}
        className="
          w-full max-w-xs sm:max-w-sm 
          h-12 sm:h-16 md:h-20 
          rounded-[20px] flex items-center justify-center
          bg-[#08d9d6]
          transition-all duration-200 ease-out
          hover:brightness-110 hover:scale-[1.02]
          active:scale-[0.98]
          focus:outline-none focus-visible:ring-2 
          focus-visible:ring-offset-2 focus-visible:ring-[#08d9d6]/60 
          focus-visible:ring-offset-[#141516]
        "
      >
        <span className="text-[#141516] font-mazzard-m-semi-bold text-lg sm:text-2xl md:text-3xl">
          Regístrate
        </span>
      </button>
    </div>
  );
};

export default CTA;
