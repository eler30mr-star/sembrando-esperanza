#!/usr/bin/env python3
"""
Genera el cierre diario multilingüe para Sembrando Esperanza.

Reglas:
- Usa la fecha de America/Lima.
- Si el cierre de hoy ya existe, NO vuelve a llamar a Gemini.
- Si existe solo en alguno de los 4 idiomas, reutiliza ese mismo cierre y completa
  las rutas faltantes sin regenerar contenido.
- Genera un único cierre con es, en, pt y fr.
- Valida estrictamente la plantilla antes de guardar.
- Nunca borra reflexiones anteriores: solo agrega la del día actual.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from copy import deepcopy
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

LANGUAGES = ("es", "en", "pt", "fr")
OPTION_IDS = ("gratitud", "dificultad", "preocupacion", "paz", "cansancio", "fe")
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")
TZ = ZoneInfo("America/Lima")


def today() -> str:
    return datetime.now(TZ).strftime("%Y-%m-%d")


def json_path(lang: str) -> Path:
    return Path(f"public/data/{lang}/daily-close/index.json")


def empty_document() -> dict:
    return {
        "version": 1,
        "updatedAt": "",
        "reflections": []
    }


def load_document(lang: str) -> dict:
    path = json_path(lang)
    if not path.exists():
        return empty_document()

    with path.open("r", encoding="utf-8") as f:
        document = json.load(f)

    if not isinstance(document, dict):
        raise ValueError(f"Plantilla inválida en {path}: la raíz debe ser un objeto")

    reflections = document.get("reflections")
    if not isinstance(reflections, list):
        raise ValueError(f"Plantilla inválida en {path}: reflections debe ser una lista")

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


def prompt_for(date: str, history: list[dict]) -> str:
    return f"""
Genera el cierre diario cristiano para una app bíblica para la fecha {date}.

DEVUELVE SOLO JSON VÁLIDO.
NO uses Markdown.
NO agregues comentarios.
NO cambies la plantilla.
NO agregues campos adicionales.

Debe ser UN MISMO cierre diario disponible en 4 idiomas:
- español: es
- inglés: en
- portugués: pt
- francés: fr

Cada objeto de texto localizado debe contener EXACTAMENTE estas cuatro claves:
es, en, pt, fr

Las cuatro versiones deben expresar el mismo contenido, con redacción natural en cada idioma.

Usa exactamente 6 opciones, en este orden y con estos IDs inmutables:
{json.dumps(OPTION_IDS, ensure_ascii=False)}

Tono:
- tranquilo
- pastoral
- esperanzador
- bíblico
- apropiado para antes de dormir
- sin lenguaje exagerado
- sin afirmar revelaciones personales de Dios

En "verses" coloca SOLO una referencia bíblica real.
NO copies el texto completo del versículo.
Usa el nombre del libro en español dentro de "verses", porque la app utiliza esa referencia para abrir el pasaje.

Evita repetir literalmente preguntas, reflexiones o la misma combinación de versículos de los días recientes.

La respuesta debe tener EXACTAMENTE esta estructura:

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
Cada "reflection" debe tener aproximadamente entre 70 y 120 palabras por idioma.

Historial reciente, SOLO para evitar repeticiones:
{json.dumps(history, ensure_ascii=False)}
""".strip()


def call_gemini(prompt: str) -> dict:
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("Falta GEMINI_API_KEY en GitHub Secrets")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.8,
            "responseMimeType": "application/json"
        }
    }

    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": api_key,
        },
    )

    try:
        with urllib.request.urlopen(request, timeout=120) as response:
            body = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Gemini HTTP {exc.code}: {detail[:1500]}") from exc

    try:
        text = body["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)
    except (KeyError, IndexError, TypeError, json.JSONDecodeError) as exc:
        raise RuntimeError("Gemini no devolvió el JSON esperado") from exc


def validate_localized(value: object, name: str) -> None:
    if not isinstance(value, dict):
        raise ValueError(f"{name} debe ser un objeto")

    if set(value.keys()) != set(LANGUAGES):
        raise ValueError(f"{name} debe contener exactamente es/en/pt/fr")

    for lang in LANGUAGES:
        text = value.get(lang)
        if not isinstance(text, str) or not text.strip():
            raise ValueError(f"{name}.{lang} está vacío")


def validate_generated(data: dict) -> None:
    if not isinstance(data, dict):
        raise ValueError("La respuesta de la IA debe ser un objeto JSON")

    if set(data.keys()) != {"question", "options"}:
        raise ValueError("La IA cambió la plantilla raíz")

    validate_localized(data["question"], "question")

    options = data["options"]
    if not isinstance(options, list) or len(options) != 6:
        raise ValueError("Deben existir exactamente 6 opciones")

    received_ids = tuple(
        option.get("id") if isinstance(option, dict) else None
        for option in options
    )
    if received_ids != OPTION_IDS:
        raise ValueError(f"IDs u orden incorrectos: {received_ids}")

    expected_keys = {
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

        if set(option.keys()) != expected_keys:
            raise ValueError(f"La IA cambió la plantilla de {option.get('id')}")

        for field in (
            "label",
            "responseTitle",
            "responseText",
            "reflectionHeader",
            "reflection",
        ):
            validate_localized(option[field], f"{option['id']}.{field}")

        verses = option["verses"]
        if (
            not isinstance(verses, list)
            or len(verses) != 1
            or not isinstance(verses[0], str)
            or not verses[0].strip()
        ):
            raise ValueError(
                f"{option['id']}.verses debe contener exactamente una referencia"
            )


def append_if_missing(document: dict, reflection: dict, date: str) -> bool:
    if find_today(document, date):
        return False

    document["updatedAt"] = date
    document["reflections"].append(deepcopy(reflection))
    return True


def main() -> None:
    date = today()
    documents = {lang: load_document(lang) for lang in LANGUAGES}

    existing_reflection = None
    existing_langs = []

    for lang, document in documents.items():
        found = find_today(document, date)
        if found is not None:
            existing_langs.append(lang)
            if existing_reflection is None:
                existing_reflection = found

    # Si hoy ya fue generado en alguno de los idiomas, NO se llama a Gemini.
    # Solo se completa cualquier archivo faltante con el mismo cierre existente.
    if existing_reflection is not None:
        changed = False

        for lang, document in documents.items():
            if append_if_missing(document, existing_reflection, date):
                save_document(lang, document)
                changed = True
                print(f"{lang}: se completó el cierre existente de {date} sin usar IA.")

        if not changed:
            print(
                f"{date}: el cierre diario ya existe en los 4 idiomas. "
                "No se genera nuevamente."
            )
        return

    # No existe cierre para hoy: generar una sola vez.
    history_source = documents["es"]
    generated = call_gemini(prompt_for(date, recent_history(history_source)))
    validate_generated(generated)

    reflection = {
        "date": date,
        "status": "published",
        "generatedBy": "gemini",
        "question": generated["question"],
        "options": generated["options"],
    }

    for lang, document in documents.items():
        append_if_missing(document, reflection, date)
        save_document(lang, document)
        print(f"{lang}: cierre {date} generado y guardado correctamente.")


if __name__ == "__main__":
    main()
