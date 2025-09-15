import React from "react";
import ellipse1 from "../assets/images/ellipse-1.svg";

const Hero = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <img
        className="absolute top-0 left-0 w-full h-auto"
        alt="Ellipse background"
        src={ellipse1}
      />
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
        <h1 className="text-white text-[110px] font-mazzard-h-medium leading-none tracking-tight text-center">
          Melody Unmix
        </h1>
        <p className="text-white text-2xl font-mazzard-m-medium mt-8 text-center max-w-2xl">
          La herramienta definitiva para separar pistas musicales
        </p>
      </div>
      
      <div className="absolute bottom-0 w-full h-32 bg-black flex items-center justify-center">
        <p className="text-white text-2xl font-mazzard-m-light text-center max-w-4xl">
          Convierte cualquier canción en sus componentes individuales y edita tu música como nunca antes.
        </p>
      </div>
    </div>
  );
};

export default Hero;