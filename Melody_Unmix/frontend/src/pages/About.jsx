import React, { useRef } from "react";
import Header from "../components/Header";
import demoVideo from "../assets/images/DemoVideoBand.mp4";
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
        "Experto en la guitarra es clave en la programación de esta herramienta.",
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

      {/* Navbar con logo y botones: Home / About / Sign in–up */}
      <Header variant="home" />

      {/* Separación inicial */}
      <div className="pt-10" />

      {/* Hero / Título */}
      <section className="max-w-5xl mx-auto px-6 mt-10 text-center">
        <h1 className="text-4xl sm:text-6xl font-semibold">¿Quiénes somos?</h1>
        <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed">
          Somos cuatro estudiantes de último año de la{" "}
          <span className="italic font-semibold">Escuela Superior de Cómputo</span> del{" "}
          <span className="italic font-semibold">Instituto Politécnico Nacional</span>.
          Apasionados por la música y la ingeniería, construimos esta herramienta que
          nos habría encantado tener cuando empezamos a producir y practicar.
        </p>
      </section>

      {/* Grid de integrantes */}
    <section className="max-w-5xl mx-auto px-6 mt-14 pb-24 grid grid-cols-1 sm:grid-cols-2 gap-12">
        {team.map((m) => (
          <article
            key={m.name}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center backdrop-blur-sm"
          >
            <img
              src={m.img}
              alt={m.name}
              className="team-avatar mx-auto"
            />
            <h3 className="mt-5 text-xl font-semibold tracking-wide">{m.name}</h3>
            <p className="mt-3 text-white/90 leading-relaxed">{m.bio}</p>
          </article>
        ))}
    </section>

    <section className="px-6 mt-10 mb-24">
        <h2 className="text-center text-2xl sm:text-3xl font-semibold mb-6">
          Así suena nuestra banda en vivo
        </h2>

        <div
          className="
            mx-auto w-full max-w-4xl md:max-w-5xl
            rounded-2xl overflow-hidden border border-white/10
            shadow-[0_20px_60px_rgba(0,0,0,0.45)]
          "
          style={{ aspectRatio: "16 / 9" }}   // controla altura y mantiene 16:9
        >
          <video
            ref={videoRef}
            className="w-full h-full block"
            src={demoVideo}
            controls
            playsInline
            muted
            loop
            preload="metadata"
            // poster={posterImg}  // opcional si tienes una imagen de portada
          >
            Tu navegador no soporta video HTML5.
          </video>
        </div>

        <p className="mt-3 text-center text-white/80 text-sm">
          Fragmento extraido de un video en internet.
        </p>
      </section>

      <footer className="h-10" />
    </div>
  );
}
