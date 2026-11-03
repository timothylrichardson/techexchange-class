#!/usr/bin/env python3
"""Evergreen check: fail if a cohort date, class time, or venue appears in the course materials.

Usage:  python3 scripts/check-evergreen.py

Scans every .html file and every .pdf file in the repo. PDFs need the pypdf package
(pip install pypdf). Exit code 0 means clean, 1 means something needs fixing.

The rule itself is explained in README.md. If a match is a real fact rather than cohort
logistics (for example, the day Windows 10 support ended), add it to ALLOWED below.
"""
import logging
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

MONTH = r"(?:January|February|March|April|May|June|July|August|September|October|November|December)"
RULES = [
    ("calendar date", rf"\b(?i:{MONTH})\s+\d{{1,2}}\b"),
    ("calendar date", r"\b\d{1,2}/\d{1,2}(?:/\d{2,4})?\b"),
    ("year", r"(?<![\d.#-])(?:19|20)\d{2}(?![\d.%])"),
    ("day of the week", r"\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?\b"),
    ("clock time", r"\b\d{1,2}(?::\d{2})?\s*(?:AM|PM|a\.m\.|p\.m\.)(?![a-z])"),
    ("clock time", r"\b\d{1,2}:\d{2}\b"),
    ("time of day", r"\b(?:noon|this morning|this afternoon|tonight)\b"),
    ("room or venue", r"\bRoom\s+[A-Z]?(?:&#8209;|-)?\d+"),
    ("room or venue", r"\b(?:1721 Broadway|MacArthur|Diablo Valley|Golf Club Rd|Pleasant Hill|H(?:&#8209;|-)106)\b"),
    ("room or venue", r"\b(?:DVC|EOPS)\b"),
]

# Facts that stay on purpose. Each entry is matched against the line that was flagged.
ALLOWED = [
    r"ended free support on <b>October 14, 2025</b>",      # Windows 10 end of support
    r"Chrome swapped the padlock .* in 2023",              # browser history in instructor notes
]

# Remove content that only looks like a date: embedded images, SVG drawing data, CSS, QR art.
STRIP = [
    (re.compile(r"data:[a-z]+/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+"), ""),
    (re.compile(r"<style\b.*?</style>", re.S), lambda m: "\n" * m[0].count("\n")),
    (re.compile(r"""\b(?:d|viewBox|transform|points|style|width|height|x|y|x1|x2|y1|y2|cx|cy|r|rx)="[^"]*\""""), ""),
]


def html_lines(path):
    text = path.read_text(encoding="utf-8")
    for pattern, repl in STRIP:
        text = pattern.sub(repl, text)
    return text.splitlines()


def pdf_lines(path):
    from pypdf import PdfReader  # imported here so HTML-only runs need no extra package

    logging.getLogger("pypdf").setLevel(logging.ERROR)
    reader = PdfReader(path)
    lines = []
    meta = reader.metadata or {}
    for key in ("/CreationDate", "/ModDate"):
        stamp = re.search(r"(?:19|20)\d{2}", str(meta.get(key) or ""))
        if stamp:
            lines.append(f"PDF file properties {key} is stamped {stamp[0]}")
    for page in reader.pages:
        lines.extend(page.extract_text().splitlines())
    return lines


def main():
    found = 0
    files = sorted(ROOT.glob("*.html")) + sorted(ROOT.glob("*.pdf"))
    rules = [(name, re.compile(rx)) for name, rx in RULES]
    allowed = [re.compile(rx) for rx in ALLOWED]
    for path in files:
        lines = pdf_lines(path) if path.suffix == ".pdf" else html_lines(path)
        for number, line in enumerate(lines, 1):
            if any(a.search(line) for a in allowed):
                continue
            for name, rule in rules:
                hit = rule.search(line)
                if hit:
                    found += 1
                    print(f"{path.name}:{number}  [{name}]  {hit[0]!r}  in: {line.strip()[:100]}")
                    break
    if found:
        print(f"\nNot evergreen: {found} item(s) to fix. See 'Keeping the materials evergreen' in README.md.")
        return 1
    print(f"Evergreen check passed: {len(files)} files scanned, no cohort dates, times, or venues found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
