import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export const inputCls = "mt-1 min-h-11 w-full rounded-lg border border-borda bg-fundo px-3 text-texto";

export function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return <label className="block text-sm">{label}<input className={inputCls} {...props} /></label>;
}

export function Select({ label, children, ...props }: { label: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  return <label className="block text-sm">{label}<select className={inputCls} {...props}>{children}</select></label>;
}

export function Button({ variant = "primario", className = "", ...props }: { variant?: "primario" | "secundario" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = variant === "primario" ? "bg-cobre text-fundo font-semibold" : "border border-borda text-texto";
  return <button className={`min-h-11 rounded-lg px-4 disabled:opacity-40 ${v} ${className}`} {...props} />;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`space-y-3 rounded-xl border border-borda bg-superficie p-4 ${className}`}>{children}</div>;
}
