# Blog Platform

A full-stack blogging platform built with Next.js and Supabase.

## Live Demo


## GitHub Repository
https://github.com/yanshikasingh055-spec/blog-platform

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend + Backend | Next.js 15 (App Router) |
| Authentication | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| Storage | Supabase Storage |
| AI Integration | Cohere API (command-a-03-2025) |
| Styling | Tailwind CSS |
| Version Control | Git + GitHub |
| Deployment | Vercel |
| AI Coding Tool | Cursor |

---

 Project Setup Instructions

 Prerequisites
- Node.js v18 or higher
- A Supabase account (free) — supabase.com
- A Cohere account (free) — cohere.com

Step- 1. Clone the Repository
```bash
git clone https://github.com/yanshikasingh055-spec/blog-platform.git
cd blog-platform
```

Step- 2. Install Dependencies
```bash
npm install
```

Step- 3. Set Up Supabase
1. Go to supabase.com and create a new project
2. Go to SQL Editor and run the following:

```sql
create table public.users (
  id uuid references auth.users(id) primary key,
  name text not null,
  email text not null,
  role text not null default 'viewer'
    check (role in ('viewer', 'author', 'admin'))
);

create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  image_url text,
  summary text,
  author_id uuid references public.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  comment_text text not null,
  created_at timestamp with time zone default now()
);

alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
```

3. Create a storage bucket called `post-images` and set it to Public

Step- 4. Configure Environment Variables
Create a `.env.local` file in the root of the project:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
COHERE_API_KEY=your_cohere_api_key

Step-5. How to Run the Project Locally
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

---

 Database Schema

| Table | Fields |
|-------|--------|
| users | id, name, email, role |
| posts | id, title, body, image_url, summary, author_id, created_at |
| comments | id, post_id, user_id, comment_text, created_at |

---

 User Roles

| Role | Permissions |
|------|------------|
| Viewer | View posts, read summaries, comment on posts |
| Author | Create posts, edit/delete own posts, comment |
| Admin | Edit/delete any post, monitor comments |

---

 AI Integration

When a new post is created:
1. Post content is sent to Cohere API
2. Cohere generates a 2-3 sentence summary
3. Summary is stored in the `posts` table in Supabase
4. Summary is displayed on homepage listing and individual post page

Cost optimization: Summary is generated **only once** at post 
creation and stored in the database to avoid repeated API calls.

---

 Deployment Steps

 Deploy on Vercel
1. Push your code to GitHub
2. Go to vercel.com and sign in with GitHub
3. Click "Add New Project" and import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `COHERE_API_KEY`
5. Click Deploy
6. Your app will be live at a vercel.app URL

---

## AI Coding Tool Used

**Cursor** was used as the primary AI coding assistant.

**Why Cursor:** It understands the entire codebase context and 
is optimized for Next.js development. It helped generate 
components, write Supabase queries, and debug issues faster.

**How it helped:**
- Generated authentication pages
- Suggested correct RLS policy syntax
- Helped debug API route issues
- Autocompleted Tailwind CSS classes

---

 Submission Explanation

AI Tools
Used **Cursor** AI coding assistant. Chosen for its deep 
codebase understanding and Next.js 15 App Router expertise.

Feature Logic
- **Authentication:** Users sign up with email/password via 
  Supabase Auth. A profile row is inserted into the users 
  table with the selected role on signup.
- **Role-based access:** Role is fetched from users table 
  on login. UI elements are shown/hidden based on role. 
  Supabase RLS policies enforce security at database level.
- **Post creation:** Author fills title, body, optional image. 
  Image uploads to Supabase Storage. Content sent to Cohere 
  API for summary. Post saved with summary to database.
- **AI summary flow:** POST to /api/summarize → Cohere API 
  → summary returned → stored in posts.summary → displayed 
  on homepage cards and post detail page.

Cost Optimization
- Summary generated only once at post creation time
- Stored in database to avoid repeated API calls
- Text trimmed to 2000 characters before sending to reduce tokens
- Fallback summary used if API fails

Development Understanding
- **Bug fixed:** Supabase RLS policies were blocking inserts. 
  Fixed by creating explicit policies for each table operation.
- **Key decision:** Used Next.js API route for Cohere API call 
  to keep the API key secure on the server side, never 
  exposing it to the browser.