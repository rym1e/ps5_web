# PS5 Reservation Web App

This repository hosts the source code for a lightweight reservation workflow that allows
customers to book hourly time slots to use a single PlayStation 5 console and upload
manual payment proofs. The project targets a **web deployment** built with Vue 3, with a
Go (Gin) + MySQL backend to be added later.

## Project structure

```
.
├── README.md            # Project overview (this file)
└── frontend/            # Web frontend implemented with Vite + Vue 3
```

> The backend implementation will be introduced in a later iteration once a Go/Gin
> scaffold is available.

## Requirements snapshot

The functional scope is derived from the "PS5 预约网页 — 需求文档 v0.1" and focuses on:

- **Users**: log in with WeChat, select a one-hour slot within the next 72 hours, create an
  order, upload payment proofs, and track reservation status.
- **Administrators**: review orders, validate manual payments, confirm or reject
  reservations, and manage basic configuration (QR code, pricing, slot hold duration).

Non-functional expectations include simple single-machine deployment, JWT-based
authentication, manual reconciliation of payments, and hourly slot granularity with
Beijing time as the canonical timezone.

## Frontend stack

The web client is implemented with the following tooling:

- [Vite](https://vitejs.dev/) for development/build tooling
- [Vue 3](https://vuejs.org/) with the Composition API
- [Vue Router](https://router.vuejs.org/) for page routing
- [Pinia](https://pinia.vuejs.org/) for state management
- [UnoCSS](https://unocss.dev/) utility-first styling (optional and can be swapped out)

The component tree mirrors the demand document's page list:

- Reservation dashboard (slot selection)
- Payment page (QR code, countdown, proof upload)
- Orders list
- Order detail view

## Getting started with the frontend

```bash
cd frontend
pnpm install     # or npm/yarn if preferred
pnpm dev         # starts Vite at http://localhost:5173
```

The frontend currently contains mocked service layers so it can run without a backend.
Once the Go/Gin backend is available, replace the mock adapters in `src/services` with
real API clients.

## Next steps

- Integrate the backend scaffold when it lands and wire the HTTP client to real APIs.
- Flesh out administrator-facing tooling after backend endpoints are stabilised.
- Add automated tests (unit & end-to-end) to guard critical reservation flows.

## License

This project is distributed under the MIT license. See `LICENSE` once added.
