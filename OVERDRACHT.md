# Klusjes v2 – Overdrachtsdocument

> Laatste update: <!-- TODO: vul datum automatisch in CI/CD of handmatig -->

## 📦 Projectoverzicht

Klusjes v2 is een Next.js 15 (App Router) applicatie waarmee gebruikers kamers (rooms) en bijbehorende taken (tasks) kunnen beheren. De interface is geïnspireerd op een Figma‐design en is geoptimaliseerd voor mobiel gebruik (PWA) – inclusief swipe‐gestures en offline‐ondersteuning.

Belangrijkste features:

1. **Rooms & Tasks**  
   – Expandable room cards met kleurenaccent.  
   – Takenlijst met swipe‐acties (rechts → status-progressie, links → verwijderen).  
   – Prioriteitsvlag met 🏆 badge en gouden accentkleur.
2. **CRUD‐formulieren**  
   – `RoomForm` (<kbd>+</kbd> knop) en `TaskForm`/`TaskEditor` (modal) voor aanmaken/bewerken.  
   – Random kleur‐preset toewijzing bij nieuwe rooms.
3. **Progress & Stats**  
   – `TaskProgressBar` per kamer.  
   – Dashboardtegels (Total, In Progress, Waiting, Completed, Priority).
4. **UI Stack**  
   – React 19 RSC met minimaal `"use client"`‐gebruik.  
   – Shadcn UI + Radix UI, gestyled met Tailwind CSS (dark‐theme tokens).  
   – Custom reusable components in `components/ui`.
5. **PWA**  
   – `manifest.json`, service worker (Workbox/handmatig) & icons tot 512 px.  
   – Automatische registratie in `<app/page.tsx>`.
6. **Tooling**  
   – TypeScript strict, ESLint, Prettier.  
   – Turbopack (`next dev --turbo`).

---

## 🚀 Snelstart

```bash
# 1. Dependencies installeren
npm install

# 2. Development server (Turbopack) – opent eerste vrije poort
npm run dev

# 3. Production build + start
npm run build && npm start
```

Voor Windows Powershell: pad‐issues vermijden via `Set-ExecutionPolicy -Scope Process Bypass` indien scripts blokkeren.

---

## 📂 Belangrijke mappen & bestanden

- `app/`  
  ├ `layout.tsx` – root‐layout met theming & toasters  
  └ `page.tsx`  – hoofdscherm met rooms & stats
- `components/`  
  ├ `room-card.tsx` – uitklapbare kaart, detecteert swipe‐gestures  
  ├ `room-form.tsx` – formulier in dialog  
  ├ `task-*`        – task‐gerelateerde UI  
  └ `ui/`           – Shadcn‐achtige building blocks (Button, Card, Dialog …)
- `lib/`  
  ├ `hooks.ts`  – custom hooks (useSwipe, useLocalStorage e.d.)  
  └ `utils.ts`  – helpers (kleur‐generatie, status‐transities)
- `public/` – PWA icons & manifest
- `tailwind.config.ts` – design‐tokens (monochroom + status‐kleuren)

Volledige projectboom staat in het chat‐log snapshot.

---

## 🏗️ Architectuurkeuzes

1. **React Server Components** worden ingezet voor statische/async data loading; interactieve onderdelen zijn client‐components met `"use client"`.
2. **State‐beheer** gebeurt lokaal via React hooks; voor gedeelde state kan Context/Reducer worden toegevoegd. Nu nog vooral demo/mock‐data.
3. **Type‐safety** met interfaces i.p.v. types, geen enums (const maps).
4. **Accessibility**: Radix primitives + aria‐props. Swipe‐gestures fallback via knoppen voor keyboard.
5. **Performance**: lazy import van modals, memoization waar nodig.

---

## 🔧 TODO / Next Steps

- 🔌 **Persistente data** (bijv. SQLite + Drizzle ORM of Supabase).  
- ☁️ **Auth** toevoegen (NextAuth.js of Clerk) voor multi‐user.  
- 🔄 **Service Worker optimalisatie** – precache strategiëen updaten.  
- 🧪 **Tests** (Jest + React Testing Library, e2e – Playwright).  
- ⚙️ **CI/CD** (GitHub Actions) + automatiseren datum in dit document.  
- 🌐 **i18n** (next-international) – NL/EN toggle.

---

## ℹ️ Belangrijke beslissingen

| Onderwerp            | Beslissing                                    | Motivering |
|----------------------|-----------------------------------------------|------------|
| Styling              | Tailwind CSS + Radix tokens                   | Snel & consistent, theming makkelijk |
| Component lib        | Shadcn UI generator                           | Low‐level controle + accessiblity |
| Swipe gestures       | Eigen hook (`useSwipe`)                       | Volledige controle i.p.v. zware library |
| Prioriteitssysteem   | Boolean `priority`                            | Vermijdt over-engineering |
| PWA                  | Handmatige SW + Workbox planning              | Maximale grip op caching |

---

## 📝 Contact & Credits

Auteur: Kevin Mulder  
Co‐piloot: *Ellie* (AI)  
Figma design: *link toevoegen*

Veel succes en bij vragen: open een nieuwe chat ✌️ 