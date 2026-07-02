# Přehled názvů nebankovních věřitelů

Statická verze pro GitHub Pages / vlastní doménu.

## Struktura

- `index.html` – přesměrování na `/veritele/informacnipomucka/`
- `veritele/informacnipomucka/index.html` – stránka
- `veritele/informacnipomucka/css/style.css` – vzhled
- `veritele/informacnipomucka/js/app.js` – logika vyhledávání, kopírování a načítání dat
- `veritele/informacnipomucka/data/veritele.json` – data převedená z XLSX

## Cílová URL

Po nahrání do GitHub repozitáře poběží dočasně zde:

`https://filipsworkspace-dev.github.io/muj-web/veritele/informacnipomucka/`

Po napojení domény na stejný Pages web může běžet zde:

`https://www.aksirkova.cz/veritele/informacnipomucka/`

Pozor: DNS umí směrovat hostname (`www.aksirkova.cz`), ne samostatnou cestu `/veritele/informacnipomucka/`.
Pokud už `www.aksirkova.cz` hostuje jiný web, jednodušší a bezpečnější je použít subdoménu, např. `veritele.aksirkova.cz`.

## Data

Převedeno 43 záznamů z tabulky `Veritele`.

Aktualizace dat: upravit `veritele/informacnipomucka/data/veritele.json` a commitnout změny.
