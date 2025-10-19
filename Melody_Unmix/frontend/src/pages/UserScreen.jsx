import React, { useRef, useState } from "react";
import logo from "../assets/images/logoapp-1.png";

const initialRows = [
  { titulo: "Helena Beat", duracion: "3:46", estatus: "En Curso" },
  { titulo: "Body",        duracion: "—",   estatus: "Pendiente" },
  { titulo: "Body",        duracion: "—",   estatus: "Pendiente" },
  { titulo: "Body",        duracion: "—",   estatus: "Pendiente" },
];

export default function UserScreen() {
  const fileInputRef = useRef(null);
  const [rows, setRows] = useState(initialRows);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Aqui es donde se llamra a Demucs
    setRows((r) => [
      { titulo: file.name, duracion: "—", estatus: "Subido" },
      ...r,
    ]);
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,rgba(51,60,78,1)_3%,rgba(37,42,52,1)_49%,rgba(21,21,22,1)_95%)] text-white">
      {/* Top bar */}
      <header className="w-full flex justify-center pt-6">
        <div className="w-full max-w-[1065px] h-[60px] bg-black/100 rounded-[27px] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="logo" className="w-[45px] h-[37px]" />
          </div>

          <nav className="hidden sm:flex items-center gap-16">
            <a href="/" className="text-white text-lg">Home</a>
            <a href="/about" className="text-white text-lg">About</a>
          </nav>

          <div className="bg-[#0c0c0c] rounded-full px-4 py-2 flex items-center gap-2">
            {/* ícono usuario */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" fill="#9AE6B4"/>
            </svg>
            <span className="text-sm sm:text-base">Hola, Usuario!</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full flex flex-col items-center mt-24 px-4">
        <h1 className="font-semibold text-3xl sm:text-4xl">Comienza a probar nuestra IA</h1>
        <p className="text-[#e7e7e7] text-2xl mt-1">Sube tu archivo ahora</p>

        <button
          onClick={handleUploadClick}
          className="mt-8 w-[205px] h-[49px] flex items-center justify-center bg-[#3e4070] rounded-[20px] hover:bg-[#4a4d8a] transition-colors"
        >
          <span className="text-xl">Subir archivo</span>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </section>

      {/* Tabla */}
      <section className="w-full flex justify-center mt-20 pb-24 px-4">
        <div className="w-full max-w-[1117px]">
          <div
            className="grid grid-cols-3 text-[#e3dddd] text-xl sm:text-2xl px-3 py-2"
            role="row"
          >
            <div className="">Titulo</div>
            <div className="">Duracion</div>
            <div className="text-right">Estatus</div>
          </div>

          <div className="divide-y divide-white/10">
            {rows.map((row, i) => (
              <div
                key={`${row.titulo}-${i}`}
                className="grid grid-cols-3 items-center px-3 py-5 text-[#c5c5c5] text-xl"
                role="row"
              >
                <div className="truncate">{row.titulo}</div>
                <div className="">{row.duracion}</div>
                <div className="text-right">{row.estatus}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
