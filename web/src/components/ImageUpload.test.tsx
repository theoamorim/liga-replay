import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ImageUpload from "./ImageUpload";

const ordem: string[] = [];
vi.mock("../lib/image", () => ({
  resizeImage: vi.fn(async () => { ordem.push("resize"); return new Blob(["x"], { type: "image/jpeg" }); }),
}));
vi.mock("../data/storageUpload", () => ({
  uploadImage: vi.fn(async (path: string, blob: Blob) => { ordem.push(`upload:${path}:${blob.type}`); return "https://img/x.jpg"; }),
}));

test("redimensiona antes de enviar e devolve a URL", async () => {
  const onUploaded = vi.fn();
  render(<ImageUpload path="teams/t1.jpg" onUploaded={onUploaded} label="Escudo" />);
  const file = new File(["conteudo"], "escudo.png", { type: "image/png" });
  await userEvent.upload(screen.getByLabelText("Escudo"), file);
  await vi.waitFor(() => expect(onUploaded).toHaveBeenCalledWith("https://img/x.jpg"));
  expect(ordem).toEqual(["resize", "upload:teams/t1.jpg:image/jpeg"]);
});
