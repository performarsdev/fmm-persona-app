# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a HubSpot Developer Project template for building private apps with static authentication. It demonstrates how to create CRM extensions including cards, webhooks, and workflow actions.

## Development Commands

**Start local development server:**
```bash
hs project dev
```

This is the primary command for local development. It runs the HubSpot CLI development server, allowing you to test and iterate on your app components locally. Follow the CLI prompts to connect to your HubSpot account.

## Architecture

### Metadata-Driven Configuration

This project uses a metadata-driven architecture where each component is defined by a `-hsmeta.json` file:

- **`hsproject.json`** (root): Defines project name, source directory (`src`), and platform version
- **`app-hsmeta.json`**: Defines the private app configuration including:
  - Authentication type (`static`)
  - Required/optional OAuth scopes
  - Permitted URLs for fetch/iframe/img operations
  - App metadata (name, description, support info)

### Component Types

Each component type lives in its own directory under `src/app/` with a corresponding `-hsmeta.json` metadata file:

1. **Cards** (`src/app/cards/`):
   - React components rendered in CRM records
   - Use `@hubspot/ui-extensions` library for UI components
   - Each card has its own `package.json` with dependencies
   - Metadata defines entrypoint, location (`crm.record.tab`), and applicable object types
   - Entry point specified as relative path in metadata (e.g., `/app/cards/example-app-card.jsx`)

2. **Webhooks** (`src/app/webhooks/`):
   - Configured via `webhooks-hsmeta.json`
   - Supports multiple subscription types: `crmObjects`, `legacyCrmObjects`, `hubEvents`
   - Defines target URL and concurrent request limits

3. **Workflow Actions** (`src/app/workflow-actions/`):
   - Custom actions for HubSpot workflows
   - Metadata defines action URL, input fields, and labels
   - Input fields support various types (string, number, enumeration, object references)
   - Can specify required fields and supported value types

### Authentication & Permissions

The app uses static authentication (defined in `app-hsmeta.json`):
- `requiredScopes`: OAuth scopes that must be granted
- `optionalScopes`: Additional scopes users can optionally grant
- `permittedUrls.fetch`: Allowlisted domains for API calls

When adding new functionality that requires API access, update the `requiredScopes` array in `app-hsmeta.json`.

### Card Development

Cards are React components that:
- Import UI components from `@hubspot/ui-extensions`
- Use `hubspot.extend()` to register the component
- Have their own `package.json` in the cards directory for managing React/TypeScript dependencies
- Are referenced by their entrypoint path in the card's `-hsmeta.json` file

When creating new cards, you must create both the `.jsx` file and corresponding `-hsmeta.json` file with the correct `uid`, `type`, and `config`.
