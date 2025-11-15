import React from "react";
import image1 from "../assets/images/image-1.png";
import image2 from "../assets/images/image-2.png";
import image3 from "../assets/images/image-3.png";
import image4 from "../assets/images/image-4.png";
import ellipse2 from "../assets/images/ellipse-2.svg";
import ellipse4 from "../assets/images/ellipse-4.svg";

const Features = () => {
  const features = [
    { name: "Voz", image: image1 },
    { name: "Batería", image: image2 },
    { name: "Guitarra", image: image3 },
    { name: "Bajo", image: image4 },
  ];

  return (
    <div className="relative w-full py-16 sm:py-20 overflow-hidden rounded-3xl">
      {/* Fondos laterales: solo en pantallas medianas hacia arriba para no estorbar en móvil */}
      <img
        className="hidden md:block absolute top-0 left-0 w-[480px] opacity-70 pointer-events-none select-none"
        alt="Ellipse background"
        src={ellipse2}
      />
      <img
        className="hidden md:block absolute top-0 right-0 w-[520px] opacity-70 pointer-events-none select-none"
        alt="Ellipse background"
        src={ellipse4}
      />

      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6">
        <p className="text-white text-2xl sm:text-3xl md:text-4xl font-mazzard-m text-center max-w-2xl mb-10 sm:mb-16">
          Con tecnología avanzada de inteligencia artificial, descompón canciones en:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-16 place-items-center w-full max-w-3xl">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <img
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover mb-4 rounded-2xl"
                alt={feature.name}
                src={feature.image}
              />
              <h3 className="text-white text-xl sm:text-2xl font-mazzard-m">
                {feature.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
