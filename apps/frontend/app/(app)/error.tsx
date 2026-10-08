"use client";

// Se muestra si falla una pantalla (por ejemplo, si el backend no responde).
// Next no pasa al navegador el mensaje real de los errores del servidor.
export default function ErrorDePantalla({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="mx-auto grid max-w-md gap-3 py-16 text-center">
      <h1 className="text-lg font-semibold">No se pudo cargar la pantalla</h1>
      <p className="text-sm text-tenue">
        Puede que el servidor de SIMEP no esté respondiendo. Probá de nuevo en
        un rato.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="justify-self-center rounded-md bg-acento px-4 py-2 text-sm font-semibold text-superficie"
      >
        Reintentar
      </button>
    </div>
  );
}
