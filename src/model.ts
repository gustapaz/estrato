export const entries = [
  {
    id: "curvas",
    name: "Entre as curvas",
    photo: "canyon",
    question: "Onde a luz termina e a sombra começa?",
  },
  {
    id: "superficie",
    name: "Na superfície",
    photo: "cliff",
    question: "Que detalhe você só percebeu ao parar?",
  },
  {
    id: "horizonte",
    name: "Devolver a distância",
    photo: "ridge",
    question: "O que muda quando você olha de longe?",
  },
];
export type Data = {
  version: 1;
  saved: string[];
  notes: Record<string, string>;
  reduced: boolean;
};
export const fresh = (): Data => ({
  version: 1,
  saved: [],
  notes: {},
  reduced: false,
});
export function parse(raw: string): Data | null {
  try {
    const d = JSON.parse(raw);
    if (
      d.version !== 1 ||
      !Array.isArray(d.saved) ||
      new Set(d.saved).size !== d.saved.length ||
      !d.saved.every((id: unknown) => entries.some((e) => e.id === id)) ||
      !d.notes ||
      typeof d.notes !== "object" ||
      Array.isArray(d.notes) ||
      !Object.entries(d.notes).every(
        ([id, v]) =>
          entries.some((e) => e.id === id) &&
          typeof v === "string" &&
          v.length <= 800,
      ) ||
      typeof d.reduced !== "boolean"
    )
      return null;
    return { version: 1, saved: d.saved, notes: d.notes, reduced: d.reduced };
  } catch {
    return null;
  }
}
export function toggle(d: Data, id: string): Data {
  return entries.some((e) => e.id === id)
    ? {
        ...d,
        saved: d.saved.includes(id)
          ? d.saved.filter((v) => v !== id)
          : [...d.saved, id],
      }
    : d;
}
export function note(d: Data, id: string, text: string): Data {
  return entries.some((e) => e.id === id)
    ? { ...d, notes: { ...d.notes, [id]: text.trim().slice(0, 800) } }
    : d;
}
export function exportText(d: Data) {
  return (
    "ESTRATO — CADERNO DE CAMPO\n\n" +
    entries
      .map(
        (e) =>
          `${e.name}${d.saved.includes(e.id) ? " · Favorito" : ""}\n${d.notes[e.id] || "Sem anotação."}`,
      )
      .join("\n\n") +
    "\n\nhttps://gustapaz.github.io/estrato/"
  );
}
