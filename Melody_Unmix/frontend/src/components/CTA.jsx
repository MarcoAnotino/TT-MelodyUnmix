import React from "react";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-white text-5xl font-mazzard-m-semi-bold mb-20">
        Comienza Gratis
      </h2>

      <button
        onClick={() => navigate("/signup")}
        className="
          w-64 h-24 rounded-[20px] flex items-center justify-center
          bg-[#08d9d6]
          transition-all duration-200 ease-out
          hover:brightness-110 hover:scale-[1.02]
          active:scale-[0.98]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#08d9d6]/60 focus-visible:ring-offset-[#141516]
        "
      >
        <span className="text-[#141516] text-5xl font-mazzard-m-semi-bold">
          Sign Up
        </span>
      </button>
    </div>
  );
};

export default CTA;
