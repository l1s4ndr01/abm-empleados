import type { Metadata } from "next";
import { Logo } from "@/componentes/logo";
import { BotonGoogle } from "./boton-google";

export const metadata: Metadata = { title: "Ingresar" };

const AVISOS: Record<string, string> = {
  "sesion-vencida": "Tu sesión venció. Volvé a entrar.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { motivo } = await searchParams;
  const aviso = typeof motivo === "string" ? AVISOS[motivo] : undefined;

  return (
    <main className="grid flex-1 place-items-center px-4 py-12">
      <div className="grid w-full max-w-sm gap-5 rounded-xl border border-linea bg-superficie px-6 py-10 text-center">
        <div className="grid gap-1">
          <Logo className="text-3xl" />
          <p className="text-sm text-tenue">Registro de horas de trabajo</p>
        </div>
        {aviso && (
          <p className="rounded-md bg-aviso-suave px-3 py-2 text-left text-sm text-aviso">
            {aviso}
          </p>
        )}
        <BotonGoogle clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""} />
        <p className="text-sm text-tenue">
          Entrá con el email que te dio de alta el administrador.
        </p>
      </div>
    </main>
  );
}
