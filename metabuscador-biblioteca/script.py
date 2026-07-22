import os
import pandas as pd
import json
import re

# ==========================
# CONFIG - AJUSTÁ SOLO ESTAS RUTAS
# ==========================

FILE_CATALOGO       = r"C:/Users/selgue/Desktop/SID_SELGUE/PROYECTOS WEB/Metabuscador Bibliografico con IA/Base.Bibliografica.Items.xlsx"
FILE_OPENACCESS_CSV = "repository-export.csv"   # CSV de OAPEN (dejar "" para omitir)

OUT_SEARCH_FISICO  = "search_fisico.json"
OUT_SEARCH_DIGITAL = "search_digital.json"


# ==========================
# HELPERS
# ==========================

def norm_str(x):
    if pd.isna(x):
        return ""
    return re.sub(r"\s+", " ", str(x)).strip()

def normalize_format(fmt_raw):
    f = norm_str(fmt_raw).upper()
    is_open = any(k in f for k in ["OPEN", "OPEN ACCESS", "OA", "ACCESO ABIERTO"])
    is_dig  = any(k in f for k in ["DIGITAL", "EBOOK", "E-BOOK", "ELECTRONICO", "ELECTRÓNICO", "ONLINE", "EREVISTA"])
    is_fis  = any(k in f for k in ["FISICO", "FÍSICO", "IMPRESO", "PRINT", "PAPEL", "FISICA", "FÍSICA", "LIBRO", "REVISTA"])
    if is_open:  base = "OPEN_ACCESS"
    elif is_dig: base = "DIGITAL"
    elif is_fis: base = "FISICO"
    else:         base = ""
    return is_fis, (is_dig or is_open), is_open, base

def guess_idioma(x):
    t = norm_str(x).lower()
    if t in ["es", "spa", "español", "espanol", "castellano"]: return "ES"
    if t in ["en", "eng", "english", "inglés", "ingles"]:       return "EN"
    if t in ["pt", "por", "português", "portugues"]:           return "PT"
    if t in ["fr", "fre", "français", "frances", "francés"]:  return "FR"
    if t in ["it", "ita", "italiano"]:                         return "IT"
    return t.upper() if t else ""

def safe_int(x):
    try:    return int(str(x).split(".")[0])
    except: return None

def dump_json(obj, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))

def pick_col(df, candidates):
    def norm_header(h):
        h2 = h.lower()
        for a, b in [("á","a"),("é","e"),("í","i"),("ó","o"),("ú","u"),("ñ","n")]:
            h2 = h2.replace(a, b)
        return re.sub(r"\s+", " ", h2.strip())
    norm_map = {norm_header(c): c for c in df.columns}
    for cand in candidates:
        cn = norm_header(cand)
        for col_n, orig in norm_map.items():
            if cn == col_n: return orig
        for col_n, orig in norm_map.items():
            if cn in col_n: return orig
    raise KeyError(f"No pude encontrar ninguna de estas columnas: {candidates}")


# ==========================
# PARTE PRINCIPAL: CATALOGO → SEARCH DATA
# ==========================

def build_search_data(path_catalogo):
    print("  Leyendo catálogo de la base bibliográfica...")
    df = pd.read_excel(path_catalogo, dtype=str)
    df = df.fillna("")

    col_id   = pick_col(df, ["NroControl","ID de Título","ID_TITULO","ID TITULO","IdTitulo","id","ID","Id"])
    col_tit  = pick_col(df, ["Titulo","Título","Catálogo Título","Catalogo Titulo","TITULO"])
    col_aut  = pick_col(df, ["Autor","Catálogo Autor","Catalogo Autor","AUTOR"])
    col_anio = pick_col(df, ["AnioPublicacion","Año de publicación","Año","Anio","AÑO","ANIO"])
    col_tag  = pick_col(df, ["NumeroEtiquetaMARC","Bib Marc Número de la etiqueta","Bib Marc Numero de la etiqueta","MARC Tag","Tag"])
    col_data = pick_col(df, ["DatosMARC","Bib Marc Datos del subcampo","Bib Marc Datos de subcampo","MARC Data","Data"])
    col_fmt  = pick_col(df, ["Categoria2","FORMATO","Formato","FORTMATO","Tipo Formato","FORMATO ITEM"])

    try:    col_ed  = pick_col(df, ["Editorial","Editor","Publicador","Publisher","EDITORIAL"])
    except: col_ed  = None
    try:    col_idi = pick_col(df, ["Idioma","Lenguaje","Language","IDIOMA"])
    except: col_idi = None
    
    ### NUEVO: Intentar encontrar la columna ISBN/ISSN
    try:    col_isbn = pick_col(df, ["ISBN/ISSN", "ISBN", "ISSN"])
    except: col_isbn = None

    df["bid"]    = df[col_id].str.strip()
    df["btit"]   = df[col_tit].str.strip()
    df["baut"]   = df[col_aut].str.strip()
    df["banio"]  = df[col_anio].str.strip()
    df["btag"]   = df[col_tag].str.strip()
    df["bdata"]  = df[col_data].str.strip()
    df["bfmt"]   = df[col_fmt].str.strip()
    df["bed"]    = df[col_ed].str.strip()  if col_ed  else ""
    df["bidi"]   = df[col_idi].str.strip() if col_idi else ""
    
    ### NUEVO: Extraer datos de ISBN
    df["bisbn"]  = df[col_isbn].str.strip() if col_isbn else ""

    print("  Agrupando registros...")

    def first_nonempty(s):
        vals = s[s != ""]
        return vals.iloc[0] if len(vals) > 0 else ""

    base = df.groupby("bid", sort=False).agg(
        titulo    = ("btit",  first_nonempty),
        autor     = ("baut",  first_nonempty),
        anio      = ("banio", first_nonempty),
        editorial = ("bed",   first_nonempty),
        isbn      = ("bisbn", first_nonempty),  ### NUEVO: Agregado a la agrupación
    )

    mask_650 = (df["btag"] == "650") & (df["bdata"] != "")
    tematicas_grouped = df[mask_650].groupby("bid")["bdata"].apply(
        lambda x: sorted({v.upper() for v in x if v.upper() not in ("UNAUTHORIZED", "NO AUTORIZADO")})
    )

    mask_520 = (df["btag"] == "520") & (df["bdata"] != "")
    descrip_grouped = df[mask_520].groupby("bid")["bdata"].apply(
        lambda x: x.iloc[0] if len(x) > 0 else ""
    )

    mask_fmt = df["bfmt"] != ""
    fmt_grouped = df[mask_fmt].groupby("bid")["bfmt"].apply(list)

    mask_041 = (df["btag"] == "041") & (df["bdata"] != "")
    idi_grouped = df[mask_041].groupby("bid")["bdata"].apply(
        lambda x: norm_str(x.iloc[0])
    )

    print("  Generando registros finales (Optimizados para Frontend)...")
    final_books = []

    for bid, row in base.iterrows():
        formatos = fmt_grouped.get(bid, [])
        is_fisico = is_digital = is_open = False
        base_fmt_final = ""
        for fc in formatos:
            fis, dig, ope, bfmt = normalize_format(fc)
            is_fisico  = is_fisico  or fis
            is_digital = is_digital or dig
            is_open    = is_open    or ope
            if bfmt == "OPEN_ACCESS": base_fmt_final = "OPEN_ACCESS"
            elif bfmt == "DIGITAL"  and base_fmt_final != "OPEN_ACCESS": base_fmt_final = "DIGITAL"
            elif bfmt == "FISICO"   and base_fmt_final not in ["OPEN_ACCESS","DIGITAL"]: base_fmt_final = "FISICO"

        tematicas_list = tematicas_grouped.get(bid, [])
        descripcion    = descrip_grouped.get(bid, "")
        idioma_final   = idi_grouped.get(bid, "")

        payload = {
            "id_titulo": bid,
            "titulo": row.titulo
        }
        
        if row.autor: payload["autor"] = row.autor
        anio_val = safe_int(row.anio)
        if anio_val: payload["anio"] = anio_val
        if row.editorial: payload["editorial"] = row.editorial
        if idioma_final: payload["idioma"] = idioma_final
        if base_fmt_final: payload["formato"] = base_fmt_final
        if descripcion: payload["descripcion"] = descripcion
        if tematicas_list: payload["tematicas"] = tematicas_list
        
        ### NUEVO: Incluir ISBN/ISSN en el payload si existe
        if row.isbn: payload["isbn"] = row.isbn

        if is_digital or is_open: payload["is_digital"] = True
        if is_fisico: payload["is_fisico"] = True
        if is_open: payload["is_open_access"] = True

        final_books.append(payload)

    fisico_list  = [b for b in final_books if b.get("is_fisico")]
    digital_list = [b for b in final_books if b.get("is_digital") or b.get("is_open_access")]
    return fisico_list, digital_list



# ==========================
# OPEN ACCESS: leer CSV de OAPEN y generar registros compatibles
# ==========================

import re as _re

def _clean_oa(val):
    if pd.isna(val): return ""
    return _re.sub(r"\s+", " ", str(val)).strip()

def _clean_lang_oa(val):
    if pd.isna(val): return ""
    t = str(val).strip().lower()
    if t.startswith(("spa", "esp", "cas")): return "Español"
    if t.startswith(("eng", "ing")):        return "Inglés"
    if t.startswith("ita"):                 return "Italiano"
    if t.startswith(("fre", "fra")):        return "Francés"
    if t.startswith("por"):                 return "Portugués"
    if t.startswith(("ger", "deu", "ale")): return "Alemán"
    if t.startswith("cat"):                 return "Catalán"
    if t.startswith("pol"):                 return "Polaco"
    if t.startswith("lat"):                 return "Latín"
    m = _re.match(r"^([A-Za-zÀ-ÿ]+)", str(val))
    w = m.group(1) if m else str(val)
    return w[:1].upper() + w[1:].lower()

def _extract_subjects_oa(row):
    parts = []
    s = _clean_oa(row.get("dc.subject.other", ""))
    if s:
        keywords = [k.strip() for k in s.split("||")
                    if len(k.strip()) < 60
                    and "thema" not in k.lower()
                    and "bic" not in k.lower()][:6]
        parts.extend(keywords)
    sc = _clean_oa(row.get("dc.subject.classification", ""))
    if sc:
        for chunk in sc.split("||"):
            if "::" in chunk:
                last = chunk.strip().split("::")[-1]
                if len(last) < 80:
                    parts.append(last)
            elif len(chunk.strip()) < 80:
                parts.append(chunk.strip())
    return [p for p in dict.fromkeys(parts) if p][:8]

def build_openaccess_data(path_csv):
    print("  Leyendo CSV de Open Access...")
    df = pd.read_csv(path_csv, low_memory=False)
    spanish = df[df["dc.language"].str.contains("spa", na=False)].copy()
    print(f"  Registros en español encontrados: {len(spanish)}")

    records = []
    for i, (_, row) in enumerate(spanish.iterrows()):
        titulo = _clean_oa(row["dc.title"])[:200]
        if not titulo:
            continue
        url_raw = _clean_oa(row.get("BITSTREAM Download URL", ""))
        url = url_raw.split("||")[0][:300] if url_raw else ""

        rec = {
            "id_titulo":    f"OA-{i}",
            "titulo":       titulo,
            "formato":      "OPEN_ACCESS",
            "is_digital":   True,
            "is_open_access": True,
        }
        autor = _clean_oa(row.get("dc.contributor.author", "")).replace("||", ", ")[:150]
        if autor:       rec["autor"]       = autor
        anio_raw = _clean_oa(row.get("dc.date.issued", ""))[:4]
        if anio_raw.isdigit(): rec["anio"] = int(anio_raw)
        editorial = _clean_oa(row.get("oapen.relation.isPublishedBy_publisher.name", ""))[:80]
        if editorial:   rec["editorial"]   = editorial
        idioma = _clean_lang_oa(row.get("dc.language", ""))
        if idioma:      rec["idioma"]      = idioma
        desc = _clean_oa(row.get("dc.description.abstract", ""))[:400]
        if desc:        rec["descripcion"] = desc
        if url:         rec["url"]         = url
        temas = _extract_subjects_oa(row)
        if temas:       rec["tematicas"]   = temas

        records.append(rec)

    print(f"  Open Access procesados: {len(records)}")
    return records

# ==========================
# MAIN
# ==========================

def main():
    print("Iniciando procesamiento...")
    fisico_list, digital_list = build_search_data(FILE_CATALOGO)

    # Sumar Open Access si hay CSV disponible
    if FILE_OPENACCESS_CSV and os.path.exists(FILE_OPENACCESS_CSV):
        oa_list = build_openaccess_data(FILE_OPENACCESS_CSV)
        digital_list = digital_list + oa_list
        print(f"- Open Access sumados: {len(oa_list)} títulos")
    else:
        print("- CSV de Open Access no encontrado, se omite.")

    print(f"- Libros Físicos:   {len(fisico_list)} títulos exportados")
    print(f"- Libros Digitales: {len(digital_list)} títulos exportados (incluye Open Access)")

    print("Guardando archivos JSON...")
    dump_json(fisico_list,   OUT_SEARCH_FISICO)
    dump_json(digital_list,  OUT_SEARCH_DIGITAL)

    print("¡Listo!")
    print(f"Archivos listos para subir a producción: {OUT_SEARCH_FISICO}, {OUT_SEARCH_DIGITAL}")

if __name__ == "__main__":
    main()