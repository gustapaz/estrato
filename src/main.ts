import van from "vanjs-core";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  entries,
  fresh,
  parse,
  toggle,
  note,
  exportText,
  type Data,
} from "./model";
import "./style.css";
gsap.registerPlugin(ScrollTrigger);
const { div, p, h3, button, a, textarea, label, span } = van.tags;
let initial = fresh(),
  warning = "";
try {
  const raw = localStorage.getItem("estrato:1");
  if (raw) {
    const valid = parse(raw);
    if (valid) initial = valid;
    else warning = "O caderno salvo não pôde ser lido. Começamos um novo.";
  }
} catch {
  warning = "Armazenamento indisponível. As notas ficam somente nesta visita.";
}
const state = van.state(initial),
  message = van.state(warning),
  onlySaved = van.state(false);
function commit(next: Data) {
  state.val = next;
  try {
    localStorage.setItem("estrato:1", JSON.stringify(next));
  } catch {
    message.val =
      "Não foi possível salvar. Exporte suas notas para guardá-las.";
  }
}
van.add(
  document.querySelector("#notebook")!,
  div(
    { class: "book-tools" },
    button(
      {
        onclick: () => (onlySaved.val = !onlySaved.val),
        "aria-pressed": () => String(onlySaved.val),
      },
      () => (onlySaved.val ? "Mostrar todos" : "Só favoritos"),
    ),
    span(() => `${state.val.saved.length} favoritos / 3 paisagens`),
    button(
      {
        onclick: () => {
          const u = URL.createObjectURL(
            new Blob([exportText(state.val)], {
              type: "text/plain;charset=utf-8",
            }),
          );
          const link = document.createElement("a");
          link.href = u;
          link.download = "estrato-caderno.txt";
          link.click();
          setTimeout(() => URL.revokeObjectURL(u), 1000);
        },
      },
      "Exportar caderno .txt ↓",
    ),
  ),
  () =>
    div(
      { class: "entry-list" },
      ...entries
        .filter((e) => !onlySaved.val || state.val.saved.includes(e.id))
        .map((e) =>
          div(
            { class: "entry" },
            a(
              {
                href: "#s" + (entries.indexOf(e) + 1),
                "aria-label": "Voltar à fotografia " + e.name,
              },
              van.tags.img({
                src: `${import.meta.env.BASE_URL}photos/${e.photo}.webp`,
                width: 240,
                height: 300,
                alt: "Recorte da paisagem " + e.name,
                loading: "lazy",
              }),
            ),
            div(
              h3(e.name),
              p(e.question),
              button(
                {
                  "aria-pressed": () => String(state.val.saved.includes(e.id)),
                  onclick: () => commit(toggle(state.val, e.id)),
                },
                () =>
                  state.val.saved.includes(e.id)
                    ? "✓ No seu recorte"
                    : "+ Guardar paisagem",
              ),
              label({ for: "note-" + e.id }, "Sua observação"),
              textarea({
                id: "note-" + e.id,
                maxlength: 800,
                rows: 3,
                value: state.val.notes[e.id] || "",
                placeholder: "Escreva um detalhe que chamou sua atenção…",
              }),
              button(
                {
                  class: "save-note",
                  onclick: () => {
                    const field = document.querySelector<HTMLTextAreaElement>(
                      "#note-" + e.id,
                    )!;
                    commit(note(state.val, e.id, field.value));
                    message.val = "Observação guardada neste navegador.";
                  },
                },
                "Guardar observação ↗",
              ),
            ),
          ),
        ),
      onlySaved.val && !state.val.saved.length
        ? p(
            { class: "empty" },
            "Nenhum favorito ainda. Volte a todos e guarde uma paisagem.",
          )
        : null,
    ),
  p({ class: "status", role: "status" }, () => message.val),
);
const motionButton = document.querySelector<HTMLButtonElement>("#motion")!,
  media = matchMedia("(prefers-reduced-motion: reduce)");
let context: gsap.Context | undefined;
function motion() {
  context?.revert();
  document.body.classList.toggle("quiet", state.val.reduced || media.matches);
  motionButton.setAttribute("aria-pressed", String(state.val.reduced));
  motionButton.textContent = media.matches
    ? "Movimento reduzido do sistema"
    : state.val.reduced
      ? "Ativar movimento"
      : "Reduzir movimento";
  if (state.val.reduced || media.matches) return;
  context = gsap.context(() => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".opening",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      })
      .fromTo(
        ".photo-shell",
        { clipPath: "inset(14% 32% 14% 32% round 35vh)", scale: 1.18 },
        {
          clipPath: "inset(0% 0% 0% 0% round 0vh)",
          scale: 1,
          duration: 1,
          ease: "none",
        },
        0,
      )
      .to(
        ".opening h1 span:first-child",
        { xPercent: -18, opacity: 0.12, duration: 0.7 },
        0.12,
      )
      .to(
        ".opening h1 span:last-child",
        { xPercent: 18, opacity: 0.12, duration: 0.7 },
        0.12,
      )
      .to(
        ".crosshair",
        { rotation: 180, scale: 2.5, opacity: 0, duration: 0.9 },
        0,
      );
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".wall",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 0.8,
        },
      })
      .fromTo(
        ".wall-photo",
        {
          clipPath: "polygon(0 18%,100% 0,100% 82%,0 100%)",
          yPercent: 15,
          rotation: -7,
        },
        {
          clipPath: "polygon(0 0,100% 0,100% 100%,0 100%)",
          yPercent: -7,
          rotation: 0,
          ease: "none",
        },
        0,
      )
      .fromTo(".wall-copy h2", { y: 100 }, { y: -35, ease: "none" }, 0);
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".horizon",
          start: "top bottom",
          end: "bottom bottom",
          scrub: 1,
        },
      })
      .fromTo(
        ".horizon-photo",
        { scale: 1.5, rotationX: 18, clipPath: "inset(20% 8% 20% 8%)" },
        {
          scale: 1,
          rotationX: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
        },
        0,
      )
      .fromTo(
        ".horizon-title",
        { yPercent: 25 },
        { yPercent: -8, ease: "none" },
        0,
      );
  });
}
motionButton.onclick = () => {
  commit({ ...state.val, reduced: !state.val.reduced });
  motion();
};
media.addEventListener("change", motion);
motion();
const dialog = document.querySelector<HTMLDialogElement>("#credits-dialog")!;
document
  .querySelector("#credits")!
  .addEventListener("click", () => dialog.showModal());
dialog.querySelector(".close")!.addEventListener("click", () => dialog.close());
const observer = new IntersectionObserver(
  (items) => {
    for (const item of items)
      if (item.isIntersecting) {
        document
          .querySelectorAll(".chapter-nav a")
          .forEach((a) =>
            a.setAttribute(
              "aria-current",
              a.getAttribute("href") === "#" + item.target.id
                ? "location"
                : "false",
            ),
          );
      }
  },
  { rootMargin: "-35% 0px -35% 0px" },
);
document
  .querySelectorAll(".chapter,.reading")
  .forEach((e) => observer.observe(e));
