"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Enlace de la barra lateral; se resalta cuando es la pantalla actual.
export function EnlaceMenu({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const activo = usePathname().startsWith(href);
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className={`rounded-md px-3 py-2 text-sm ${
        activo
          ? "bg-acento-suave font-semibold text-acento"
          : "text-tenue hover:bg-superficie hover:text-texto"
      }`}
    >
      {children}
    </Link>
  );
}
