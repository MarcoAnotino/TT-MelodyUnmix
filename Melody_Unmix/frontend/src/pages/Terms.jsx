// src/pages/Terms.jsx
import React from "react";
import Header from "../components/Header";

export default function Terms() {
    const lastUpdate = new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-signin text-white">
            <Header />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-20 sm:pb-28">
                {/* Título / Hero */}
                <div className="text-center mb-8 sm:mb-10 px-2">
                    <h1
                        className="
              text-3xl sm:text-4xl lg:text-5xl font-semibold
              bg-gradient-to-r from-[#08D9D6] via-[#C625D1] to-[#A87D06]
              bg-clip-text text-transparent
            "
                    >
                        Términos de uso y Aviso de privacidad
                    </h1>
                    <p className="mt-3 text-xs sm:text-sm opacity-80">
                        Última actualización: {lastUpdate}
                    </p>
                </div>

                {/* Card principal */}
                <div
                    className="
            mx-auto w-full
            bg-black/40 backdrop-blur-md rounded-2xl
            border border-white/10
            p-5 sm:p-8 lg:p-10
            shadow-[0_10px_25px_rgba(0,0,0,0.35)]
          "
                >
                    <div className="space-y-8 text-sm sm:text-base leading-relaxed text-white/90">
                        {/* Section 1 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-9 w-1 rounded-full bg-gradient-to-b from-[#08D9D6] to-[#A87D06]" />
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                                    1. Uso del contenido subido por el usuario
                                </h2>
                            </div>

                            <div className="space-y-4 pl-1 sm:pl-4">
                                <p className="text-white/80">
                                    El usuario reconoce y acepta que es el único responsable del
                                    contenido de audio que sube a la plataforma Melody Unmix. Al
                                    utilizar el sistema, el usuario declara que:
                                </p>

                                <ul className="space-y-3 ml-4">
                                    <li className="flex gap-3">
                                        <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                            •
                                        </span>
                                        <span>
                                            Cuenta con los derechos, licencias y/o autorizaciones
                                            necesarias para utilizar las canciones, pistas y archivos
                                            de audio que procesa a través de la aplicación web.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                            •
                                        </span>
                                        <span>
                                            El uso de dicho contenido dentro de Melody Unmix no
                                            infringe derechos de autor, derechos conexos ni ningún
                                            otro derecho de terceros.
                                        </span>
                                    </li>
                                </ul>

                                <div className="bg-[#08D9D6]/10 border border-[#08D9D6]/30 rounded-xl p-4 mt-2">
                                    <p className="text-white/85 text-xs sm:text-sm">
                                        Melody Unmix actúa únicamente como una herramienta
                                        tecnológica de procesamiento de audio con fines académicos
                                        y/o demostrativos, no así con fines lucrativos o
                                        comerciales. La plataforma no reclama ningún derecho de
                                        propiedad intelectual sobre los archivos subidos por el
                                        usuario ni sobre las obras musicales originales.
                                    </p>
                                </div>

                                <h3 className="text-base sm:text-lg font-semibold mt-5">
                                    1.1 Uso del contenido subido por el usuario
                                </h3>
                                <p className="text-white/80">
                                    Los archivos de audio cargados por el usuario se utilizan
                                    exclusivamente para:
                                </p>
                                <ul className="space-y-2 ml-4">
                                    <li className="flex gap-3">
                                        <span className="text-[#A87D06] mt-1.5 flex-shrink-0">
                                            •
                                        </span>
                                        <span>
                                            Procesar y generar las pistas separadas (stems)
                                            correspondientes.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-[#A87D06] mt-1.5 flex-shrink-0">
                                            •
                                        </span>
                                        <span>
                                            Permitir la descarga de los resultados desde la aplicación
                                            web.
                                        </span>
                                    </li>
                                </ul>

                                <p className="text-white/80">
                                    Melody Unmix no utiliza los archivos de audio ni las pistas
                                    generadas con fines de distribución, comercialización o
                                    comunicación pública. El procesamiento se realiza de forma
                                    automatizada, sin intervención humana en el contenido.
                                </p>
                            </div>
                        </section>

                        {/* Divider */}
                        <div className="h-px bg-white/10" />

                        {/* Section 2 */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-9 w-1 rounded-full bg-gradient-to-b from-[#08D9D6] to-[#A87D06]" />
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                                    2. Responsabilidad del usuario
                                </h2>
                            </div>

                            <div className="space-y-4 pl-1 sm:pl-4">
                                <p className="text-white/80">El usuario se obliga a:</p>
                                <ul className="space-y-3 ml-4">
                                    <li className="flex gap-3">
                                        <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                            •
                                        </span>
                                        <span>
                                            No utilizar la plataforma para reproducir, distribuir o
                                            comunicar públicamente obras sin la autorización
                                            correspondiente cuando así se requiera por la legislación
                                            aplicable.
                                        </span>
                                    </li>
                                    <li className="flex gap-3">
                                        <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                            •
                                        </span>
                                        <span>
                                            No emplear Melody Unmix para vulnerar derechos de autor,
                                            marcas, secretos industriales u otros derechos de
                                            terceros.
                                        </span>
                                    </li>
                                </ul>

                                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 mt-2">
                                    <p className="text-white/85 text-xs sm:text-sm">
                                        En caso de cualquier reclamación, queja o acción legal
                                        derivada del uso no autorizado de contenido por parte del
                                        usuario, éste reconoce que Melody Unmix y sus desarrolladores
                                        no serán responsables por dicho uso y se compromete a sacar
                                        en paz y a salvo a los responsables del sistema frente a
                                        terceros.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Divider */}
                        <div className="h-px bg-white/10" />

                        {/* Section 3 - Aviso de privacidad */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-9 w-1 rounded-full bg-gradient-to-b from-[#08D9D6] to-[#A87D06]" />
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                                    3. Aviso de privacidad
                                </h2>
                            </div>

                            <div className="space-y-6 pl-1 sm:pl-4">
                                <p className="text-white/80">
                                    El tratamiento de los datos personales dentro del sistema
                                    Melody Unmix se realiza en estricto apego a los principios,
                                    deberes y obligaciones establecidos en la Ley Federal de
                                    Protección de Datos Personales en Posesión de los Particulares
                                    (LFPDPPP) y su Reglamento. Nuestro compromiso es garantizar la
                                    privacidad, confidencialidad y seguridad de la información
                                    proporcionada por los usuarios durante el uso de la
                                    plataforma.
                                </p>

                                {/* 3.1 Datos que se recaban */}
                                <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3">
                                        3.1 Datos que se recaban
                                    </h3>
                                    <p className="text-white/80 mb-3">
                                        Para la creación y administración de cuentas dentro del
                                        sistema, así como para la ejecución de sus funciones, se
                                        recaban los siguientes datos:
                                    </p>
                                    <ul className="space-y-2 ml-4">
                                        <li className="flex gap-3">
                                            <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                <strong className="text-white">
                                                    Datos de identificación:
                                                </strong>{" "}
                                                nombre, apellidos, correo electrónico, nombre de
                                                usuario.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                <strong className="text-white">
                                                    Datos de acceso:
                                                </strong>{" "}
                                                contraseña (almacenada mediante mecanismos de cifrado).
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                <strong className="text-white">
                                                    Archivos de audio
                                                </strong>{" "}
                                                cargados por el usuario para su procesamiento.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                <strong className="text-white">Datos técnicos</strong>{" "}
                                                asociados a la operación del sistema.
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                {/* 3.2 Finalidades */}
                                <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3">
                                        3.2 Finalidades del tratamiento
                                    </h3>
                                    <p className="text-white/80 mb-3">
                                        Los datos personales recabados son utilizados exclusivamente
                                        para:
                                    </p>
                                    <ul className="space-y-2 ml-4">
                                        <li className="flex gap-3">
                                            <span className="text-[#A87D06] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                Crear y administrar la cuenta del usuario en la
                                                plataforma.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#A87D06] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                Permitir el uso de las funcionalidades principales del
                                                sistema, incluyendo el procesamiento y separación de
                                                pistas musicales.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#A87D06] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>Mostrar el historial de archivos procesados.</span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#A87D06] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                Garantizar la seguridad, integridad y correcto
                                                funcionamiento de la plataforma.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#A87D06] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                Realizar mejoras técnicas, pruebas internas y
                                                mantenimiento del sistema.
                                            </span>
                                        </li>
                                    </ul>
                                    <div className="bg-[#08D9D6]/10 border border-[#08D9D6]/30 rounded-lg p-3 mt-4">
                                        <p className="text-xs sm:text-sm text-white/85">
                                            En ningún caso los datos son utilizados con fines
                                            publicitarios, comerciales o de transferencia a terceros.
                                        </p>
                                    </div>
                                </div>

                                {/* 3.3 Protección */}
                                <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3">
                                        3.3 Protección y resguardo de la información
                                    </h3>
                                    <p className="text-white/80 mb-3">
                                        En cumplimiento con la LFPDPPP, se implementan medidas para
                                        proteger los datos personales y los archivos de audio
                                        cargados por los usuarios. Estas medidas incluyen:
                                    </p>
                                    <ul className="space-y-2 ml-4">
                                        <li className="flex gap-3">
                                            <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                Cifrado de contraseñas mediante algoritmos de un solo
                                                sentido (hashing).
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                Control de acceso restringido a las funcionalidades del
                                                sistema.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                Eliminación segura de archivos temporales una vez
                                                concluido su uso.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                Contenedores aislados para el procesamiento de audio,
                                                evitando exposición de archivos.
                                            </span>
                                        </li>
                                        <li className="flex gap-3">
                                            <span className="text-[#08D9D6] mt-1.5 flex-shrink-0">
                                                •
                                            </span>
                                            <span>
                                                Auditorías internas para identificar vulnerabilidades y
                                                corregirlas oportunamente.
                                            </span>
                                        </li>
                                    </ul>
                                </div>

                                {/* 3.4 Conservación */}
                                <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3">
                                        3.4 Conservación y eliminación de los datos
                                    </h3>
                                    <p className="text-white/80">
                                        Los archivos de audio y resultados generados se conservan
                                        únicamente el tiempo necesario para cumplir con las
                                        funcionalidades del sistema o hasta que el usuario solicite
                                        su eliminación. Una vez cumplida su finalidad, los datos son
                                        eliminados de forma segura para evitar acceso no autorizado.
                                    </p>
                                </div>

                                {/* 3.5 Confidencialidad */}
                                <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/10">
                                    <h3 className="text-base sm:text-lg font-semibold mb-3">
                                        3.5 Confidencialidad
                                    </h3>
                                    <p className="text-white/80">
                                        Melody Unmix no comparte, renta, vende ni transfiere los
                                        datos personales de los usuarios a terceros. Toda
                                        información proporcionada es utilizada exclusivamente para
                                        el funcionamiento de la plataforma dentro del marco académico
                                        en el que se desarrolla.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
