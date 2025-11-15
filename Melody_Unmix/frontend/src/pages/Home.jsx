import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-home">
      {/* Navbar del Home */}
      <Header variant="home" />

      {/* Separación para que el hero no quede debajo del header */}
      <div className="pt-16 sm:pt-20" />

      <main className="flex flex-col gap-16 sm:gap-20 pb-10">
        {/* Hero ocupa el ancho completo */}
        <Hero />

        {/* Sección de features centrada */}
        <section className="w-full max-w-6xl mx-auto px-4 sm:px-6">
          <Features />
        </section>

        {/* CTA centrado con espacio */}
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 mb-6 sm:mb-12">
          <CTA />
        </section>
      </main>

      <footer className="h-10" />
    </div>
  );
}
