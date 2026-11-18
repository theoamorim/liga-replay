import { idade, maskDocumento } from "./mask";

test("mascara CPF mostrando só 3 dígitos do meio", () => {
  expect(maskDocumento("12345678901")).toBe("***.***.789-**");
  expect(maskDocumento("123.456.789-01")).toBe("***.***.789-**");
});

test("outros documentos mostram só os 3 últimos dígitos", () => {
  expect(maskDocumento("MG1234567")).toBe("******567");
  expect(maskDocumento("")).toBe("");
});

test("idade em anos completos", () => {
  const hoje = new Date(2026, 9, 23);
  expect(idade("2008-10-23", hoje)).toBe(18);
  expect(idade("2008-10-24", hoje)).toBe(17);
});
