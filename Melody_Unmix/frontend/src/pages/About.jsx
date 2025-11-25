// About.jsx
import React, { useRef } from "react";
import Header from "../components/Header";
import { useAutoPauseVideo } from "../hooks/useAutoPauseVideo";

import diegoabout1 from "../assets/images/DiegoAbout.jpeg";
import marcoabout1 from "../assets/images/MarcoAbout.jpeg";
import axelabout1  from "../assets/images/AxelAbout.jpeg";
import raulabout1  from "../assets/images/RaulAbout.webp";

export default function About() {
  const videoRef = useRef(null);
  useAutoPauseVideo(videoRef, { threshold: 0.65 });

  const team = [
    {
      name: "DIEGO HERNÁNDEZ",
      img: diegoabout1,
      bio:
        "Guitarrista y baterista apasionado por la música. Es parte fundamental del entrenamiento de esta IA.",
    },
    {
      name: "MARCO JIMÉNEZ",
      img: marcoabout1,
      bio:
        "Experto en la guitarra, es clave en la programación de esta herramienta.",
    },
    {
      name: "AXEL CABALLERO",
      img: axelabout1,
      bio:
        "Productor musical de corazón y curioso de la ciberseguridad. Le encanta transformar ideas en canciones y que todo funcione seguro.",
    },
    {
      name: "RAÚL MARTÍNEZ",
      img: raulabout1,
      bio:
        "Aventurero y extrovertido. Con formación en canto, aporta la chispa creativa que nos recuerda que la música es, ante todo, emoción.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-home">
      {/* Luces (glows) del fondo */}
      <div className="glow glow-top" />
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <Header variant="home" />

      {/* Hero / Título */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold">
          ¿Quiénes somos?
        </h1>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-white/90 leading-relaxed">
          Somos cuatro estudiantes de último año de la{" "}
          <span className="italic font-semibold">
            Escuela Superior de Cómputo
          </span>{" "}
          del{" "}
          <span className="italic font-semibold">
            Instituto Politécnico Nacional
          </span>
          . Apasionados por la música y la ingeniería, construimos esta
          herramienta que nos habría encantado tener cuando empezamos a producir
          y practicar.
        </p>
      </section>

      {/* Grid de integrantes */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10">
          {team.map((m) => (
            <article
              key={m.name}
              className="
                bg-white/5 border border-white/10 rounded-2xl
                p-5 sm:p-6
                text-center backdrop-blur-sm
                flex flex-col items-center
              "
            >
              <img
                src={m.img}
                alt={m.name}
                className="team-avatar mx-auto"
              />
              <h3 className="mt-4 sm:mt-5 text-lg sm:text-xl font-semibold tracking-wide">
                {m.name}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed">
                {m.bio}
              </p>
            </article>
          ))}
        </div>
      </section>
      <footer className="h-10" />
    </div>
  );
}
