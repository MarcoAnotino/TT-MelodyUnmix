import React from "react";

const CTA = () => {
  return (
    <div className="flex flex-col items-center py-20">
      <h2 className="text-white text-5xl font-mazzard-m-semi-bold mb-10">
        Comienza Gratis
      </h2>
      
      <button className="w-64 h-24 bg-[#08d9d6] rounded-[20px] flex items-center justify-center">
        <span className="text-[#141516] text-5xl font-mazzard-m-semi-bold">
          Sign Up
        </span>
      </button>
    </div>
  );
};

export default CTA;