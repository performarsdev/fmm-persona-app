---
inclusion: auto
description: Project structure, directory layout, and naming conventions for HubSpot app components
---

# Project Structure

## Directory Layout

```
/
├── hsproject.json              # Project configuration
├── src/
│   └── app/
│       ├── app-hsmeta.json    # App-level config (auth, scopes, URLs)
│       ├── cards/              # CRM card components
│       │   ├── *.jsx          # React components
│       │   ├── *-hsmeta.json  # Card metadata
│       │   └── package.json   # React dependencies
│       ├── webhooks/
│       │   └── webhooks-hsmeta.json  # Webhook subscriptions
│       └── workflow-actions/
│           └── *-hsmeta.json  # Workflow action definitions
```

## Metadata Architecture

All components use `-hsmeta.json` files for configuration:

- `app-hsmeta.json` - Defines authentication, OAuth scopes, and permitted URLs
- Card metadata - Defines entrypoint, location, and target object types
- Webhook metadata - Defines subscriptions and target URLs
- Workflow action metadata - Defines action URLs, input fields, and supported objects

## Component Organization

### CRM Cards
- Location: `src/app/cards/`
- Each card requires: `.jsx` file + `-hsmeta.json` file
- Cards use `hubspot.extend()` to register with the platform

### Webhooks
- Location: `src/app/webhooks/`
- Single `webhooks-hsmeta.json` contains all subscriptions
- Supports both modern (`object.*`) and legacy (`contact.*`) subscription types

### Workflow Actions
- Location: `src/app/workflow-actions/`
- Each action defined in separate `-hsmeta.json` file
- Input fields support types: string, number, enumeration, referencedObjectType

## Naming Conventions

- Metadata files: `{component-name}-hsmeta.json`
- UIDs: Use snake_case (e.g., `example_app_card_private_static`)
- Component names: Use descriptive names in metadata `config.name`
