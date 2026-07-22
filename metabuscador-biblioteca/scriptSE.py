import json
import math
import os

# ==========================
# CONFIG
# ==========================

MAX_ARCHIVOS_FISICO  = 6
MAX_ARCHIVOS_DIGITAL = 14

FILE_FISICO  = "search_fisico.json"   # JSON del metabuscador (físicos)
FILE_DIGITAL = "search_digital.json"  # JSON del metabuscador (digitales + open access)

COLECCIONES = {
    "CAT-":  ("Cátedra",   "https://elibro.net/en/lc/uade/colecciones/ELC004?prev=col"),
    "HAM-":  ("Hammurabi", "https://www.digitalbd.uade.edu.ar/login?url=https://biblioteca.hammurabidigital.com.ar/auth/ip"),
    "CP67-": ("CP67",      "https://www.digitalbd.uade.edu.ar/login?url=https://bibliotecadigital.cp67.com/auth/ip"),
}

# ==========================
# HELPERS
# ==========================

def cargar_json(path):
    if not os.path.exists(path):
        print(f"Advertencia: No se encontró '{path}', se omite.")
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def convertir_registro(item):
    reg = {}
    if item.get("titulo"):      reg["titulo"]      = item["titulo"]
    if item.get("autor"):       reg["autor"]       = item["autor"]
    if item.get("anio"):        reg["anio"]        = item["anio"]
    if item.get("editorial"):   reg["editorial"]   = item["editorial"]
    if item.get("idioma"):      reg["idioma"]      = item["idioma"]
    if item.get("descripcion"): reg["descripcion"] = item["descripcion"]
    if item.get("url"):         reg["url"]         = item["url"]

    if item.get("tematicas"):
        t = item["tematicas"]
        if isinstance(t, list) and len(t) > 0:
            reg["tematicas"] = t
        elif isinstance(t, str) and t:
            reg["tematicas"] = [x.strip() for x in t.split(",") if x.strip()]

    fmt = item.get("formato", "")
    if fmt == "OPEN_ACCESS" or item.get("is_open_access"):
        reg["disponibilidad"] = "Open Access"
    elif fmt == "DIGITAL" or item.get("is_digital"):
        reg["disponibilidad"] = "Digital (eBook)"
    else:
        reg["disponibilidad"] = "Físico (Biblioteca UADE)"

    # >>> NUEVO: colección + link de la plataforma (Cátedra / Hammurabi / CP67)
    idt = str(item.get("id_titulo", "")).upper()
    for pref, (nombre, link) in COLECCIONES.items():
        if idt.startswith(pref):
            reg["coleccion"] = nombre
            reg["url"] = link
            break
    # <<< FIN NUEVO

    return reg

def generar_archivos(registros, output_prefix, max_partes):
    total = len(registros)
    if total == 0:
        print(f"Advertencia: No hay registros para '{output_prefix}'.")
        return
    chunk_size = math.ceil(total / max_partes)
    for i in range(0, total, chunk_size):
        chunk = registros[i : i + chunk_size]
        num = (i // chunk_size) + 1
        fname = f"{output_prefix}_parte_{num}.json"
        with open(fname, "w", encoding="utf-8") as f:
            json.dump(chunk, f, ensure_ascii=False, indent=2)
        print(f"  [{num}] {fname} — {len(chunk)} registros")


# ==========================
# MAIN
# ==========================

def main():
    print("Iniciando generación de archivos para el bot...\n")

    print("Procesando físicos...")
    fisico_raw = cargar_json(FILE_FISICO)
    fisico_bot = [convertir_registro(r) for r in fisico_raw]
    generar_archivos(fisico_bot, "bot_fisico", MAX_ARCHIVOS_FISICO)
    print(f"  Total físicos: {len(fisico_bot)}\n")

    print("Procesando digitales + open access...")
    digital_raw = cargar_json(FILE_DIGITAL)
    digital_bot = [convertir_registro(r) for r in digital_raw]
    generar_archivos(digital_bot, "bot_digital", MAX_ARCHIVOS_DIGITAL)
    print(f"  Total digitales: {len(digital_bot)}\n")

    print("¡Proceso finalizado! Archivos listos para subir al bot.")

if __name__ == "__main__":
    main()