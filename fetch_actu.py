#!/usr/bin/env python3
"""
fetch_actu.py — Agrégation automatique d'actualités tech/cybersécurité + synthèse structurée unique via Google Gemini Flash.

Règle d'or :
- Charge d'abord ActuZip.json existant.
- Ne résume JAMAIS deux fois le même article (vérification par URL normalisée).
- Si un nouvel article est détecté et que GEMINI_API_KEY est définie, appelle Gemini Flash
  UNE SEULE FOIS pour générer {badge, contexte, quoi, pourquoi, consequence} en JSON,
  puis sauvegarde immédiatement ActuZip.json et public/ActuZip.json.

Sources fiables utilisées :
- IT-Connect (Cybersécurité, Web, Logiciel & OS, Matériel)
- ZDNet France (Cybersécurité, Informatique)
"""

from __future__ import annotations

import argparse
import email.utils
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 "
    "ActuZipBot/2.0"
)
TIMEOUT = 15
MAX_ARTICLES = 120
ALLOWED_BADGES = ("Alerte / Faille", "Mise à jour", "Actu / Tendance")
DEFAULT_GEMINI_MODELS = (
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-3.7-flash",
    "gemini-3.8-flash",
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
)

# Flux RSS fiables (sources + rubriques associées)
FEEDS: list[dict[str, Any]] = [
    # --- IT-Connect ---
    {
        "source": "IT-Connect",
        "url": "https://www.it-connect.fr/actualites/actu-securite/feed/",
        "forced_category": "Cybersécurité",
        "filter_categories": False,
    },
    {
        "source": "IT-Connect",
        "url": "https://www.it-connect.fr/actualites/actu-internet/feed/",
        "forced_category": "Web",
        "filter_categories": False,
    },
    {
        "source": "IT-Connect",
        "url": "https://www.it-connect.fr/actualites/actu-logiciel-os/feed/",
        "forced_category": "Logiciel & OS",
        "filter_categories": False,
    },
    {
        "source": "IT-Connect",
        "url": "https://www.it-connect.fr/actualites/actu-materiel/feed/",
        "forced_category": "Matériel",
        "filter_categories": False,
    },
    {
        "source": "IT-Connect",
        "url": "https://www.it-connect.fr/feed/",
        "forced_category": None,
        "filter_categories": True,
    },
    # --- ZDNet France ---
    {
        "source": "ZDNet France",
        "url": "https://www.zdnet.fr/feeds/rss/actualites/securite/",
        "forced_category": "Cybersécurité",
        "filter_categories": False,
    },
    {
        "source": "ZDNet France",
        "url": "https://www.zdnet.fr/feeds/rss/actualites/cybersecurite/",
        "forced_category": "Cybersécurité",
        "filter_categories": False,
    },
    {
        "source": "ZDNet France",
        "url": "https://www.zdnet.fr/feeds/rss/actualites/informatique/",
        "forced_category": "Informatique",
        "filter_categories": False,
    },
]

IT_CONNECT_CATEGORY_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("Cybersécurité", ("cybersécurité", "cybersecurite", "sécurité", "securite", "vulnérabilité", "malware", "ransomware")),
    ("Web", ("web", "internet", "navigateur", "chrome", "firefox", "edge")),
    ("Logiciel & OS", ("logiciel", "os", "windows", "linux", "macos", "debian", "ubuntu", "android", "ios")),
    ("Matériel", ("matériel", "materiel", "hardware", "processeur", "cpu", "gpu", "ssd", "serveur")),
]

TAG_RE = re.compile(r"<[^>]+>")
WHITESPACE_RE = re.compile(r"\s+")
ITCONNECT_TAIL_RE = re.compile(
    r"\s*(?:(?:L['’]article|Le post)\s+.+?\s+(?:est apparu en premier|a été publié)\s+sur\s+IT-Connect\s*\.?|The post\s+.+?\s+appeared first on.+?)\s*$",
    re.IGNORECASE,
)


def clean_html_text(raw: str | None) -> str:
    """Supprime les balises HTML, décode les entités et nettoie le chapô d'origine."""
    if not raw:
        return ""
    text = html.unescape(raw)
    text = TAG_RE.sub(" ", text)
    text = html.unescape(text)
    text = ITCONNECT_TAIL_RE.sub("", text)
    text = text.replace("[…]", "…").replace("[...]", "…")
    text = WHITESPACE_RE.sub(" ", text).strip()
    if len(text) > 360:
        text = text[:357].rsplit(" ", 1)[0].rstrip(" ,;:-") + "…"
    return text


def parse_pubdate(raw: str | None) -> datetime | None:
    """Parse une date RSS (RFC 2822 ou ISO 8601) en datetime UTC."""
    if not raw:
        return None
    raw = raw.strip()
    try:
        dt = email.utils.parsedate_to_datetime(raw)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        pass
    try:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    except Exception:
        return None


def match_it_connect_category(raw_categories: list[str]) -> str | None:
    joined = " | ".join(c.lower() for c in raw_categories)
    for normalized, keywords in IT_CONNECT_CATEGORY_RULES:
        if any(kw in joined for kw in keywords):
            return normalized
    return None


def normalize_link(link: str) -> str:
    return link.strip().split("?")[0].split("#")[0].rstrip("/").lower()


def is_valid_ai_summary(summary: Any) -> bool:
    """Vérifie qu'une analyse IA complète générée par Gemini (badge + 4 champs) est déjà sauvegardée."""
    if not isinstance(summary, dict):
        return False
    if summary.get("generated_by") == "preview":
        return False
    if summary.get("badge") not in ALLOWED_BADGES:
        return False
    return all(
        isinstance(summary.get(k), str) and len(summary[k].strip()) >= 8
        for k in ("contexte", "quoi", "pourquoi", "consequence")
    )


def load_existing_articles(json_path: Path) -> dict[str, dict[str, Any]]:
    """Charge ActuZip.json existant et indexe les articles par URL normalisée."""
    if not json_path.exists():
        return {}
    try:
        data = json.loads(json_path.read_text(encoding="utf-8"))
        articles = data.get("articles", [])
        indexed: dict[str, dict[str, Any]] = {}
        for art in articles:
            link = art.get("link")
            if isinstance(link, str) and link.strip():
                indexed[normalize_link(link)] = art
        print(f"[CACHE] {len(indexed)} articles chargés depuis {json_path.name}")
        return indexed
    except Exception as exc:
        print(f"[WARN] Impossible de lire {json_path} : {exc}", file=sys.stderr)
        return {}


def save_payload(root_dir: Path, by_link: dict[str, dict[str, Any]]) -> None:
    """Trie du plus récent au plus ancien et enregistre ActuZip.json + public/ActuZip.json."""
    articles = sorted(
        by_link.values(),
        key=lambda a: a.get("published_ts", 0),
        reverse=True,
    )[:MAX_ARTICLES]

    payload = {
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "total": len(articles),
        "sources": sorted({a["source"] for a in articles}),
        "categories": sorted({a["category"] for a in articles}),
        "articles": articles,
    }

    serialized = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    for target in (root_dir / "ActuZip.json", root_dir / "public" / "ActuZip.json"):
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(serialized, encoding="utf-8")


def fetch_xml(url: str) -> ET.Element | None:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
            data = resp.read()
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        print(f"[WARN] Impossible de lire {url} : {exc}", file=sys.stderr)
        return None

    head = data[:300].lstrip().lower()
    if head.startswith(b"<!doctype html") or head.startswith(b"<html"):
        print(f"[INFO] Flux ignoré (réponse HTML) : {url}")
        return None

    try:
        return ET.fromstring(data)
    except ET.ParseError as exc:
        print(f"[WARN] XML invalide pour {url} : {exc}", file=sys.stderr)
        return None


def collect_rss_articles(existing_by_link: dict[str, dict[str, Any]]) -> tuple[dict[str, dict[str, Any]], list[str]]:
    """Fusionne les articles RSS récents avec le cache existant sans écraser les analyses existantes."""
    merged: dict[str, dict[str, Any]] = dict(existing_by_link)
    seen_titles: set[str] = {
        re.sub(r"[^a-z0-9]+", "", a.get("title", "").lower())
        for a in existing_by_link.values()
    }
    newly_added_keys: list[str] = []

    for feed in FEEDS:
        root = fetch_xml(feed["url"])
        if root is None:
            continue

        added_here = 0
        for item in root.findall(".//item"):
            title = clean_html_text(item.findtext("title"))
            link = (item.findtext("link") or "").strip()
            if not title or not link:
                continue

            norm_link = normalize_link(link)

            # RÈGLE D'OR : si l'article existe déjà dans ActuZip.json, on le conserve tel quel
            if norm_link in merged:
                continue

            norm_title = re.sub(r"[^a-z0-9]+", "", title.lower())
            if norm_title in seen_titles:
                continue

            raw_cats = [
                clean_html_text(cat.text)
                for cat in item.findall("category")
                if cat.text and cat.text.strip()
            ]

            category = feed["forced_category"]
            if feed["filter_categories"]:
                category = match_it_connect_category(raw_cats)
                if not category:
                    continue

            if any(c.lower() in ("publicité", "guide d'achat") for c in raw_cats):
                continue

            pub_dt = parse_pubdate(item.findtext("pubDate"))
            if pub_dt is None:
                continue

            desc = clean_html_text(item.findtext("description"))
            if not desc:
                desc = "Consultez l'article original sur le site source pour plus de détails."

            seen_titles.add(norm_title)
            merged[norm_link] = {
                "id": f"art-{abs(hash(norm_link)) % 10_000_000}",
                "title": title,
                "description": desc,
                "link": link,
                "source": feed["source"],
                "category": category or "Informatique",
                "tags": raw_cats[:4],
                "published_at": pub_dt.isoformat(),
                "published_ts": int(pub_dt.timestamp()),
            }
            newly_added_keys.append(norm_link)
            added_here += 1

        print(f"[RSS] {feed['source']} ({feed['forced_category'] or 'général'}) : +{added_here} nouveaux")

    return merged, newly_added_keys


def create_gemini_client(api_key: str):
    """Initialise le client google-genai avec timeout court et sans retries bloquants."""
    from google import genai
    from google.genai import types

    try:
        http_opts = types.HttpOptions(
            timeout=25_000,
            retry_options=types.HttpRetryOptions(attempts=1),
        )
        return genai.Client(api_key=api_key, http_options=http_opts)
    except Exception:
        return genai.Client(api_key=api_key)


def extract_article_excerpt(url: str, fallback_desc: str) -> str:
    """Tente de récupérer un extrait plus riche de l'article source pour aider Gemini à détailler sans inventer."""
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8"},
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            raw = resp.read(160_000).decode("utf-8", errors="ignore")
    except Exception:
        return fallback_desc

    # Supprime scripts/styles et récupère les paragraphes principaux
    cleaned = re.sub(r"<(script|style|noscript|nav|header|footer)[^>]*>[\s\S]*?</\1>", " ", raw, flags=re.IGNORECASE)
    paragraphs = re.findall(r"<p[^>]*>([\s\S]*?)</p>", cleaned, flags=re.IGNORECASE)
    parts: list[str] = []
    total_len = 0
    for p in paragraphs:
        txt = WHITESPACE_RE.sub(" ", html.unescape(TAG_RE.sub(" ", p))).strip()
        if len(txt) < 55:
            continue
        if any(skip in txt.lower() for skip in ("cookies", "politique de confidentialité", "abonnez-vous", "newsletter")):
            continue
        parts.append(txt)
        total_len += len(txt)
        if total_len >= 2200:
            break

    if not parts:
        return fallback_desc
    return "\n".join(parts)[:2400]


def resolve_gemini_models(client: Any) -> list[str]:
    """Construit la liste des modèles Flash/Gemma candidats (exclut omni/image/audio/tts)."""
    models: list[str] = list(DEFAULT_GEMINI_MODELS)
    try:
        discovered: list[str] = []
        for m in client.models.list():
            name = (getattr(m, "name", "") or "").replace("models/", "")
            low = name.lower()
            methods = getattr(m, "supported_actions", None) or getattr(m, "supported_generation_methods", None) or []
            if any(bad in low for bad in ("image", "audio", "tts", "omni", "embedding", "veo", "imagen", "robotics", "computer-use")):
                continue
            if "flash" in low or "gemma-3" in low:
                if not methods or any("generateContent" in str(act) for act in methods):
                    discovered.append(name)
        discovered.sort(reverse=True)
        for name in discovered:
            if name not in models:
                models.append(name)
    except Exception as exc:
        print(f"[WARN] list() modèles impossible : {exc}", flush=True)
    print(f"[IA] Modèles candidats ({len(models)}) : {models[:12]}", flush=True)
    return models


def pick_working_model(client: Any, models: list[str], skip: set[str] | None = None) -> str | None:
    """Teste rapidement chaque candidat pour trouver le premier modèle autorisé sur le Free Tier."""
    skip = skip or set()
    for name in models:
        if name in skip:
            continue
        try:
            resp = client.models.generate_content(
                model=name,
                contents="Réponds simplement OK.",
            )
            if (resp.text or "").strip():
                print(f"[IA] Modèle actif sélectionné : {name}", flush=True)
                return name
        except Exception as exc:
            short = str(exc).replace("\n", " ")[:160]
            print(f"[IA] Candidat ignoré ({name}) : {short}", flush=True)
    return None


def summarize_with_gemini(client: Any, article: dict[str, Any], model_name: str) -> dict[str, str] | None:
    """Appelle Google Gemini/Gemma une seule fois pour produire une analyse pédagogique détaillée en JSON."""
    from google.genai import types

    article_excerpt = extract_article_excerpt(article["link"], article["description"])

    prompt = (
        "Tu es un formateur et analyste de veille technologique (réseaux, systèmes, cybersécurité, informatique) "
        "qui s'adresse aussi bien à des étudiants/techniciens IT qu'à des lecteurs curieux. "
        "Rédige une analyse pédagogique, claire, complète et structurée en français, uniquement à partir des informations fournies "
        "(sans inventer de faits ou de chiffres absents de la source).\n\n"
        f"Source : {article['source']}\n"
        f"Catégorie : {article['category']}\n"
        f"Titre : {article['title']}\n"
        f"Chapô : {article['description']}\n"
        f"Extrait de l'article :\n{article_excerpt}\n\n"
        "Retourne UNIQUEMENT un objet JSON valide (sans texte autour ni balises markdown) avec exactement ces 5 clés "
        "(vise 2 à 4 phrases riches et bien expliquées par champ) :\n"
        '- "badge" : UNIQUEMENT l\'une de ces 3 valeurs exactes : "Alerte / Faille", "Mise à jour" ou "Actu / Tendance".\n'
        '- "contexte" : pose clairement le décor de l\'actualité ET vulgarise simplement les termes techniques, protocoles, outils ou sigles mentionnés pour que n\'importe quel lecteur comprenne de quoi on parle.\n'
        '- "quoi" : détaille précisément ce qui s\'est passé, ce qui a été annoncé, corrigé, comparé ou découvert (fonctionnalités, mécanisme ou faits clés).\n'
        '- "pourquoi" : développe les acteurs impliqués (éditeurs, chercheurs, attaquants, régulateurs, communauté…) ainsi que les raisons techniques, stratégiques, économiques ou sécuritaires qui ont mené à cette actualité.\n'
        '- "consequence" : détaille les impacts concrets selon plusieurs points de vue (utilisateurs finaux, administrateurs systèmes/réseaux, entreprises ou éditeurs), en faisant le lien avec le contexte et les acteurs évoqués dans Pourquoi.'
    )

    schema = types.Schema(
        type=types.Type.OBJECT,
        required=["badge", "contexte", "quoi", "pourquoi", "consequence"],
        properties={
            "badge": types.Schema(type=types.Type.STRING, enum=list(ALLOWED_BADGES)),
            "contexte": types.Schema(type=types.Type.STRING),
            "quoi": types.Schema(type=types.Type.STRING),
            "pourquoi": types.Schema(type=types.Type.STRING),
            "consequence": types.Schema(type=types.Type.STRING),
        },
    )

    is_gemma = "gemma" in model_name.lower()
    config = (
        types.GenerateContentConfig(temperature=0.2)
        if is_gemma
        else types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.2,
        )
    )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config,
        )
        raw_text = (response.text or "").strip()
        if raw_text.startswith("```"):
            raw_text = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text, flags=re.IGNORECASE).strip()
        # Si le modèle a ajouté du texte avant/après l'accolade JSON, on isole l'objet JSON
        start_brace = raw_text.find("{")
        end_brace = raw_text.rfind("}")
        if start_brace != -1 and end_brace > start_brace:
            raw_text = raw_text[start_brace : end_brace + 1]
        parsed = json.loads(raw_text)
        if is_valid_ai_summary(parsed):
            return {
                "badge": parsed["badge"],
                "contexte": parsed["contexte"].strip(),
                "quoi": parsed["quoi"].strip(),
                "pourquoi": parsed["pourquoi"].strip(),
                "consequence": parsed["consequence"].strip(),
                "generated_by": "gemini",
            }
    except Exception as exc:
        err_msg = str(exc)
        if "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
            raise RuntimeError(f"QUOTA_EXCEEDED: {exc}") from exc
        print(f"[WARN] Échec analyse ({model_name}) pour '{article['title'][:50]}' : {err_msg[:220]}", file=sys.stderr, flush=True)

    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="Met à jour ActuZip.json avec résumés uniques Gemini Flash.")
    parser.add_argument(
        "--max-ai",
        type=int,
        default=40,
        help="Nombre maximum d'articles à analyser par exécution (défaut : 40 ; tout l'historique est complété progressivement).",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=3.0,
        help="Pause en secondes entre deux appels API Gemini (défaut : 3.0s pour respecter le Free Tier).",
    )
    args = parser.parse_args()

    root_dir = Path(__file__).resolve().parent
    json_path = root_dir / "ActuZip.json"

    # 1. Charger le cache existant
    existing = load_existing_articles(json_path)

    # 2. Récupérer les flux RSS et ne garder que les nouveaux (sans écraser les anciens)
    merged, newly_added = collect_rss_articles(existing)
    if not merged:
        print("[ERREUR] Aucun article disponible.", file=sys.stderr)
        return 1

    # Sauvegarde initiale des éventuels nouveaux articles RSS
    save_payload(root_dir, merged)

    # 3. Identifier uniquement les articles les plus récents qui n'ont PAS ENCORE d'analyse IA valide
    sorted_keys = [
        normalize_link(a["link"])
        for a in sorted(merged.values(), key=lambda x: x.get("published_ts", 0), reverse=True)[:MAX_ARTICLES]
    ]
    to_analyze = [k for k in sorted_keys if not is_valid_ai_summary(merged[k].get("ai_summary"))]

    print(
        f"[STAT] Total conservé : {len(sorted_keys)} | Nouveaux RSS : {len(newly_added)} "
        f"| Déjà analysés (0 appel API) : {len(sorted_keys) - len(to_analyze)} "
        f"| À analyser : {len(to_analyze)}"
    )

    if not to_analyze:
        print("[OK] Tous les articles disposent déjà de leur analyse permanente. Aucun appel API effectué.")
        return 0

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        print(
            "[INFO] Variable d'environnement GEMINI_API_KEY absente : les articles ont été sauvegardés sans nouvel appel IA.\n"
            "       Définissez GEMINI_API_KEY puis relancez `python fetch_actu.py` pour générer les analyses.",
            file=sys.stderr,
        )
        return 0

    try:
        client = create_gemini_client(api_key)
    except ImportError:
        print("[ERREUR] Bibliothèque 'google-genai' manquante. Installez-la avec : pip install google-genai", file=sys.stderr)
        return 1

    models = resolve_gemini_models(client)
    exhausted_models: set[str] = set()
    active_model = pick_working_model(client, models, exhausted_models)
    if not active_model:
        print("[STOP] Aucun modèle Gemini Free Tier disponible actuellement. Les articles RSS sont sauvegardés.", file=sys.stderr, flush=True)
        return 0

    analyzed_count = 0
    batch = to_analyze[: args.max_ai]
    for idx, key in enumerate(batch, start=1):
        art = merged[key]
        print(f"[IA {idx}/{len(batch)}] Analyse ({active_model}) : {art['title'][:75]}…", flush=True)
        summary = None
        while active_model:
            try:
                summary = summarize_with_gemini(client, art, active_model)
                break
            except RuntimeError as quota_err:
                print(f"[WARN] Quota atteint sur {active_model} ({str(quota_err)[:140]}), bascule vers un autre modèle…", file=sys.stderr, flush=True)
                exhausted_models.add(active_model)
                active_model = pick_working_model(client, models, exhausted_models)

        if not active_model:
            print("[STOP] Quota Free Tier atteint sur tous les modèles candidats. Les analyses déjà faites sont sauvegardées.", file=sys.stderr, flush=True)
            break

        if summary:
            art["ai_summary"] = summary
            analyzed_count += 1
            # Sauvegarde immédiate après chaque article pour ne rien perdre
            save_payload(root_dir, merged)

        if idx < len(batch) and args.delay > 0:
            time.sleep(args.delay)

    print(f"[TERMINE] {analyzed_count} nouvelle(s) analyse(s) générée(s) et enregistrée(s) dans ActuZip.json.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
