---
inclusion: auto
description: Tech stack, build system, and common development commands
---

# Tech Stack

## Build System

HubSpot CLI (`@hubspot/cli`) - manages development, deployment, and project configuration

## Frontend Stack

- React 18.2.0
- @hubspot/ui-extensions (latest) - HubSpot's UI component library
- TypeScript 5.3.3 (dev dependency)

## Common Commands

### Development
```bash
hs project dev
```
Starts local development server with hot reload. Follow CLI prompts to connect to your HubSpot account.

### Package Management
```bash
npm install
```
Run in `src/app/cards/` directory to install dependencies for CRM card components.

## Configuration Files

- `hsproject.json` - Project-level configuration (name, srcDir, platformVersion)
- `*-hsmeta.json` - Component metadata files that define app structure and behavior
- `package.json` - Located in `src/app/cards/` for React dependencies

## API Integration

All external API calls must be to permitted URLs defined in `src/app/app-hsmeta.json` under `permittedUrls.fetch`.
