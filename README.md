# EduCoder Coding Hub

A production-style React + TypeScript creative business website and management platform. It runs as a complete local demo using browser `localStorage`, with a Supabase-ready schema and environment file included.

## Features
- Premium dark creator studio design with responsive navigation, glass cards, gradients and modals.
- Public landing page, showcase, services, team and enquiry form.
- Working showcase search, category filters, featured projects, detail modal and image lightbox.
- Local persistent admin dashboard with protected demo login.
- CRUD for projects, services, team, content items and enquiry workflow/status management.
- Image upload previews with type and size validation.
- Visual project timeline and live dashboard stats.
- Settings for brand details, theme, currency, defaults and notifications.

## Local setup
```bash
cd C:\Users\DELL\manpreet-creative-hub
npm install
npm run dev
```
Open the local URL printed by Vite.

## Admin login
No default admin email or password is published in this repository.

On first local run, open the Admin page and create your private browser-local admin account. For production, connect Supabase Auth and store credentials server-side only.

## Database setup
1. Create a Supabase project.
2. Run `database/schema.sql` in the Supabase SQL editor.
3. Create a Storage bucket named `creative-assets`.
4. Copy `.env.example` to `.env` and fill your Supabase URL and anon key.
5. Enable RLS policies:
   - Public: read published projects, project images, active services/team, settings.
   - Public: insert enquiries only.
   - Admin role: full CRUD on management tables.

## Deployment
```bash
npm run build
```
Deploy the generated `dist` folder to Vercel, Netlify, Cloudflare Pages or any static host. Add Supabase environment variables in the hosting dashboard before enabling a real Supabase client.

## Notes
- Demo data is editable and persists after refresh in browser storage.
- Use Settings → Reset demo data to clear local data.
- No fake real testimonials are included.

