import React from "react";
import image1 from "../assets/images/image-1.png";
import image2 from "../assets/images/image-2.png";
import image3 from "../assets/images/image-3.png";
import image4 from "../assets/images/image-4.png";
import ellipse2 from "../assets/images/ellipse-2.svg";
import ellipse4 from "../assets/images/ellipse-4.svg";

const Features = () => {
  const features = [
    { name: "Voz", image: image1, position: "top-[218px] left-[73px]" },
    { name: "Bateria", image: image2, position: "top-[218px] left-[466px]" },
    { name: "Guitarra", image: image3, position: "top-[564px] left-10" },
    { name: "Bajo", image: image4, position: "top-[564px] left-[485px]" },
  ];

  return (
    <div className="relative w-full min-h-screen py-20 overflow-hidden">
      <img
        className="absolute top-[148px] left-0 w-[713px] h-[2152px]"
        alt="Ellipse background"
        src={ellipse2}
      />
      <img
        className="absolute top-[148px] right-0 w-[786px] h-[2152px]"
        alt="Ellipse background"
        src={ellipse4}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        <p className="text-white text-4xl font-mazzard-m text-center max-w-2xl mb-20">
          Con tecnología avanzada de inteligencia artificial, descompón canciones en:
        </p>
        
        <div className="grid grid-cols-2 gap-16 relative">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                className="w-48 h-48 object-cover mb-4"
                alt={feature.name}
                src={feature.image}
              />
              <h3 className="text-white text-2xl font-mazzard-m">{feature.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;