/** Navegadores internos de apps (Instagram, Facebook, WhatsApp…) que o Google bloqueia no login. */
export function isInAppBrowser(ua: string = navigator.userAgent): boolean {
  return /Instagram|FBAN|FBAV|WhatsApp|Line\/|TikTok|musical_ly/i.test(ua);
}

/** Tenta popup; se o navegador bloquear (comum no celular), usa redirecionamento. */
export async function signInGoogle(deps: { popup(): Promise<unknown>; redirect(): Promise<void> }): Promise<void> {
  try {
    await deps.popup();
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
    await deps.redirect();
  }
}
