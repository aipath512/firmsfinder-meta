// firmsfinder-meta v1.0 (2026-10-13)
// Injectează meta complet (description, robots, Open Graph, Twitter) pe paginile
// firmsfinder.eu care au doar meta-șablon. Nu modifică paginile din repo.
// Rută: firmsfinder.eu/*  (vezi wrangler.toml)

const SITE = "https://firmsfinder.eu";
const OG_IMAGE = SITE + "/assets/og-image.webp";
const OG_IMAGE_ALT = "FirmsFinder AI — date, relații economice și oportunități";

const PAGES = {
  "/surse/": {
    title: "Surse și metodologie | FirmsFinder",
    description:
      "Sursele datelor FirmsFinder (ONRC, Ministerul Finanțelor), limitele interpretării CAEN și cum verifici o potrivire înainte de contact.",
  },
  "/contact/": {
    title: "Contact și corecturi | FirmsFinder",
    description:
      "Trimite o solicitare de informații sau o corectură despre o firmă. Operator: AiVenture S.R.L., București.",
  },
  "/cautare/": {
    title: "Caută firme | FirmsFinder",
    description:
      "Căutare structurată de firme din România după nume, CAEN, județ și localitate. Rezultatele apar numai dacă baza de date este conectată.",
  },
  "/semnale/": {
    title: "Cele 60 de semnale ON-SITE | FirmsFinder",
    description:
      "Catalogul celor 60 de semnale ON-SITE (Web-Om, Web-AI, Web-A2A, RRVI), cu starea declarată și verdictul live pentru fiecare semnal.",
  },
  "/comparare/": {
    title: "Compară firme | FirmsFinder",
    description:
      "Compară 2–4 firme din România pe aceleași câmpuri, cu surse indicate și valori lipsă marcate explicit.",
  },
  "/categorii/": {
    title: "Categorii de activitate | FirmsFinder",
    description:
      "Alege un cod CAEN și ediția lui pentru a explora firme după activitate. Codul CAEN nu demonstrează produsele sau serviciile unei firme.",
  },
  "/localitati/": {
    title: "Firme după localitate | FirmsFinder",
    description:
      "Caută firme după județ și localitate exactă. Localizarea singură nu confirmă relații comerciale.",
  },
};

function normalize(pathname) {
  let p = pathname;
  if (p.endsWith("/index.html")) p = p.slice(0, -"index.html".length);
  if (!p.endsWith("/")) p += "/";
  return p;
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function buildTags(path, page) {
  const url = SITE + path;
  return [
    `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="FirmsFinder AI">`,
    `<meta property="og:locale" content="ro_RO">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.description)}">`,
    `<meta property="og:image" content="${OG_IMAGE}">`,
    `<meta property="og:image:alt" content="${esc(OG_IMAGE_ALT)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(page.title)}">`,
    `<meta name="twitter:description" content="${esc(page.description)}">`,
    `<meta name="twitter:image" content="${OG_IMAGE}">`,
  ].join("\n");
}

export default {
  async fetch(request) {
    const response = await fetch(request);
    if (request.method !== "GET") return response;

    const url = new URL(request.url);
    const path = normalize(url.pathname);
    const page = PAGES[path];
    const type = response.headers.get("content-type") || "";
    if (!page || response.status !== 200 || !type.includes("text/html")) {
      return response;
    }

    return new HTMLRewriter()
      .on('meta[name="description"]', {
        element(el) {
          el.setAttribute("content", page.description);
        },
      })
      .on("head", {
        element(el) {
          el.append(buildTags(path, page), { html: true });
        },
      })
      .transform(response);
  },
};
