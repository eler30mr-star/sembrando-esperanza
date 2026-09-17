#!/usr/bin/env python3
"""Genera el cierre diario completo con Gemini, sin usar opciones prefijadas como contenido."""

from __future__ import annotations

import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

LANGUAGES = ("es", "en", "pt", "fr")
TZ = ZoneInfo("America/Lima")

# Incrementar cuando cambie de forma importante la lógica de generación.
GENERATOR_VERSION = 2

# Principal + respaldo
MODELS = (
    "gemini-3.6-flash",
    "gemini-3-flash-preview",
)

# Límites pensados para que las opciones entren bien en los botones.
MAX_QUESTION_CHARS = 100
MAX_LABEL_CHARS = 24
MAX_RESPONSE_TITLE_CHARS = 48
MAX_REFLECTION_HEADER_CHARS = 48


def today() -> str:
    return datetime.now(TZ).strftime("%Y-%m-%d")


def json_path(lang: str) -> Path:
    return Path(f"public/data/{lang}/daily-close/index.json")


def empty_document() -> dict:
    return {"version": 1, "updatedAt": "", "reflections": []}


def load_document(lang: str) -> dict:
    path = json_path(lang)

    if not path.exists():
        return empty_document()

    with path.open("r", encoding="utf-8") as f:
        document = json.load(f)

    if not isinstance(document, dict) or not isinstance(document.get("reflections"), list):
        raise ValueError(f"JSON inválido en {path}")

    document.setdefault("version", 1)
    document.setdefault("updatedAt", "")
    return document


def save_document(lang: str, document: dict) -> None:
    path = json_path(lang)
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("w", encoding="utf-8") as f:
        json.dump(document, f, ensure_ascii=False, indent=2)
        f.write("\n")


def find_today(document: dict, date: str) -> dict | None:
    for item in document.get("reflections", []):
        if isinstance(item, dict) and item.get("date") == date:
            return item
    return None


def recent_history(document: dict) -> list[dict]:
    history = []

    for item in document.get("reflections", [])[-14:]:
        if not isinstance(item, dict):
            continue

        if item.get("generatedBy") == "manual_seed":
            continue

        labels = []
        verses = []

        for option in item.get("options", []):
            if not isinstance(option, dict):
                continue

            label = option.get("label")
            if isinstance(label, dict):
                es_label = label.get("es")
                if isinstance(es_label, str) and es_label.strip():
                    labels.append(es_label.strip())

            for verse in option.get("verses", []):
                if isinstance(verse, str) and verse.strip():
                    verses.append(verse.strip())

        history.append(
            {
                "date": item.get("date"),
                "question": item.get("question"),
                "labels_es": labels,
                "verses": verses,
            }
        )

    return history


def api_key() -> str:
    key = os.environ.get("GEMINI_API_KEY", "").strip()

    if not key:
        raise RuntimeError("Falta GEMINI_API_KEY en GitHub Secrets")

    return key


def prompt_generate(date: str, history: list[dict]) -> str:
    return f"""
Genera un cierre diario cristiano COMPLETAMENTE NUEVO para la fecha {date}.

REGLA PRINCIPAL:
TÚ debes crear desde cero:
1. la pregunta principal;
2. las seis opciones de respuesta;
3. el tema de cada opción;
4. el texto visible de cada opción;
5. el título de respuesta;
6. el texto de respuesta;
7. la referencia bíblica;
8. el encabezado de reflexión;
9. la reflexión completa.

NO existen categorías predefinidas.
NO uses como plantilla fija palabras o temas como gratitud, dificultad, preocupación, paz, cansancio o fe.
Puedes usarlos solo si surgen naturalmente ese día, pero NO estás obligado a incluirlos.
Las seis opciones deben variar de un día a otro y responder de forma natural a la pregunta creada.

IMPORTANTE:
- Todo el contenido debe ser creado por IA desde cero.
- NO copies ni adaptes ninguna plantilla local.
- NO uses contenido manual_seed como base.
- NO repitas mecánicamente el contenido de días anteriores.
- Devuelve SOLO JSON válido.
- No uses Markdown.
- No agregues campos fuera de la estructura indicada.
- Deben existir exactamente 6 opciones.
- Cada opción debe representar una respuesta distinta y útil a la pregunta del día.

LONGITUD PARA LA INTERFAZ:
- "question": máximo {MAX_QUESTION_CHARS} caracteres por idioma.
- "label": MUY CORTO, de 1 a 4 palabras y máximo {MAX_LABEL_CHARS} caracteres por idioma.
  Este texto aparece dentro de un botón. Debe verse completo.
- "responseTitle": máximo {MAX_RESPONSE_TITLE_CHARS} caracteres por idioma.
- "reflectionHeader": máximo {MAX_REFLECTION_HEADER_CHARS} caracteres por idioma.
- "responseText" y "reflection" pueden ser más desarrollados, pero claros y naturales.

IDIOMAS:
Debe ser el mismo cierre diario localizado en:
español (es), inglés (en), portugués (pt) y francés (fr).

Cada texto localizado debe contener exactamente:
es, en, pt, fr.

IDs:
- Crea tú también un "id" distinto para cada opción.
- Debe ser un slug técnico corto en minúsculas, sin espacios, sin tildes y solo con letras, números o guion bajo.
- No reutilices una lista fija de IDs.
- Los 6 IDs deben ser únicos.

TONO:
- tranquilo;
- pastoral;
- cercano;
- esperanzador;
- bíblico;
- apropiado para cerrar el día;
- natural, no robótico.

VERSÍCULOS:
- exactamente una referencia bíblica real por opción;
- no copies el texto completo del versículo;
- usa el nombre del libro en español para que la app pueda abrirlo;
- el versículo debe relacionarse con esa opción específica.

ESTRUCTURA EXACTA:

{{
  "question": {{
    "es": "...",
    "en": "...",
    "pt": "...",
    "fr": "..."
  }},
  "options": [
    {{
      "id": "id_creado_por_la_ia",
      "label": {{
        "es": "...",
        "en": "...",
        "pt": "...",
        "fr": "..."
      }},
      "responseTitle": {{
        "es": "...",
        "en": "...",
        "pt": "...",
        "fr": "..."
      }},
      "responseText": {{
        "es": "...",
        "en": "...",
        "pt": "...",
        "fr": "..."
      }},
      "verses": ["Salmos 23:1"],
      "reflectionHeader": {{
        "es": "...",
        "en": "...",
        "pt": "...",
        "fr": "..."
      }},
      "reflection": {{
        "es": "...",
        "en": "...",
        "pt": "...",
        "fr": "..."
      }}
    }}
  ]
}}

Incluye exactamente seis opciones completas.

Historial reciente generado por IA, SOLO para evitar repetir preguntas, opciones y versículos:
{json.dumps(history, ensure_ascii=False)}
""".strip()


def request_model(model: str, prompt: str) -> dict:
    encoded_model = urllib.parse.quote(model, safe="-._")

    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{encoded_model}:generateContent"
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.95,
            "responseMimeType": "application/json",
        },
    }

    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key(),
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{model} HTTP {exc.code}: {detail[:1200]}") from exc

    try:
        text = body["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"{model} no devolvió el JSON esperado") from exc


def call_gemini(prompt: str) -> dict:
    failures = []

    for model in MODELS:
        print(f"Gemini: intentando {model}...")

        try:
            data = request_model(model, prompt)
            print(f"Gemini: generación correcta con {model}")
            return data
        except Exception as exc:
            failures.append(f"{model}: {exc}")
            print(f"Gemini: {model} falló; probando respaldo.")

    raise RuntimeError("Todos los modelos fallaron:\n" + "\n".join(failures))


def localized_complete(value: object) -> bool:
    return (
        isinstance(value, dict)
        and set(value.keys()) == set(LANGUAGES)
        and all(isinstance(value.get(lang), str) and value[lang].strip() for lang in LANGUAGES)
    )


def validate_max_length(field_name: str, value: dict, max_chars: int) -> None:
    for lang in LANGUAGES:
        text = value[lang].strip()
        if len(text) > max_chars:
            raise ValueError(
                f"{field_name}.{lang} supera {max_chars} caracteres: {len(text)}"
            )


def validate_generated(data: dict) -> None:
    if not isinstance(data, dict) or set(data.keys()) != {"question", "options"}:
        raise ValueError("Gemini cambió la estructura raíz")

    if not localized_complete(data["question"]):
        raise ValueError("question debe contener exactamente es/en/pt/fr")

    validate_max_length("question", data["question"], MAX_QUESTION_CHARS)

    options = data["options"]

    if not isinstance(options, list) or len(options) != 6:
        raise ValueError("Deben existir exactamente seis opciones")

    expected_keys = {
        "id",
        "label",
        "responseTitle",
        "responseText",
        "verses",
        "reflectionHeader",
        "reflection",
    }

    seen_ids = set()

    for option in options:
        if not isinstance(option, dict) or set(option.keys()) != expected_keys:
            raise ValueError("Estructura inválida en una opción")

        option_id = option.get("id")

        if (
            not isinstance(option_id, str)
            or not re.fullmatch(r"[a-z0-9_]{2,32}", option_id)
        ):
            raise ValueError(f"ID inválido: {option_id!r}")

        if option_id in seen_ids:
            raise ValueError(f"ID repetido: {option_id}")

        seen_ids.add(option_id)

        for field in (
            "label",
            "responseTitle",
            "responseText",
            "reflectionHeader",
            "reflection",
        ):
            if not localized_complete(option[field]):
                raise ValueError(
                    f"{option_id}.{field} debe contener exactamente es/en/pt/fr"
                )

        validate_max_length(
            f"{option_id}.label",
            option["label"],
            MAX_LABEL_CHARS,
        )
        validate_max_length(
            f"{option_id}.responseTitle",
            option["responseTitle"],
            MAX_RESPONSE_TITLE_CHARS,
        )
        validate_max_length(
            f"{option_id}.reflectionHeader",
            option["reflectionHeader"],
            MAX_REFLECTION_HEADER_CHARS,
        )

        verses = option["verses"]

        if (
            not isinstance(verses, list)
            or len(verses) != 1
            or not isinstance(verses[0], str)
            or not verses[0].strip()
        ):
            raise ValueError(f"{option_id}.verses debe tener una referencia")


def replace_today(document: dict, reflection: dict, date: str) -> None:
    for index, item in enumerate(document.get("reflections", [])):
        if isinstance(item, dict) and item.get("date") == date:
            document["reflections"][index] = deepcopy(reflection)
            document["updatedAt"] = date
            return

    document["reflections"].append(deepcopy(reflection))
    document["updatedAt"] = date


def is_current_ai_close(item: dict | None) -> bool:
    return (
        isinstance(item, dict)
        and item.get("generatedBy") == "gemini"
        and item.get("generatorVersion") == GENERATOR_VERSION
    )


def main() -> None:
    date = today()
    documents = {lang: load_document(lang) for lang in LANGUAGES}

    # Solo un cierre Gemini creado con la versión ACTUAL bloquea una nueva generación.
    existing_gemini = None

    for document in documents.values():
        existing = find_today(document, date)

        if is_current_ai_close(existing):
            existing_gemini = existing
            break

    if existing_gemini is not None:
        print(
            f"{date}: ya existe un cierre Gemini v{GENERATOR_VERSION}. "
            "No se genera nuevamente."
        )

        for lang, document in documents.items():
            current = find_today(document, date)

            if not is_current_ai_close(current):
                replace_today(document, existing_gemini, date)
                save_document(lang, document)
                print(f"{lang}: sincronizado desde el cierre Gemini existente.")

        return

    # manual_seed o cierres Gemini de una versión anterior NO bloquean la regeneración.
    print(
        f"{date}: no existe un cierre Gemini v{GENERATOR_VERSION}. "
        "Generando pregunta, opciones y contenido completamente nuevos."
    )

    generated = call_gemini(
        prompt_generate(
            date,
            recent_history(documents["es"]),
        )
    )

    validate_generated(generated)

    reflection = {
        "date": date,
        "status": "published",
        "generatedBy": "gemini",
        "generatorVersion": GENERATOR_VERSION,
        "question": generated["question"],
        "options": generated["options"],
    }

    for lang, document in documents.items():
        replace_today(document, reflection, date)
        save_document(lang, document)
        print(f"{lang}: cierre Gemini v{GENERATOR_VERSION} {date} guardado.")


if __name__ == "__main__":
    main()
