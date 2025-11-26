import React from "react";
import ellipse1 from "../assets/images/ellipse-1.svg";

const Hero = () => {
  return (
    <div className="relative w-full min-h-[80vh] overflow-hidden">
      {/* Fondo */}
      <img
        className="absolute top-0 left-0 w-full h-auto pointer-events-none select-none"
        alt="Ellipse background"
        src={ellipse1}
      />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[60vh] px-4 pt-8 pb-24">
        <h1
          className="
            text-white 
            font-mazzard-h-medium 
            leading-none tracking-tight text-center
            text-[clamp(40px,10vw,110px)]
          "
        >
          Melody Unmix
        </h1>
        <p className="text-white mt-6 text-center max-w-2xl text-base sm:text-xl md:text-2xl font-mazzard-m-medium">
          La herramienta definitiva para separar pistas musicales
        </p>
      </div>

      {/* Franja inferior */}
      <div className="absolute bottom-0 w-full h-20 sm:h-28 bg-black flex items-center justify-center px-4">
        <p className="text-white text-sm sm:text-lg md:text-2xl font-mazzard-m-light text-center max-w-4xl">
          Convierte cualquier canción en sus componentes individuales y edita tu
          música como nunca antes.
        </p>
      </div>
    </div>
  );
};

export default Hero;
