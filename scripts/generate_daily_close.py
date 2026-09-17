#!/usr/bin/env python3
"""Genera o completa el cierre diario multilingüe sin duplicarlo."""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

LANGUAGES = ("es", "en", "pt", "fr")
OPTION_IDS = ("gratitud", "dificultad", "preocupacion", "paz", "cansancio", "fe")
TZ = ZoneInfo("America/Lima")

# Modelo principal + respaldo
MODELS = (
    "gemini-3.6-flash",
    "gemini-3-flash-preview",
)


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

    if not isinstance(document, dict):
        raise ValueError(f"Plantilla inválida en {path}")

    if not isinstance(document.get("reflections"), list):
        raise ValueError(f"reflections debe ser una lista en {path}")

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


def localized_complete(value: object) -> bool:
    return (
        isinstance(value, dict)
        and set(value.keys()) == set(LANGUAGES)
        and all(
            isinstance(value.get(lang), str) and value[lang].strip()
            for lang in LANGUAGES
        )
    )


def reflection_complete(reflection: dict) -> bool:
    if not isinstance(reflection, dict):
        return False

    if not localized_complete(reflection.get("question")):
        return False

    options = reflection.get("options")
    if not isinstance(options, list) or len(options) != 6:
        return False

    ids = tuple(
        o.get("id") if isinstance(o, dict) else None
        for o in options
    )
    if ids != OPTION_IDS:
        return False

    for option in options:
        for field in (
            "label",
            "responseTitle",
            "responseText",
            "reflectionHeader",
            "reflection",
        ):
            if not localized_complete(option.get(field)):
                return False

        verses = option.get("verses")
        if (
            not isinstance(verses, list)
            or len(verses) != 1
            or not isinstance(verses[0], str)
            or not verses[0].strip()
        ):
            return False

    return True


def recent_history(document: dict) -> list[dict]:
    history = []

    for item in document.get("reflections", [])[-14:]:
        if not isinstance(item, dict):
            continue

        history.append(
            {
                "date": item.get("date"),
                "question": item.get("question"),
                "verses": [
                    verse
                    for option in item.get("options", [])
                    if isinstance(option, dict)
                    for verse in option.get("verses", [])
                    if isinstance(verse, str)
                ],
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
Genera un único cierre diario cristiano para la fecha {date}.

Devuelve SOLO JSON válido.
No uses Markdown.
No agregues campos.
No cambies la plantilla.

Debe contener el mismo cierre en:
- español: es
- inglés: en
- portugués: pt
- francés: fr

Cada texto localizado debe contener exactamente:
es, en, pt, fr.

Usa exactamente estas 6 opciones y en este orden:
{json.dumps(OPTION_IDS, ensure_ascii=False)}

Tono:
- tranquilo
- pastoral
- esperanzador
- bíblico
- apropiado para antes de dormir

En "verses":
- usa exactamente una referencia bíblica real;
- no copies el texto completo del versículo;
- usa el nombre del libro en español.

Estructura exacta:

{{
  "question": {{
    "es": "...",
    "en": "...",
    "pt": "...",
    "fr": "..."
  }},
  "options": [
    {{
      "id": "gratitud",
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
      "verses": ["Salmos 1:1"],
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

Incluye las 6 opciones completas.

Historial reciente para evitar repeticiones:
{json.dumps(history, ensure_ascii=False)}
""".strip()


def prompt_complete_existing(existing: dict) -> str:
    return f"""
Completa las traducciones faltantes de este cierre diario cristiano.

REGLAS OBLIGATORIAS:
- NO crees otro cierre.
- NO cambies ningún texto en español.
- NO cambies date.
- NO cambies status.
- NO cambies generatedBy.
- NO cambies IDs.
- NO cambies verses.
- Conserva exactamente todo lo que ya existe.
- Solo completa inglés, portugués y francés.
- Cada texto localizado debe quedar con exactamente es, en, pt y fr.
- Devuelve SOLO el objeto JSON completo.
- No uses Markdown.

Cierre existente:
{json.dumps(existing, ensure_ascii=False)}
""".strip()


def request_model(model: str, prompt: str) -> dict:
    key = api_key()
    encoded_model = urllib.parse.quote(model, safe="-._")
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{encoded_model}:generateContent"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.6,
            "responseMimeType": "application/json",
        },
    }

    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": key,
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(
            f"{model} HTTP {exc.code}: {detail[:1200]}"
        ) from exc

    try:
        text = body["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise RuntimeError(
            f"{model} no devolvió el JSON esperado"
        ) from exc


def call_gemini(prompt: str) -> dict:
    errors = []

    for model in MODELS:
        print(f"Gemini: intentando {model}...")

        try:
            result = request_model(model, prompt)
            print(f"Gemini: generación correcta con {model}")
            return result
        except Exception as exc:
            errors.append(f"{model}: {exc}")
            print(f"Gemini: {model} falló. Probando respaldo...")

    raise RuntimeError(
        "Todos los modelos Gemini fallaron:\n" + "\n".join(errors)
    )


def validate_localized(value: object, name: str) -> None:
    if not localized_complete(value):
        raise ValueError(
            f"{name} debe contener exactamente es/en/pt/fr"
        )


def validate_content(data: dict) -> None:
    if not isinstance(data, dict):
        raise ValueError("La IA no devolvió un objeto JSON")

    if set(data.keys()) != {"question", "options"}:
        raise ValueError("La IA cambió la plantilla raíz")

    validate_localized(data["question"], "question")

    options = data["options"]

    if not isinstance(options, list) or len(options) != 6:
        raise ValueError("Deben existir exactamente 6 opciones")

    ids = tuple(
        o.get("id") if isinstance(o, dict) else None
        for o in options
    )

    if ids != OPTION_IDS:
        raise ValueError(f"IDs u orden incorrectos: {ids}")

    expected = {
        "id",
        "label",
        "responseTitle",
        "responseText",
        "verses",
        "reflectionHeader",
        "reflection",
    }

    for option in options:
        if not isinstance(option, dict):
            raise ValueError("Cada opción debe ser un objeto")

        if set(option.keys()) != expected:
            raise ValueError(
                f"La IA cambió la plantilla de {option.get('id')}"
            )

        for field in (
            "label",
            "responseTitle",
            "responseText",
            "reflectionHeader",
            "reflection",
        ):
            validate_localized(
                option[field],
                f"{option['id']}.{field}"
            )

        verses = option["verses"]

        if (
            not isinstance(verses, list)
            or len(verses) != 1
            or not isinstance(verses[0], str)
            or not verses[0].strip()
        ):
            raise ValueError(
                f"{option['id']}.verses debe contener una referencia"
            )


def validate_completion(original: dict, completed: dict) -> None:
    required = {
        "date",
        "status",
        "generatedBy",
        "question",
        "options",
    }

    if not isinstance(completed, dict):
        raise ValueError("La IA no devolvió el cierre completo")

    if set(completed.keys()) != required:
        raise ValueError(
            "La IA cambió la plantilla del cierre existente"
        )

    for key in ("date", "status", "generatedBy"):
        if completed.get(key) != original.get(key):
            raise ValueError(f"La IA cambió {key}")

    validate_content(
        {
            "question": completed["question"],
            "options": completed["options"],
        }
    )

    if (
        completed["question"]["es"]
        != original.get("question", {}).get("es")
    ):
        raise ValueError("La IA cambió question.es")

    original_options = original.get("options", [])

    if len(original_options) != len(completed["options"]):
        raise ValueError("La IA cambió la cantidad de opciones")

    for i, option in enumerate(completed["options"]):
        old = original_options[i]

        if option["id"] != old.get("id"):
            raise ValueError("La IA cambió un ID")

        if option["verses"] != old.get("verses"):
            raise ValueError("La IA cambió un versículo")

        for field in (
            "label",
            "responseTitle",
            "responseText",
            "reflectionHeader",
            "reflection",
        ):
            if (
                option[field]["es"]
                != old.get(field, {}).get("es")
            ):
                raise ValueError(
                    f"La IA cambió {option['id']}.{field}.es"
                )


def replace_today(
    document: dict,
    reflection: dict,
    date: str,
) -> None:
    for i, item in enumerate(document.get("reflections", [])):
        if isinstance(item, dict) and item.get("date") == date:
            document["reflections"][i] = deepcopy(reflection)
            document["updatedAt"] = date
            return

    document["reflections"].append(deepcopy(reflection))
    document["updatedAt"] = date


def main() -> None:
    date = today()
    documents = {
        lang: load_document(lang)
        for lang in LANGUAGES
    }

    existing = None

    for document in documents.values():
        found = find_today(document, date)

        if found is not None:
            existing = found
            break

    if existing is not None:
        if reflection_complete(existing):
            reflection = existing
            print(
                f"{date}: el cierre ya existe completo. "
                "No se usa Gemini."
            )
        else:
            print(
                f"{date}: el cierre ya existe pero faltan traducciones. "
                "Se conserva el español y solo se completan idiomas."
            )

            reflection = call_gemini(
                prompt_complete_existing(existing)
            )

            validate_completion(existing, reflection)

        for lang, document in documents.items():
            replace_today(
                document,
                reflection,
                date,
            )

            save_document(lang, document)

            print(
                f"{lang}: cierre {date} sincronizado."
            )

        return

    generated = call_gemini(
        prompt_generate(
            date,
            recent_history(documents["es"]),
        )
    )

    validate_content(generated)

    reflection = {
        "date": date,
        "status": "published",
        "generatedBy": "gemini",
        "question": generated["question"],
        "options": generated["options"],
    }

    for lang, document in documents.items():
        replace_today(
            document,
            reflection,
            date,
        )

        save_document(lang, document)

        print(
            f"{lang}: cierre {date} generado y guardado."
        )


if __name__ == "__main__":
    main()
