#!/usr/bin/env python3
"""Genera el cierre diario con Gemini y nunca usa la plantilla local de la app como fuente."""

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

# Principal + respaldo
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

    if not isinstance(document, dict) or not isinstance(document.get("reflections"), list):
        raise ValueError(f"Plantilla JSON inválida en {path}")

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

        # manual_seed no se usa como inspiración ni como contenido fuente.
        if item.get("generatedBy") == "manual_seed":
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
Genera un cierre diario cristiano NUEVO para la fecha {date}.

IMPORTANTE:
- Este contenido debe ser creado por IA desde cero.
- NO copies ni adaptes ninguna plantilla local.
- NO uses contenido manual_seed como base.
- Devuelve SOLO JSON válido.
- No uses Markdown.
- No agregues campos.
- No cambies la estructura indicada.

Debe ser UN MISMO cierre diario en cuatro idiomas:
español (es), inglés (en), portugués (pt) y francés (fr).

Cada texto localizado debe contener exactamente las claves:
es, en, pt, fr.

Usa exactamente estas seis opciones, en este orden y con estos IDs:
{json.dumps(OPTION_IDS, ensure_ascii=False)}

El tono debe ser:
- tranquilo
- pastoral
- esperanzador
- bíblico
- apropiado para antes de dormir
- diferente de días anteriores

En "verses":
- usa exactamente una referencia bíblica real por opción;
- no copies el texto completo del versículo;
- usa el nombre del libro en español para que la app pueda abrirlo.

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

Incluye las seis opciones completas.

Historial reciente generado por IA, solo para evitar repeticiones:
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
            "temperature": 0.8,
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


def validate_generated(data: dict) -> None:
    if not isinstance(data, dict) or set(data.keys()) != {"question", "options"}:
        raise ValueError("Gemini cambió la plantilla raíz")

    if not localized_complete(data["question"]):
        raise ValueError("question debe contener exactamente es/en/pt/fr")

    options = data["options"]

    if not isinstance(options, list) or len(options) != 6:
        raise ValueError("Deben existir exactamente seis opciones")

    ids = tuple(
        option.get("id") if isinstance(option, dict) else None
        for option in options
    )

    if ids != OPTION_IDS:
        raise ValueError(f"IDs u orden incorrectos: {ids}")

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
        if not isinstance(option, dict) or set(option.keys()) != expected_keys:
            raise ValueError(f"Plantilla inválida en opción {option.get('id')}")

        for field in (
            "label",
            "responseTitle",
            "responseText",
            "reflectionHeader",
            "reflection",
        ):
            if not localized_complete(option[field]):
                raise ValueError(f"{option['id']}.{field} debe contener es/en/pt/fr")

        verses = option["verses"]

        if (
            not isinstance(verses, list)
            or len(verses) != 1
            or not isinstance(verses[0], str)
            or not verses[0].strip()
        ):
            raise ValueError(f"{option['id']}.verses debe tener una referencia")


def replace_today(document: dict, reflection: dict, date: str) -> None:
    for index, item in enumerate(document.get("reflections", [])):
        if isinstance(item, dict) and item.get("date") == date:
            document["reflections"][index] = deepcopy(reflection)
            document["updatedAt"] = date
            return

    document["reflections"].append(deepcopy(reflection))
    document["updatedAt"] = date


def main() -> None:
    date = today()
    documents = {lang: load_document(lang) for lang in LANGUAGES}

    # Solo un cierre generado realmente por IA bloquea una nueva generación.
    existing_gemini = None

    for document in documents.values():
        existing = find_today(document, date)

        if existing is not None and existing.get("generatedBy") == "gemini":
            existing_gemini = existing
            break

    if existing_gemini is not None:
        print(
            f"{date}: ya existe un cierre generado por Gemini. "
            "No se genera nuevamente."
        )

        # Sincroniza cualquier ruta que falte, sin llamar a Gemini.
        for lang, document in documents.items():
            current = find_today(document, date)

            if current is None or current.get("generatedBy") != "gemini":
                replace_today(document, existing_gemini, date)
                save_document(lang, document)
                print(f"{lang}: sincronizado desde el cierre Gemini existente.")

        return

    # Si solo existe manual_seed, NO se usa como fuente:
    # Gemini genera el cierre real y lo reemplaza en las cuatro rutas.
    print(
        f"{date}: no existe un cierre generado por Gemini. "
        "Generando uno nuevo desde cero."
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
        "question": generated["question"],
        "options": generated["options"],
    }

    for lang, document in documents.items():
        replace_today(document, reflection, date)
        save_document(lang, document)
        print(f"{lang}: cierre Gemini {date} guardado.")


if __name__ == "__main__":
    main()
