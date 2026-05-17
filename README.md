# 🦷 DentalCloud Manager

> Zero-cost dental practice management software — built for a friend, learned by me.

---

## Why this exists

A dentist friend told me he was managing his appointment schedule on paper and sending WhatsApp reminders one by one, manually. He couldn't afford dental management software, and the existing solutions are either expensive or way too complex for a small practice.

So I built one.

This project is also my first real dive into full-stack JavaScript development. I come from the Python world — backend, APIs, security tools. Next.js, TypeScript and Supabase were new territory for me. I approached it the same way I approach everything: learning while building something that actually makes sense in the real world.

---

## What it does

- **Daily schedule** — appointment view with date navigation, status management (pending / confirmed / cancelled) and real-time updates
- **Patient management** — full patient profile with contact info, health insurance and medical alerts
- **Clinical records** — session logging with an interactive visual odontogram (32 teeth, FDI system)
- **WhatsApp reminders** — dynamic `wa.me` link generation with pre-filled messages, no API or extra cost
- **Authentication** — secure login with Supabase Auth and middleware-protected routes

Everything runs on the free tiers of Supabase and Vercel. Monthly maintenance cost: $0.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styles | Tailwind CSS |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Deploy | Vercel |

---

## Project structure

```
/app                → pages and routes (App Router)
/components         → reusable components
/components/ui      → base UI components
/lib/supabase.ts    → centralized Supabase client
/types              → domain TypeScript types
/hooks              → custom hooks
```

---

## Data model

```sql
patients           → id, name, phone, health_insurance, alerts, created_at
appointments       → id, patient_id, datetime, reason, status, created_at
clinical_records   → id, patient_id, date, description, odontogram_json, created_at
```

The odontogram is stored as `JSONB` in PostgreSQL — flexible and schema-free.

---

## Running locally

```bash
git clone https://github.com/ezequielranieri/dentalcloud
cd dentalcloud
npm install
```

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

Run the SQL migrations in Supabase and start the dev server:

```bash
npm run dev
```

---

## What I learned

I came from pure Python. This project forced me to understand React's mental model, Next.js 14's App Router, how server-side cookie-based authentication works, and how to design an interface that actually works on a dentist's phone in the middle of a consultation.

It's not perfect. There are things I'd do differently today. But it works, it solves a real problem, and it taught me more than any course ever could.

---

## Status

Actively used in a dental practice in Santa Fe, Argentina.

---

## License

MIT — do whatever you want with the code.

---

<p align="center">
  Built by <a href="https://github.com/ezequielranieri">Ezequiel Ranieri</a> — Santa Fe, Argentina
  <br>
  <sub>Self-taught. I solve real problems with code.</sub>
</p>
