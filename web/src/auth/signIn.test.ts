import { vi } from "vitest";
import { isInAppBrowser, signInGoogle } from "./signIn";

test("detecta navegador interno de Instagram, Facebook e WhatsApp", () => {
  expect(isInAppBrowser("Mozilla/5.0 (iPhone) Instagram 300.0")).toBe(true);
  expect(isInAppBrowser("Mozilla/5.0 (Linux; Android) [FBAN/FB4A;FBAV/400.0]")).toBe(true);
  expect(isInAppBrowser("Mozilla/5.0 (Linux; Android) WhatsApp/2.24")).toBe(true);
  expect(isInAppBrowser("Mozilla/5.0 (iPhone) Version/17.0 Mobile Safari/604.1")).toBe(false);
});

test("se o popup falhar, usa redirecionamento", async () => {
  const popup = vi.fn(async () => { throw Object.assign(new Error("x"), { code: "auth/popup-blocked" }); });
  const redirect = vi.fn(async () => {});
  await signInGoogle({ popup, redirect });
  expect(redirect).toHaveBeenCalledTimes(1);
});

test("se a pessoa fechar o popup, não redireciona", async () => {
  const popup = vi.fn(async () => { throw Object.assign(new Error("x"), { code: "auth/popup-closed-by-user" }); });
  const redirect = vi.fn(async () => {});
  await signInGoogle({ popup, redirect });
  expect(redirect).not.toHaveBeenCalled();
});
