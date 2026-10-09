// Íconos de línea simples, del color del texto que los rodea.

function Icono({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5 shrink-0 fill-none stroke-current stroke-[1.7]"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const IconoTexto = () => (
  <Icono>
    <path d="M4 6h16M4 12h16M4 18h10" />
  </Icono>
);

export const IconoCarpeta = () => (
  <Icono>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </Icono>
);

export const IconoCalendario = () => (
  <Icono>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icono>
);

export const IconoCronometro = () => (
  <Icono>
    <circle cx="12" cy="13.5" r="7.5" />
    <path d="M12 13.5V9.5M10 2.5h4M18.5 6.5l1.5-1.5" />
  </Icono>
);

export const IconoCerrar = () => (
  <Icono>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icono>
);

export const IconoPersona = () => (
  <Icono>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
  </Icono>
);
