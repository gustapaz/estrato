import { it, expect } from "vitest";
import { fresh, parse, toggle, note, exportText } from "../src/model";
it("favorita uma paisagem existente sem duplicar", () => {
  const d = toggle(fresh(), "curvas");
  expect(d.saved).toEqual(["curvas"]);
  expect(toggle(d, "curvas").saved).toEqual([]);
  expect(toggle(d, "x")).toBe(d);
});
it("limita e preserva notas literais", () => {
  const d = note(fresh(), "curvas", " <b>pedra</b> ");
  expect(d.notes.curvas).toBe("<b>pedra</b>");
  expect(note(d, "curvas", "a".repeat(900)).notes.curvas.length).toBe(800);
});
it("restaura um caderno válido", () => {
  const d = note(toggle(fresh(), "horizonte"), "curvas", "Luz");
  expect(parse(JSON.stringify(d))).toEqual(d);
});
it.each([
  { version: 2 },
  { saved: ["x"] },
  { saved: ["curvas", "curvas"] },
  { notes: { curvas: 9 } },
  { notes: { x: "a" } },
  { notes: [] },
  { reduced: "yes" },
])("rejeita dados inválidos %j", (p) =>
  expect(parse(JSON.stringify({ ...fresh(), ...p }))).toBeNull(),
);
it("exporta somente registros reais e marca favoritos", () => {
  const text = exportText(
    note(toggle(fresh(), "curvas"), "curvas", "Meu olhar"),
  );
  expect(text).toContain("Meu olhar");
  expect(text).toContain("Favorito");
  expect(text).toContain("Sem anotação.");
});
