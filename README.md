# FlowSphere AI

FlowSphere AI is a full-stack workflow automation platform for designing, running, and monitoring AI-driven flows. The project combines a Next.js frontend, an Express backend, Prisma, Redis, and a queue-based execution worker to support multi-step workflows and integrations.

## Overview

- Visual workflow builder experience
- AI-assisted automation and execution orchestration
- Authentication, organization management, and API keys
- WebSocket-based execution updates and notifications
- Docker-based local development setup

## Tech Stack

- Frontend: Next.js 15, React 19, Tailwind CSS, Zustand
- Backend: Express, TypeScript, Prisma, Socket.IO, Bull/Redis
- Database: PostgreSQL
- Dev tooling: pnpm, Turbo, Docker Compose

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop (optional, for local infrastructure)

### Install dependencies

```bash
pnpm install
```

### Start local infrastructure

```bash
docker compose up -d postgres redis
```

### Generate Prisma client

```bash
pnpm db:generate
```

### Run the app

```bash
pnpm dev
```

This will start the frontend and backend services for local development.

## Environment Variables

Copy the example file and adjust values as needed:

```bash
cp .env.example .env
```

## Codespaces

This repository includes a GitHub Codespaces dev container for a secure, configurable development environment. Open the repository in Codespaces and the environment will be provisioned automatically.

## Useful Scripts

```bash
pnpm build
pnpm lint
pnpm type-check
pnpm db:migrate
pnpm db:seed
```

## Project Structure

- frontend/: Next.js application
- backend/: Express API and workers
- prisma/: Prisma schema and seed data
- packages/: shared types and utilities

## License

This project is currently unlicensed. Add a license file if you intend to publish or distribute it publicly.
