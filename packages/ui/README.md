# @adaptiveworx/ui

Shared UI components library for ModMe monorepo.

## Components

### Generative UI (GenUI)

AI-generated dashboard components built with Material-UI:

- **StatCard** - KPI metric cards with trend indicators
- **DataTable** - Data grid with sorting and pagination
- **ChartCard** - Chart wrapper for visualizations

```tsx
import { StatCard, DataTable, ChartCard } from '@adaptiveworx/ui/genui';

<StatCard 
  title="Revenue" 
  value={120000} 
  trend="+12%" 
  trendDirection="up" 
/>

<DataTable 
  columns={['Name', 'Email', 'Role']}
  data={users}
/>

<ChartCard 
  title="Growth" 
  chartType="line"
  data={metrics}
/>
```

### Accessible Components (React Aria)

Enterprise-grade accessible UI built on Adobe React Spectrum:

- **ThemeProvider** - Theme and provider wrapper
- **Button** - Accessible button with keyboard support
- **TextField** - Text input with validation and labels
- **ComboBox** - Autocomplete dropdown with keyboard navigation

```tsx
import { ThemeProvider, Button, TextField, ComboBox, Item } from '@adaptiveworx/ui/aria';

<ThemeProvider colorScheme="dark">
  <Button variant="cta" onPress={() => console.log('clicked')}>
    Click Me
  </Button>
  
  <TextField 
    label="Email" 
    type="email"
    isRequired
  />
  
  <ComboBox label="Select City">
    <Item key="london">London</Item>
    <Item key="paris">Paris</Item>
  </ComboBox>
</ThemeProvider>
```

## Installation

This package is part of the monorepo. Install dependencies at root:

```bash
yarn install
```

## Development

Run in development mode:

```bash
yarn dev
```

## Building

Build the package:

```bash
yarn build
```

## Type Checking

Run TypeScript type checks:

```bash
yarn type-check
```

## Linting

Check code quality:

```bash
yarn lint:check
```

## Architecture

### GenUI Components

- **Purpose**: AI-generated dashboard elements
- **Stack**: React + Material-UI
- **Use case**: Dynamic interfaces created by Python ADK agent
- **Location**: `src/components/genui/`

### Aria Components

- **Purpose**: Enterprise accessible UI
- **Stack**: React + Adobe React Spectrum
- **Use case**: Standard forms, controls, layouts
- **Location**: `src/components/aria/`

### Integration

Both component libraries can be used together. GenUI components handle AI-generated dynamic content, while Aria components provide consistent accessible controls.

```tsx
import { ThemeProvider } from '@adaptiveworx/ui/aria';
import { StatCard } from '@adaptiveworx/ui/genui';

<ThemeProvider colorScheme="light">
  <div>
    {/* AI-generated dashboard */}
    <StatCard title="Users" value={1500} />
    
    {/* Traditional accessible form */}
    <TextField label="Name" />
    <Button variant="primary">Submit</Button>
  </div>
</ThemeProvider>
```

## Theme Compatibility

GenUI components use Material-UI theming, while Aria components use React Spectrum themes. Both support light/dark modes and can coexist in the same application.

## License

See LICENSE in repository root.
