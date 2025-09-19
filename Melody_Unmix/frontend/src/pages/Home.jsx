import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";

const Home = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Error fetching API:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#333c4e] via-[#252a34] to-[#151516]">
      <Header />
      <Hero />
      <Features />

      {/* Card para mostrar datos del backend */}
      <div className="flex justify-center py-10">
        <div className="bg-[#1e2230] text-white shadow-lg rounded-2xl p-6 w-96 text-center border border-gray-700">
          {!data ? (
            <p className="animate-pulse text-gray-400">Cargando datos...</p>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">{data.message}</h1>
              <p className="text-sm text-gray-300">
                Status: <span className="font-semibold text-green-400">{data.status}</span>
              </p>
            </>
          )}
        </div>
      </div>

      <CTA />
    </div>
  );
};

export default Home;
