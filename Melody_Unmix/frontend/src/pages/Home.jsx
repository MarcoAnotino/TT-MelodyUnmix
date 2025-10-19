import React from "react";
import { useApi } from "../hooks/useApi";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Features from "../components/Features";
import CTA from "../components/CTA";

const Card = ({ children }) => (
  <div className="bg-[#1e2230] text-white shadow-lg rounded-2xl p-6 w-full sm:w-96 text-center border border-gray-700">
    {children}
  </div>
);

export default function Home() {
  const { data: pingData, loading: pingLoading, error: pingError } = useApi("/api/");
  const { data: healthData, loading: healthLoading, error: healthError } = useApi("/api/health/");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-home">
      {/* Navbar del Home: un solo pill con Home / About / Sign In–Sign up */}
      <Header variant="home" />

      {/* separación para que el hero no quede debajo del header */}
      <div className="pt-8" />

      <main className="flex flex-col gap-12">
        <Hero />

        {/* Si tenías una franja negra rígida de Anima, elimínala.
            Si quieres algo similar, usa transparencia: bg-black/80 */}

        <Features />

        {/* Recuadros originales (Ping/Health) */}
        <section className="w-full flex justify-center px-4">
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 gap-6 place-items-center">
            {/* Ping */}
            <Card>
              {pingLoading ? (
                <p className="animate-pulse text-gray-400">Cargando API...</p>
              ) : pingError ? (
                <p className="text-red-400">Error: {String(pingError)}</p>
              ) : (
                <>
                  <h1 className="text-2xl font-bold mb-2">
                    {pingData?.message ?? "Welcome to the MelodyUnmix API"}
                  </h1>
                  <p className="text-sm text-gray-300">
                    Status:{" "}
                    <span className="font-semibold text-green-400">
                      {pingData?.status ?? "ok"}
                    </span>
                  </p>
                </>
              )}
            </Card>

            {/* Health */}
            <Card>
              {healthLoading ? (
                <p className="animate-pulse text-gray-400">Verificando sistema...</p>
              ) : healthError ? (
                <p className="text-red-400">Error: {String(healthError)}</p>
              ) : (
                <>
                  <h1 className="text-xl font-bold mb-2">Health Check</h1>
                  <p className="text-sm text-gray-300">
                    Database:{" "}
                    <span
                      className={`font-semibold ${
                        healthData?.database === "ok" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {healthData?.database ?? "unknown"}
                    </span>
                  </p>
                  <p className="text-sm text-gray-300">
                    Mongo:{" "}
                    <span
                      className={`font-semibold ${
                        healthData?.mongo === "ok" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {healthData?.mongo ?? "unknown"}
                    </span>
                  </p>
                </>
              )}
            </Card>
          </div>
        </section>

        <CTA />
      </main>

      <footer className="h-10" />
    </div>
  );
}
