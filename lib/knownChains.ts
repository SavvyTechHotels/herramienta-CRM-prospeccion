import type { TipoNegocio } from "@/types/hotel";

// Catálogo basado en "Cadenas Hoteleras en España" (mirahoteles.com)
// Reglas de clasificación por nº de establecimientos en España:
//   grandes_marcas → >100 hoteles en España, o marcas internacionales globales
//   cadena_grande  → 50-99 hoteles
//   cadena_mediana → 15-49 hoteles
//   cadena_pequena → 2-14 hoteles
//
// El algoritmo comprueba si la CLAVE está CONTENIDA en el nombre normalizado.
// Para claves cortas (≤4 chars) exige coincidencia de palabra completa.
// Orden: de más específica a más genérica para evitar falsos positivos.

export const CHAIN_CATALOG: { key: string; tipo: TipoNegocio }[] = [

  // ════════════════════════════════════════════════════════════
  // GRANDES MARCAS — >100 hoteles en España o multinacionales globales
  // ════════════════════════════════════════════════════════════

  // Sol Meliá / Meliá Hotels International (170)
  { key: "sol melia grupo",        tipo: "grandes_marcas" },
  { key: "sol melia",              tipo: "grandes_marcas" },
  { key: "me by melia",            tipo: "grandes_marcas" },
  { key: "innside by melia",       tipo: "grandes_marcas" },
  { key: "innside",                tipo: "grandes_marcas" },
  { key: "paradisus",              tipo: "grandes_marcas" },
  { key: "tryp by wyndham",        tipo: "grandes_marcas" },
  { key: "tryp",                   tipo: "grandes_marcas" },
  { key: "melia hotels",           tipo: "grandes_marcas" },
  { key: "melia",                  tipo: "grandes_marcas" },
  // Husa Hoteles (156)
  { key: "husa hoteles",           tipo: "grandes_marcas" },
  { key: "husa",                   tipo: "grandes_marcas" },
  // Sercotel (135)
  { key: "sercotel hoteles",       tipo: "grandes_marcas" },
  { key: "sercotel",               tipo: "grandes_marcas" },
  // NH Hotels (105)
  { key: "nh collection",          tipo: "grandes_marcas" },
  { key: "nh hoteles",             tipo: "grandes_marcas" },
  { key: "nh hotels",              tipo: "grandes_marcas" },
  { key: "nhow",                   tipo: "grandes_marcas" },
  { key: "nh",                     tipo: "grandes_marcas" },
  // Iberostar (~100)
  { key: "iberostar hotels",       tipo: "grandes_marcas" },
  { key: "iberostar",              tipo: "grandes_marcas" },

  // Marriott International (global)
  { key: "st regis",               tipo: "grandes_marcas" },
  { key: "ritz carlton",           tipo: "grandes_marcas" },
  { key: "ritz-carlton",           tipo: "grandes_marcas" },
  { key: "waldorf astoria",        tipo: "grandes_marcas" },
  { key: "le meridien",            tipo: "grandes_marcas" },
  { key: "autograph collection",   tipo: "grandes_marcas" },
  { key: "renaissance",            tipo: "grandes_marcas" },
  { key: "doubletree",             tipo: "grandes_marcas" },
  { key: "courtyard",              tipo: "grandes_marcas" },
  { key: "delta hotels",           tipo: "grandes_marcas" },
  { key: "sheraton",               tipo: "grandes_marcas" },
  { key: "westin",                 tipo: "grandes_marcas" },
  { key: "w hotels",               tipo: "grandes_marcas" },
  { key: "marriott",               tipo: "grandes_marcas" },
  // Hilton (global)
  { key: "curio collection",       tipo: "grandes_marcas" },
  { key: "tapestry collection",    tipo: "grandes_marcas" },
  { key: "lxr hotels",             tipo: "grandes_marcas" },
  { key: "canopy by hilton",       tipo: "grandes_marcas" },
  { key: "hampton inn",            tipo: "grandes_marcas" },
  { key: "hilton garden inn",      tipo: "grandes_marcas" },
  { key: "hilton garden",          tipo: "grandes_marcas" },
  { key: "conrad",                 tipo: "grandes_marcas" },
  { key: "hilton",                 tipo: "grandes_marcas" },
  // IHG (global)
  { key: "crowne plaza",           tipo: "grandes_marcas" },
  { key: "holiday inn express",    tipo: "grandes_marcas" },
  { key: "holiday inn",            tipo: "grandes_marcas" },
  { key: "kimpton",                tipo: "grandes_marcas" },
  { key: "hotel indigo",           tipo: "grandes_marcas" },
  { key: "six continents",         tipo: "grandes_marcas" },
  { key: "intercontinental hotels group", tipo: "grandes_marcas" },
  { key: "intercontinental",       tipo: "grandes_marcas" },
  // Accor (global — marca internacional con 55 hoteles en España)
  { key: "sofitel",                tipo: "grandes_marcas" },
  { key: "fairmont",               tipo: "grandes_marcas" },
  { key: "raffles",                tipo: "grandes_marcas" },
  { key: "swissotel",              tipo: "grandes_marcas" },
  { key: "mgallery",               tipo: "grandes_marcas" },
  { key: "pullman",                tipo: "grandes_marcas" },
  { key: "novotel",                tipo: "grandes_marcas" },
  { key: "mercure",                tipo: "grandes_marcas" },
  { key: "ibis styles",            tipo: "grandes_marcas" },
  { key: "ibis budget",            tipo: "grandes_marcas" },
  { key: "ibis",                   tipo: "grandes_marcas" },
  { key: "accor hoteles",          tipo: "grandes_marcas" },
  { key: "accor",                  tipo: "grandes_marcas" },
  // Hyatt (global)
  { key: "grand hyatt",            tipo: "grandes_marcas" },
  { key: "park hyatt",             tipo: "grandes_marcas" },
  { key: "andaz",                  tipo: "grandes_marcas" },
  { key: "alila",                  tipo: "grandes_marcas" },
  { key: "hyatt regency",          tipo: "grandes_marcas" },
  { key: "hyatt",                  tipo: "grandes_marcas" },
  // Wyndham (global)
  { key: "ramada",                 tipo: "grandes_marcas" },
  { key: "wyndham",                tipo: "grandes_marcas" },
  // Radisson (global)
  { key: "radisson blu",           tipo: "grandes_marcas" },
  { key: "park inn",               tipo: "grandes_marcas" },
  { key: "radisson",               tipo: "grandes_marcas" },
  // Otros internacionales
  { key: "four seasons",           tipo: "grandes_marcas" },
  { key: "kempinski",              tipo: "grandes_marcas" },
  { key: "mandarin oriental",      tipo: "grandes_marcas" },
  { key: "shangri-la",             tipo: "grandes_marcas" },
  { key: "shangri la",             tipo: "grandes_marcas" },
  { key: "banyan tree",            tipo: "grandes_marcas" },
  { key: "minor hotels",           tipo: "grandes_marcas" },
  { key: "tui blue",               tipo: "grandes_marcas" },
  { key: "labranda",               tipo: "grandes_marcas" },
  { key: "envergure",              tipo: "grandes_marcas" },
  { key: "louvre hotels",          tipo: "grandes_marcas" },
  { key: "lti espana",             tipo: "grandes_marcas" },

  // ════════════════════════════════════════════════════════════
  // CADENA GRANDE — 50-99 hoteles en España
  // ════════════════════════════════════════════════════════════

  // Paradores de Turismo (90)
  { key: "paradores de turismo de espana", tipo: "cadena_grande" },
  { key: "paradores de turismo",   tipo: "cadena_grande" },
  { key: "paradores",              tipo: "cadena_grande" },
  { key: "parador de turismo",     tipo: "cadena_grande" },
  { key: "parador",                tipo: "cadena_grande" },
  // Occidental Hotels & Resorts (79)
  { key: "occidental hotels",      tipo: "cadena_grande" },
  { key: "occidental",             tipo: "cadena_grande" },
  // AC Hotels (66)
  { key: "ac hotels by marriott",  tipo: "cadena_grande" },
  { key: "ac hotels",              tipo: "cadena_grande" },
  { key: "ac by marriott",         tipo: "cadena_grande" },
  // RIU Hotels & Resorts (50)
  { key: "riu hotels",             tipo: "cadena_grande" },
  { key: "riu palace",             tipo: "cadena_grande" },
  { key: "riu",                    tipo: "cadena_grande" },

  // ════════════════════════════════════════════════════════════
  // CADENA MEDIANA — 15-49 hoteles en España
  // ════════════════════════════════════════════════════════════

  // Barceló Hotels & Resorts (47)
  { key: "barcelo hotels",         tipo: "cadena_mediana" },
  { key: "barcelo",                tipo: "cadena_mediana" },
  // Estancias de España (46)
  { key: "estancias de espana",    tipo: "cadena_mediana" },
  { key: "estancias",              tipo: "cadena_mediana" },
  // Hesperia (45)
  { key: "hesperia hoteles",       tipo: "cadena_mediana" },
  { key: "hesperia",               tipo: "cadena_mediana" },
  // Catalonia Hoteles (41)
  { key: "catalonia hoteles",      tipo: "cadena_mediana" },
  { key: "catalonia hotels",       tipo: "cadena_mediana" },
  { key: "catalonia",              tipo: "cadena_mediana" },
  // Concorde Hotels & Resorts (35)
  { key: "concorde hotels",        tipo: "cadena_mediana" },
  { key: "concorde",               tipo: "cadena_mediana" },
  // H10 Hotels (34)
  { key: "h10 hotels",             tipo: "cadena_mediana" },
  { key: "h10",                    tipo: "cadena_mediana" },
  // Grupotel (34)
  { key: "grupotel",               tipo: "cadena_mediana" },
  // Silken Hoteles (30)
  { key: "silken hoteles",         tipo: "cadena_mediana" },
  { key: "silken",                 tipo: "cadena_mediana" },
  // Casonas Asturianas (30)
  { key: "casonas asturianas",     tipo: "cadena_mediana" },
  // Best Western Spain (29)
  { key: "best western spain",     tipo: "cadena_mediana" },
  { key: "best western",           tipo: "cadena_mediana" },
  // Lopesan Hotel Group (27)
  { key: "lopesan hotel group",    tipo: "cadena_mediana" },
  { key: "lopesan",                tipo: "cadena_mediana" },
  // Fiesta Hotel Group (27)
  { key: "fiesta hotel group",     tipo: "cadena_mediana" },
  { key: "fiesta hotel",           tipo: "cadena_mediana" },
  // Grupo Hoteles Playa / Senator (25)
  { key: "grupo hoteles playa",    tipo: "cadena_mediana" },
  { key: "senator hotels",         tipo: "cadena_mediana" },
  { key: "senator",                tipo: "cadena_mediana" },
  // High Tech Hotels & Resorts (25)
  { key: "high tech hotels",       tipo: "cadena_mediana" },
  // Centrhotel (25)
  { key: "centrhotel",             tipo: "cadena_mediana" },
  // Domus Hoteles (24)
  { key: "domus hoteles",          tipo: "cadena_mediana" },
  { key: "domus",                  tipo: "cadena_mediana" },
  // Hipotels (24)
  { key: "hipotels",               tipo: "cadena_mediana" },
  // Eurostars Hotels (24)
  { key: "eurostars hotel company",tipo: "cadena_mediana" },
  { key: "eurostars hotels",       tipo: "cadena_mediana" },
  { key: "eurostars",              tipo: "cadena_mediana" },
  // Best Hotels (23)
  { key: "best hotels",            tipo: "cadena_mediana" },
  // Zenit Hoteles (21)
  { key: "zenit hoteles",          tipo: "cadena_mediana" },
  { key: "zenit",                  tipo: "cadena_mediana" },
  // Hoteles Saint Michel (20)
  { key: "hoteles saint michel",   tipo: "cadena_mediana" },
  { key: "saint michel",           tipo: "cadena_mediana" },
  // Vime Hotels & Resorts (20)
  { key: "vime hotels",            tipo: "cadena_mediana" },
  { key: "vime",                   tipo: "cadena_mediana" },
  // Summa Hoteles (20)
  { key: "summa hoteles",          tipo: "cadena_mediana" },
  { key: "summa",                  tipo: "cadena_mediana" },
  // Princess Hotels (20)
  { key: "princess hotels",        tipo: "cadena_mediana" },
  // Leading Hotels of the World (18)
  { key: "leading hotels of the world", tipo: "cadena_mediana" },
  { key: "leading hotels",         tipo: "cadena_mediana" },
  // Confortel Hoteles (18)
  { key: "confortel hoteles",      tipo: "cadena_mediana" },
  { key: "confortel",              tipo: "cadena_mediana" },
  // Abba Hoteles (18)
  { key: "abba hoteles",           tipo: "cadena_mediana" },
  { key: "abba",                   tipo: "cadena_mediana" },
  // Grupo Hotelero Gargallo (17)
  { key: "grupo hotelero gargallo",tipo: "cadena_mediana" },
  { key: "grupo gargallo",         tipo: "cadena_mediana" },
  { key: "gargallo",               tipo: "cadena_mediana" },
  // HLG / City Park (17)
  { key: "hlg hoteles",            tipo: "cadena_mediana" },
  { key: "hot city park",          tipo: "cadena_mediana" },
  { key: "city park hoteles",      tipo: "cadena_mediana" },
  // Vincci Hoteles (17)
  { key: "vincci hoteles",         tipo: "cadena_mediana" },
  { key: "vincci",                 tipo: "cadena_mediana" },
  // THB Hotels (16)
  { key: "thb hotels",             tipo: "cadena_mediana" },
  { key: "thb",                    tipo: "cadena_mediana" },
  // Hotetur (16)
  { key: "hotetur",                tipo: "cadena_mediana" },
  // Protur Hotels (15)
  { key: "protur hotels",          tipo: "cadena_mediana" },
  { key: "protur",                 tipo: "cadena_mediana" },
  // H.Top Hotels Group (15)
  { key: "h top hotels group",     tipo: "cadena_mediana" },
  { key: "h top hotels",           tipo: "cadena_mediana" },
  { key: "h.top",                  tipo: "cadena_mediana" },
  { key: "htop",                   tipo: "cadena_mediana" },
  // Viva Hotels & Resorts (15)
  { key: "viva hotels",            tipo: "cadena_mediana" },
  { key: "viva",                   tipo: "cadena_mediana" },

  // Otras cadenas medianas no en el listado pero conocidas
  { key: "blue sea hotels",        tipo: "cadena_mediana" },
  { key: "blue sea",               tipo: "cadena_mediana" },
  { key: "soho boutique",          tipo: "cadena_mediana" },
  { key: "room mate",              tipo: "cadena_mediana" },
  { key: "room-mate",              tipo: "cadena_mediana" },
  { key: "fergus group",           tipo: "cadena_mediana" },
  { key: "fergus",                 tipo: "cadena_mediana" },
  { key: "ohtels",                 tipo: "cadena_mediana" },
  { key: "playasol",               tipo: "cadena_mediana" },
  { key: "evenia hotels",          tipo: "cadena_mediana" },
  { key: "evenia",                 tipo: "cadena_mediana" },
  { key: "ilunion hoteles",        tipo: "cadena_mediana" },
  { key: "ilunion",                tipo: "cadena_mediana" },
  { key: "bahia principe",         tipo: "cadena_mediana" },
  { key: "palladium hotel group",  tipo: "cadena_mediana" },
  { key: "grand palladium",        tipo: "cadena_mediana" },
  { key: "palladium",              tipo: "cadena_mediana" },
  { key: "be live",                tipo: "cadena_mediana" },
  { key: "globales",               tipo: "cadena_mediana" },
  { key: "hotusa",                 tipo: "cadena_mediana" },
  { key: "petit palace",           tipo: "cadena_mediana" },
  { key: "exe hotels",             tipo: "cadena_mediana" },
  { key: "ona hotels",             tipo: "cadena_mediana" },
  { key: "smy hotels",             tipo: "cadena_mediana" },
  { key: "mynd hotels",            tipo: "cadena_mediana" },
  { key: "alua hotels",            tipo: "cadena_mediana" },
  { key: "alua",                   tipo: "cadena_mediana" },

  // ════════════════════════════════════════════════════════════
  // CADENA PEQUEÑA — 2-14 hoteles en España
  // ════════════════════════════════════════════════════════════

  // 14 hoteles
  { key: "solvasa hoteles",        tipo: "cadena_pequena" },
  { key: "solvasa",                tipo: "cadena_pequena" },
  { key: "servi group hoteles",    tipo: "cadena_pequena" },
  { key: "servigroup",             tipo: "cadena_pequena" },
  { key: "servi group",            tipo: "cadena_pequena" },
  { key: "renthotel",              tipo: "cadena_pequena" },
  // 13 hoteles
  { key: "garden hoteles",         tipo: "cadena_pequena" },
  { key: "sh hoteles",             tipo: "cadena_pequena" },
  { key: "stil hotels",            tipo: "cadena_pequena" },
  { key: "as hoteles",             tipo: "cadena_pequena" },
  // 12 hoteles
  { key: "dunas hotels",           tipo: "cadena_pequena" },
  { key: "dunas",                  tipo: "cadena_pequena" },
  { key: "magic costablanca",      tipo: "cadena_pequena" },
  { key: "hoteles magic",          tipo: "cadena_pequena" },
  { key: "magic costa",            tipo: "cadena_pequena" },
  { key: "med playa cadena",       tipo: "cadena_pequena" },
  { key: "med playa",              tipo: "cadena_pequena" },
  { key: "medplaya",               tipo: "cadena_pequena" },
  { key: "oca hotels",             tipo: "cadena_pequena" },
  // 11 hoteles
  { key: "guitart hotel",          tipo: "cadena_pequena" },
  { key: "guitart",                tipo: "cadena_pequena" },
  { key: "hg hoteles",             tipo: "cadena_pequena" },
  { key: "elba hoteles",           tipo: "cadena_pequena" },
  { key: "elba",                   tipo: "cadena_pequena" },
  { key: "valentin hoteles",       tipo: "cadena_pequena" },
  { key: "valentin",               tipo: "cadena_pequena" },
  { key: "sunrise beach",          tipo: "cadena_pequena" },
  // 10 hoteles
  { key: "monarque hoteles",       tipo: "cadena_pequena" },
  { key: "monarque",               tipo: "cadena_pequena" },
  { key: "expo hoteles",           tipo: "cadena_pequena" },
  { key: "marina hotels gremi",    tipo: "cadena_pequena" },
  { key: "marina hotels",          tipo: "cadena_pequena" },
  { key: "tugasa",                 tipo: "cadena_pequena" },
  { key: "oasis hotels",           tipo: "cadena_pequena" },
  { key: "sirenis hotels",         tipo: "cadena_pequena" },
  { key: "sirenis",                tipo: "cadena_pequena" },
  { key: "bq hoteles",             tipo: "cadena_pequena" },
  { key: "bq hotels",              tipo: "cadena_pequena" },
  { key: "coral hoteles",          tipo: "cadena_pequena" },
  { key: "coral hotels",           tipo: "cadena_pequena" },
  { key: "cotursa hotels",         tipo: "cadena_pequena" },
  { key: "blau hotels",            tipo: "cadena_pequena" },
  { key: "boulevard hoteles",      tipo: "cadena_pequena" },
  // 9 hoteles
  { key: "jale monasterio",        tipo: "cadena_pequena" },
  { key: "jale",                   tipo: "cadena_pequena" },
  { key: "roc hotels",             tipo: "cadena_pequena" },
  { key: "ght hotels",             tipo: "cadena_pequena" },
  { key: "ola hotels",             tipo: "cadena_pequena" },
  { key: "insotel hotel group",    tipo: "cadena_pequena" },
  { key: "insotel",                tipo: "cadena_pequena" },
  { key: "nunez navarro",          tipo: "cadena_pequena" },
  { key: "nuñez navarro",          tipo: "cadena_pequena" },
  { key: "nn hotels",              tipo: "cadena_pequena" },
  { key: "rh hoteles",             tipo: "cadena_pequena" },
  { key: "cadena mar hotels",      tipo: "cadena_pequena" },
  { key: "city hotels hispania",   tipo: "cadena_pequena" },
  // 8 hoteles
  { key: "rafaelhoteles",          tipo: "cadena_pequena" },
  { key: "rafael hoteles",         tipo: "cadena_pequena" },
  { key: "mariterra hotels",       tipo: "cadena_pequena" },
  { key: "kris hoteles",           tipo: "cadena_pequena" },
  { key: "inturotel",              tipo: "cadena_pequena" },
  { key: "ma hoteles",             tipo: "cadena_pequena" },
  { key: "prestige hotels",        tipo: "cadena_pequena" },
  { key: "js hotels",              tipo: "cadena_pequena" },
  { key: "hotasa hoteles",         tipo: "cadena_pequena" },
  { key: "hotasa",                 tipo: "cadena_pequena" },
  { key: "center hoteles",         tipo: "cadena_pequena" },
  { key: "derby hotels collection",tipo: "cadena_pequena" },
  { key: "derby hotels",           tipo: "cadena_pequena" },
  { key: "celuisma",               tipo: "cadena_pequena" },
  { key: "beachcomber",            tipo: "cadena_pequena" },
  // 7 hoteles
  { key: "beatriz hoteles",        tipo: "cadena_pequena" },
  { key: "relais termal",          tipo: "cadena_pequena" },
  { key: "zt hotels",              tipo: "cadena_pequena" },
  { key: "santos hoteles",         tipo: "cadena_pequena" },
  { key: "ibb hoteles",            tipo: "cadena_pequena" },
  { key: "ibb hotels",             tipo: "cadena_pequena" },
  { key: "garbi hoteles",          tipo: "cadena_pequena" },
  { key: "hovima",                 tipo: "cadena_pequena" },
  // 6 hoteles
  { key: "hotenco",                tipo: "cadena_pequena" },
  { key: "fuerte hoteles",         tipo: "cadena_pequena" },
  { key: "fuerte",                 tipo: "cadena_pequena" },
  { key: "hcc hotels",             tipo: "cadena_pequena" },
  { key: "hcc",                    tipo: "cadena_pequena" },
  { key: "intertur",               tipo: "cadena_pequena" },
  { key: "aqua hotel",             tipo: "cadena_pequena" },
  { key: "salles hotels",          tipo: "cadena_pequena" },
  { key: "salles",                 tipo: "cadena_pequena" },
  { key: "marconfort",             tipo: "cadena_pequena" },
  { key: "hoteles intur",          tipo: "cadena_pequena" },
  { key: "intur",                  tipo: "cadena_pequena" },
  { key: "servatur",               tipo: "cadena_pequena" },
  { key: "prinz hoteles",          tipo: "cadena_pequena" },
  { key: "hospes hoteles",         tipo: "cadena_pequena" },
  { key: "hospes",                 tipo: "cadena_pequena" },
  { key: "invisa hoteles",         tipo: "cadena_pequena" },
  { key: "invisa",                 tipo: "cadena_pequena" },
  { key: "golden hotels",          tipo: "cadena_pequena" },
  { key: "dante hoteles",          tipo: "cadena_pequena" },
  // 5 hoteles
  { key: "ar hoteles",             tipo: "cadena_pequena" },
  { key: "ar hotels",              tipo: "cadena_pequena" },
  { key: "amic hotels",            tipo: "cadena_pequena" },
  { key: "marina d or",            tipo: "cadena_pequena" },
  { key: "spring hoteles",         tipo: "cadena_pequena" },
  { key: "ercilla hoteles",        tipo: "cadena_pequena" },
  { key: "ercilla",                tipo: "cadena_pequena" },
  { key: "ifa hotels",             tipo: "cadena_pequena" },
  { key: "palia hotels",           tipo: "cadena_pequena" },
  { key: "monte hoteles",          tipo: "cadena_pequena" },
  { key: "foxa grupo",             tipo: "cadena_pequena" },
  { key: "macia hoteles",          tipo: "cadena_pequena" },
  { key: "macia",                  tipo: "cadena_pequena" },
  { key: "izan hoteles",           tipo: "cadena_pequena" },
  { key: "izan",                   tipo: "cadena_pequena" },
  { key: "ms hoteles",             tipo: "cadena_pequena" },
  { key: "atlantis hotels",        tipo: "cadena_pequena" },
  { key: "cordial canarias",       tipo: "cadena_pequena" },
  { key: "cordial",                tipo: "cadena_pequena" },
  { key: "aranzazu hoteles",       tipo: "cadena_pequena" },
  { key: "aranzazu",               tipo: "cadena_pequena" },
  { key: "citymar",                tipo: "cadena_pequena" },
  // 4 hoteles
  { key: "pinero hoteles",         tipo: "cadena_pequena" },
  { key: "piñero hoteles",         tipo: "cadena_pequena" },
  { key: "pinero",                 tipo: "cadena_pequena" },
  { key: "mac hotels",             tipo: "cadena_pequena" },
  { key: "velada hoteles",         tipo: "cadena_pequena" },
  { key: "velada",                 tipo: "cadena_pequena" },
  { key: "sb hotels",              tipo: "cadena_pequena" },
  { key: "hoteles helios",         tipo: "cadena_pequena" },
  { key: "hm hotels",              tipo: "cadena_pequena" },
  { key: "porcel hoteles",         tipo: "cadena_pequena" },
  { key: "porcel",                 tipo: "cadena_pequena" },
  { key: "fantasia hoteles",       tipo: "cadena_pequena" },
  { key: "vp hoteles",             tipo: "cadena_pequena" },
  { key: "seaside hotels",         tipo: "cadena_pequena" },
  { key: "dreamplace hotels",      tipo: "cadena_pequena" },
  { key: "dreamplace",             tipo: "cadena_pequena" },
  { key: "tudanca cadena",         tipo: "cadena_pequena" },
  { key: "tudanca",                tipo: "cadena_pequena" },
  { key: "jm hoteles",             tipo: "cadena_pequena" },
  { key: "posadas de espana",      tipo: "cadena_pequena" },
  { key: "eden hotels",            tipo: "cadena_pequena" },
  { key: "aromar hotels",          tipo: "cadena_pequena" },
  { key: "amrey hotels",           tipo: "cadena_pequena" },
  // 3 hoteles
  { key: "hoteles guadalpin",      tipo: "cadena_pequena" },
  // 2 hoteles
  { key: "hoteles torreluz",       tipo: "cadena_pequena" },
  { key: "torreluz",               tipo: "cadena_pequena" },
  { key: "hoteles sidi",           tipo: "cadena_pequena" },
  { key: "royal premier hoteles",  tipo: "cadena_pequena" },
];

// Normaliza texto para comparación: minúsculas, sin acentos, sin caracteres especiales
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9& ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Busca el tipo de negocio para una cadena dada.
// Para claves cortas (≤4 chars) exige coincidencia de palabra completa para evitar falsos positivos.
export function lookupChainType(chainName: string): TipoNegocio | null {
  if (!chainName?.trim()) return "independiente";

  const n = norm(chainName);
  if (!n || n === "independiente" || n === "independente") {
    return "independiente";
  }

  for (const entry of CHAIN_CATALOG) {
    const k = norm(entry.key);
    if (k.length <= 4) {
      if (n === k || n.startsWith(k + " ") || n.endsWith(" " + k) || n.includes(" " + k + " ")) {
        return entry.tipo;
      }
    } else if (n.includes(k)) {
      return entry.tipo;
    }
  }

  return null; // desconocida → el usuario clasifica en el preview de importación
}
