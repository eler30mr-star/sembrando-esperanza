import fs from "node:fs";
import path from "node:path";

const DAILY_CLOSE_PATH = path.join(
  process.cwd(),
  "public",
  "data",
  "es",
  "daily-close",
  "index.json"
);

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY;
const FORCE = process.env.FORCE_DAILY_CLOSE === "true";
const TODAY = process.env.DAILY_CLOSE_DATE || dateInLima();

if (!API_KEY) {
  throw new Error("Falta configurar el secret GEMINI_API_KEY en GitHub Actions.");
}

const feed = readFeed();
const reflections = Array.isArray(feed.reflections) ? feed.reflections : [];

if (!FORCE && reflections.some((item) => item?.date === TODAY && item?.status !== "draft")) {
  console.log(`El cierre diario ${TODAY} ya existe. No se genera otro.`);
  process.exit(0);
}

const generated = await generateDailyClose();
const reflection = normalizeReflection(generated);

const nextFeed = {
  version: Number(feed.version || 1),
  updatedAt: TODAY,
  reflections: [
    ...reflections.filter((item) => item?.date !== TODAY),
    reflection
  ]
};

fs.mkdirSync(path.dirname(DAILY_CLOSE_PATH), { recursive: true });
fs.writeFileSync(DAILY_CLOSE_PATH, `${JSON.stringify(nextFeed, null, 2)}\n`, "utf8");
console.log(`Cierre diario generado para ${TODAY}: ${DAILY_CLOSE_PATH}`);

function readFeed() {
  if (!fs.existsSync(DAILY_CLOSE_PATH)) {
    return { version: 1, updatedAt: TODAY, reflections: [] };
  }

  return JSON.parse(fs.readFileSync(DAILY_CLOSE_PATH, "utf8"));
}

async function generateDailyClose() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: buildPrompt()
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.8,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini respondio HTTP ${response.status}: ${errorText}`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini no devolvio texto JSON.");
  }

  return JSON.parse(stripCodeFence(text));
}

function buildPrompt() {
  return `
Genera un cierre diario cristiano en espanol para una app biblica.
La fecha del cierre debe ser ${TODAY}.

Devuelve SOLO JSON valido con esta estructura exacta:
{
  "date": "${TODAY}",
  "status": "published",
  "question": { "es": "..." },
  "options": [
    {
      "id": "gratitud",
      "label": { "es": "..." },
      "responseTitle": { "es": "..." },
      "responseText": { "es": "..." },
      "verses": ["Salmos 103:2"],
      "reflectionHeader": { "es": "..." },
      "reflection": { "es": "..." }
    }
  ]
}

Reglas:
- Deben existir exactamente 6 opciones.
- Usa estos ids, uno por opcion: gratitud, dificultad, preocupacion, paz, cansancio, fe.
- Cada opcion debe tener 1 versiculo biblico en formato "Libro capitulo:versiculo".
- La pregunta debe invitar a revisar el corazon antes de descansar.
- responseText debe ser pastoral y breve.
- reflection debe ser el texto completo principal, entre 65 y 110 palabras.
- No uses markdown, comentarios, comillas tipograficas ni texto fuera del JSON.
- No incluyas contenido doctrinal controversial; manten el tono cristiano devocional, esperanzador y respetuoso.
`.trim();
}

function normalizeReflection(value) {
  if (!value || typeof value !== "object") {
    throw new Error("El JSON generado no es un objeto.");
  }

  const options = Array.isArray(value.options) ? value.options.map(normalizeOption) : [];
  if (options.length !== 6) {
    throw new Error(`Se esperaban 6 opciones, Gemini devolvio ${options.length}.`);
  }

  const ids = new Set(options.map((option) => option.id));
  for (const id of ["gratitud", "dificultad", "preocupacion", "paz", "cansancio", "fe"]) {
    if (!ids.has(id)) {
      throw new Error(`Falta la opcion obligatoria: ${id}.`);
    }
  }

  return {
    date: TODAY,
    status: "published",
    question: localized(value.question),
    options
  };
}

function normalizeOption(option) {
  if (!option || typeof option !== "object") {
    throw new Error("Una opcion generada no es valida.");
  }

  const verses = Array.isArray(option.verses)
    ? option.verses.map((verse) => String(verse).trim()).filter(Boolean)
    : [];

  if (!option.id || verses.length === 0) {
    throw new Error(`Opcion incompleta: ${JSON.stringify(option)}`);
  }

  return {
    id: String(option.id).trim(),
    label: localized(option.label),
    responseTitle: localized(option.responseTitle),
    responseText: localized(option.responseText),
    verses: [verses[0]],
    reflectionHeader: localized(option.reflectionHeader),
    reflection: localized(option.reflection)
  };
}

function localized(value) {
  if (typeof value === "string") {
    return { es: value.trim() };
  }

  const text = value?.es;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error(`Texto localizado invalido: ${JSON.stringify(value)}`);
  }

  return { es: text.trim() };
}

function stripCodeFence(text) {
  return text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function dateInLima() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
