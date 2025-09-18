import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#333c4e] via-[#252a34] to-[#151516]">
      <Header />
      <Hero />
      <Features />
      <CTA />
    </div>
  );
};

export default Home;