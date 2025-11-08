// src/pages/Home.jsx
import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-home">
      {/* Navbar del Home: un solo pill con Home / About / Sign In–Sign up */}
      <Header variant="home" />

      {/* Separación para que el hero no quede debajo del header */}
      <div className="pt-8" />

      <main className="flex flex-col gap-6">
        <Hero />
        <Features />
        <section className="mt-4">
          <CTA />
        </section>
      </main>

      <footer className="h-10" />
    </div>
  );
}
