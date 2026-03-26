# المستشار AI — Project Documentation

## Overview

A professional Arabic AI consultant chat application built with a full-stack monorepo architecture. Features a ChatGPT-like interface, streaming AI responses, conversation history, and a protected admin dashboard.

## Architecture

### Monorepo Structure
- **`artifacts/al-mustashar/`** — React + Vite frontend (main app, served at `/`)
- **`artifacts/api-server/`** — Express 5 API server (served at `/api`)
- **`lib/db/`** — Drizzle ORM with PostgreSQL (conversations + messages tables)
- **`lib/api-spec/`** — OpenAPI 3.1 spec (single source of truth)
- **`lib/api-zod/`** — Generated Zod validation schemas
- **`lib/api-client-react/`** — Generated React Query hooks
- **`lib/integrations-openai-ai-server/`** — Server-side OpenAI integration

## Features

### Chat Interface (`/`)
- RTL Arabic UI with dark mode professional design
- Sidebar with conversation history and new chat button
- Streaming AI responses via SSE (Server-Sent Events)
- Message bubbles: user on right, AI on left
- Loading indicators, auto-scroll, empty message blocking
- Clear conversation and admin panel access

### Admin Panel
- **Login** (`/admin-login`): Email + password authentication
  - Admin email: `bishoysamy390@gmail.com`
  - Admin password: `admin123`
- **Dashboard** (`/admin`): Protected with Bearer token
  - Stats: total conversations, messages, today's activity
  - Full conversation list with delete capability

## Tech Stack

### Frontend
- React 18 + Vite + TypeScript
- Tailwind CSS v4 with dark mode
- Framer Motion (animations)
- Lucide React (icons)
- React Markdown + remark-gfm
- Wouter (routing)

### Backend
- Express 5 (TypeScript)
- OpenAI gpt-5.2 via Replit AI Integrations (no API key needed)
- Drizzle ORM + PostgreSQL
- SSE for streaming responses

### AI Integration
- Uses Replit AI Integrations for OpenAI access (auto-provisioned)
- System prompt in Arabic for consultant persona
- Streaming chat completions with history context

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/openai/conversations` | List conversations |
| POST | `/api/openai/conversations` | Create conversation |
| GET | `/api/openai/conversations/:id` | Get conversation + messages |
| DELETE | `/api/openai/conversations/:id` | Delete conversation |
| POST | `/api/openai/conversations/:id/messages` | Send message (SSE stream) |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/verify` | Verify admin token |
| GET | `/api/admin/stats` | Get dashboard stats |
| GET | `/api/admin/conversations` | List all conversations (admin) |
| DELETE | `/api/admin/conversations/:id` | Delete any conversation (admin) |

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (auto-provisioned)
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — OpenAI proxy URL (auto-provisioned)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — OpenAI proxy key (auto-provisioned)
