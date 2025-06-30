# Klusjes v2 - Taak Management App

Een moderne React-applicatie voor het beheren van klusjes per kamer. Gebouwd met Next.js 15, React 19, TypeScript en Tailwind CSS.

## ✨ Features

- **Kamer-gebaseerd organiseren**: Beheer taken per kamer in je huis
- **Visuele kaarten**: Overzichtelijke cards met statistieken per kamer  
- **Prioriteiten**: Laag, middel en hoge prioriteit voor taken
- **Status tracking**: Todo, bezig en afgerond
- **Moderne UI**: Clean design met hover effecten en smooth transitions
- **Responsive**: Werkt perfect op desktop, tablet en mobile

## 🚀 Snel starten

### Installatie

```bash
# Dependencies installeren
npm install

# Development server starten
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

### Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # Code linting
npm run type-check # TypeScript checking
```

## 📱 Hoe te gebruiken

1. **Kamer cards**: Elke kamer heeft een eigen card met statistieken
2. **Klusje toevoegen**: Klik op de + knop in een kamer of gebruik de hoofdknop
3. **Status wijzigen**: Klik op een klusje om de status te wijzigen (todo → bezig → klaar)
4. **Prioriteiten**: Gebruik kleur coding voor urgentie
5. **Overzicht**: Onderaan vind je totaal statistieken

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19.0 met nieuwe features
- **TypeScript**: Voor type safety
- **Styling**: Tailwind CSS + Radix UI
- **Icons**: Lucide React
- **State**: React useState (lokaal)

## 📁 Project Structuur

```
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── room-card.tsx     # Room display card
│   └── task-form.tsx     # Task creation form
├── lib/                  # Utilities
│   └── utils.ts         # Helper functions
└── types/               # TypeScript types
    └── index.ts        # App type definitions
```

## 🎨 Design Systeem

De app gebruikt een consistent design systeem met:
- Moderne shadcn/ui componenten
- Tailwind CSS voor styling
- Responsive grid layouts
- Hover states en transitions
- Kleur coding voor prioriteiten
- Nederlandse localisatie

## 🔮 Toekomstige Features

- [ ] Persistente data opslag (localStorage/database)
- [ ] Deadlines en notificaties
- [ ] Kamer iconen en aanpassingen
- [ ] Export/import functionaliteit
- [ ] Dark mode ondersteuning
- [ ] Progressive Web App (PWA)