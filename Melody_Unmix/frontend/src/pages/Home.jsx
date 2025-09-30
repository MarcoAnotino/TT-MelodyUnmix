import React from "react";
import { useApi } from "../hooks/useApi";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";

const Home = () => {
  const { data: pingData, loading: pingLoading, error: pingError } = useApi("/api/");
  const { data: healthData, loading: healthLoading, error: healthError } = useApi("/api/health/");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#333c4e] via-[#252a34] to-[#151516]">
      <Header />
      <Hero />
      <Features />

      {/* Card de Ping */}
      <div className="flex justify-center py-5">
        <div className="bg-[#1e2230] text-white shadow-lg rounded-2xl p-6 w-96 text-center border border-gray-700">
          {pingLoading ? (
            <p className="animate-pulse text-gray-400">Cargando API...</p>
          ) : pingError ? (
            <p className="text-red-400">Error: {pingError}</p>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">{pingData.message}</h1>
              <p className="text-sm text-gray-300">
                Status:{" "}
                <span className="font-semibold text-green-400">{pingData.status}</span>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Card de Health Check */}
      <div className="flex justify-center py-5">
        <div className="bg-[#1e2230] text-white shadow-lg rounded-2xl p-6 w-96 text-center border border-gray-700">
          {healthLoading ? (
            <p className="animate-pulse text-gray-400">Verificando sistema...</p>
          ) : healthError ? (
            <p className="text-red-400">Error: {healthError}</p>
          ) : (
            <>
              <h1 className="text-xl font-bold mb-2">Health Check</h1>
              <p className="text-sm text-gray-300">
                Database:{" "}
                <span
                  className={`font-semibold ${
                    healthData.database === "ok" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {healthData.database}
                </span>
              </p>
              <p className="text-sm text-gray-300">
                Mongo:{" "}
                <span
                  className={`font-semibold ${
                    healthData.mongo === "ok" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {healthData.mongo}
                </span>
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
