#!/usr/bin/env python3
"""
Generate _publications/*.md entries from a BibTeX export.

Produces files in exactly the format the site already uses, and skips anything
already present (matched on DOI first, then on a normalised title), so it is
safe to re-run whenever you export a fresh .bib.

    python3 scripts/bib_to_publications.py path/to/export.bib
    python3 scripts/bib_to_publications.py export.bib --dry-run

Export sources that work well:
  ORCID   → Works → select all → Actions → Export as BibTeX
  Scholar → your profile → select all → Export → BibTeX
  Zotero / EndNote → export collection as BibTeX
"""

import argparse
import pathlib
import re
import sys
import unicodedata

# No third-party dependencies on purpose — this only has to read the kind of
# BibTeX that ORCID, Scholar and Zotero produce.


def parse_bibtex(text):
    """Minimal BibTeX reader: returns a list of {'ENTRYTYPE', 'ID', field: value}."""
    entries = []
    i, n = 0, len(text)
    while True:
        at = text.find("@", i)
        if at == -1:
            break
        m = re.match(r"@(\w+)\s*\{", text[at:])
        if not m:
            i = at + 1
            continue
        etype = m.group(1).lower()
        if etype in ("comment", "preamble", "string"):
            i = at + 1
            continue
        # walk to the matching closing brace
        start = at + m.end() - 1
        depth, j = 0, start
        while j < n:
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        body = text[start + 1:j]
        i = j + 1

        key, _, rest = body.partition(",")
        entry = {"ENTRYTYPE": etype, "ID": key.strip()}
        k = 0
        while k < len(rest):
            fm = re.compile(r"\s*([A-Za-z][\w-]*)\s*=\s*").match(rest, k)
            if not fm:
                break
            field, k = fm.group(1).lower(), fm.end()
            if k < len(rest) and rest[k] in "{\"":
                opener = rest[k]
                closer = "}" if opener == "{" else '"'
                d, p2 = 0, k
                while p2 < len(rest):
                    c = rest[p2]
                    if opener == "{":
                        if c == "{":
                            d += 1
                        elif c == "}":
                            d -= 1
                            if d == 0:
                                break
                    elif p2 > k and c == closer:
                        break
                    p2 += 1
                value, k = rest[k + 1:p2], p2 + 1
            else:  # bare value, e.g. year = 2024 or month = jan
                end = rest.find(",", k)
                end = len(rest) if end == -1 else end
                value, k = rest[k:end], end
            entry[field] = value.strip()
            comma = rest.find(",", k)
            k = len(rest) if comma == -1 else comma + 1
        entries.append(entry)
    return entries

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBS = ROOT / "_publications"

CONFERENCE_TYPES = {"inproceedings", "proceedings", "conference", "incollection"}

# Venue -> short token used in filenames, following the existing naming.
VENUE_TOKENS = {
    "nature communications": "NatCommun",
    "brain": "Brain",
    "jama neurology": "JamaNeurol",
    "alzheimer's & dementia": "AlzDem",
    "alzheimers & dementia": "AlzDem",
    "alzheimer's and dementia": "AlzDem",
    "science translational medicine": "SciTranslMed",
    "embo molecular medicine": "EMBOMolMed",
    "molecular neurodegeneration": "MolNeurodegener",
    "movement disorders": "MovementDisorders",
    "brain communications": "BrainCommunications",
    "brain, behavior, and immunity": "BrainBehaviorImmunity",
    "arthritis & rheumatology": "ArthritisRheumatol",
    "neuroscience applied": "NeuroscienceApplied",
}


def clean(text):
    """Strip BibTeX braces/newlines and normalise whitespace."""
    if not text:
        return ""
    text = text.replace("\n", " ").replace("\r", " ")
    text = re.sub(r"[{}]", "", text)
    text = re.sub(r"\\([&%$#_])", r"\1", text)      # \& -> &
    text = re.sub(r"\\[a-zA-Z]+\s*", "", text)      # drop \emph etc.
    return re.sub(r"\s+", " ", text).strip()


def entity(text):
    """Match the existing files, which store apostrophes as HTML entities."""
    return text.replace("'", "&#39;")


def venue_token(venue):
    v = venue.lower().strip().rstrip(".")
    if v in VENUE_TOKENS:
        return VENUE_TOKENS[v]
    words = re.findall(r"[A-Za-z]+", venue)
    skip = {"the", "of", "and", "for", "in", "on", "a", "an", "journal"}
    parts = [w for w in words if w.lower() not in skip][:3]
    token = "".join(w[:1].upper() + w[1:4].lower() for w in parts)
    return token or "Publication"


def normalise_title(title):
    t = unicodedata.normalize("NFKD", title.lower())
    return re.sub(r"[^a-z0-9]+", "", t)


def existing_index():
    """Map DOIs and normalised titles already on the site."""
    dois, titles = set(), set()
    for f in PUBS.glob("*.md"):
        text = f.read_text(encoding="utf-8")
        m = re.search(r"^paperurl:\s*'?([^'\n]+)'?", text, re.M)
        if m:
            doi = m.group(1).lower().replace("https://doi.org/", "").strip()
            if doi:
                dois.add(doi)
        m = re.search(r'^title:\s*"(.+)"', text, re.M)
        if m:
            titles.add(normalise_title(m.group(1).replace("&#39;", "'")))
    return dois, titles


def format_authors(raw):
    """'Last, First and Last, First' -> 'Last, F., Last, F.'"""
    out = []
    for name in raw.split(" and "):
        name = clean(name)
        if not name:
            continue
        if "," in name:
            last, first = [p.strip() for p in name.split(",", 1)]
        else:
            bits = name.split()
            last, first = bits[-1], " ".join(bits[:-1])
        initials = " ".join(f"{p[0]}." for p in first.split() if p)
        out.append(f"{last}, {initials}".strip().rstrip(","))
    return ", ".join(out)


def build_entry(bib, dois, titles, used_slugs):
    etype = bib.get("ENTRYTYPE", "article").lower()
    title = clean(bib.get("title", ""))
    if not title:
        return None, "no title"

    doi = clean(bib.get("doi", "")).lower().replace("https://doi.org/", "")
    if doi and doi in dois:
        return None, "already on the site (DOI)"
    if normalise_title(title) in titles:
        return None, "already on the site (title)"

    year = clean(bib.get("year", "")) or "0000"
    month = clean(bib.get("month", ""))
    months = {m: i for i, m in enumerate(
        ["jan", "feb", "mar", "apr", "may", "jun",
         "jul", "aug", "sep", "oct", "nov", "dec"], 1)}
    mm = months.get(month[:3].lower(), 1)
    date = f"{year}-{mm:02d}-01"

    venue = clean(bib.get("journal") or bib.get("booktitle") or bib.get("publisher") or "")
    category = "conferences" if etype in CONFERENCE_TYPES else "manuscripts"

    slug = f"{year}{venue_token(venue)}"
    n, base = 2, slug
    while slug in used_slugs or (PUBS / f"{slug}.md").exists():
        slug = f"{base}{n}"
        n += 1
    used_slugs.add(slug)

    authors = format_authors(bib.get("author", ""))
    url = f"https://doi.org/{doi}" if doi else clean(bib.get("url", ""))

    abstract = clean(bib.get("abstract", ""))
    if abstract:
        excerpt = abstract if len(abstract) <= 300 else abstract[:297].rsplit(" ", 1)[0] + "…"
    else:
        excerpt = f"{title}. Published in {venue}." if venue else title

    volume = clean(bib.get("volume", ""))
    issue = clean(bib.get("number", ""))
    pages = clean(bib.get("pages", ""))
    venue_full = venue
    if volume:
        venue_full += f", vol {volume}"
    if issue:
        venue_full += f", issue {issue}"
    if pages:
        venue_full += f", pp {pages}"

    citation = f"{authors} ({year}). {title}. {venue}."
    if url:
        citation += f" {url}"

    body = abstract if abstract else ""
    parts = [
        "---",
        f'title: "{entity(title)}"',
        "collection: publications",
        f"category: {category}",
        f"permalink: /publication/{slug}",
        f"excerpt: '{entity(excerpt)}'",
        f"date: {date}",
        f"venue: '{entity(venue_full)}'",
    ]
    if url:
        parts.append(f"paperurl: '{url}'")
    parts += [f"citation: '{entity(citation)}'", "---", ""]
    if body:
        parts += [body, ""]
    if url:
        parts += [f"[Download paper here]({url})", ""]
    parts.append(f"Recommended citation: {citation}")

    return (slug, "\n".join(parts) + "\n"), None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("bibfiles", nargs="+")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    dois, titles = existing_index()
    print(f"{len(list(PUBS.glob('*.md')))} entries already on the site\n")

    used_slugs, written, skipped = set(), 0, []
    for path in args.bibfiles:
        raw = pathlib.Path(path).read_text(encoding="utf-8", errors="replace")
        entries = parse_bibtex(raw)
        print(f"{path}: {len(entries)} entries in the export")
        for bib in entries:
            result, reason = build_entry(bib, dois, titles, used_slugs)
            if result is None:
                skipped.append((clean(bib.get('title', '?'))[:60], reason))
                continue
            slug, content = result
            titles.add(normalise_title(clean(bib.get("title", ""))))
            if not args.dry_run:
                (PUBS / f"{slug}.md").write_text(content, encoding="utf-8")
            written += 1
            print(f"  + {slug}.md  {clean(bib.get('title',''))[:70]}")

    print(f"\n{written} new file(s){' (dry run — nothing written)' if args.dry_run else ''}")
    if skipped:
        print(f"{len(skipped)} skipped:")
        for t, r in skipped:
            print(f"  - {t} … {r}")


if __name__ == "__main__":
    main()
