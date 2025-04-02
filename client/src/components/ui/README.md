# MentalSpace EHR Component Library

A comprehensive UI component library for the MentalSpace EHR system, built with React, TypeScript, and Tailwind CSS.

## Installation

To set up Storybook for component development and documentation, run:

```bash
# Install dependencies if needed
npm install

# Install Storybook
npx storybook@latest init

# Start Storybook
npm run storybook
```

## Design System

The component library is built on a consistent design system that includes:

- **Colors**: Primary, secondary, success, warning, error, and neutral color palettes
- **Typography**: Standardized font sizes, weights, and families
- **Spacing**: Consistent spacing scale
- **Shadows and Elevation**: Standardized shadow styles
- **Border Radius**: Consistent rounding options
- **Components**: A set of reusable UI components with consistent APIs

## Core Components

### Layout Components

- `Card`: Container for grouping related content
- `Container`: Responsive width container
- `Grid`: CSS Grid-based layout system
- `Stack`: Vertical or horizontal stacking

### Form Components

- `Button`: Action triggers with multiple variants
- `Input`: Text inputs with validation
- `Select`: Dropdown selection
- `Checkbox`: Boolean selection
- `RadioGroup`: Single-option selection
- `Switch`: Toggle control
- `TextArea`: Multi-line text input

### Feedback Components

- `Alert`: Important messages
- `Toast`: Temporary notifications
- `Progress`: Process feedback
- `Spinner`: Loading indicator

### Navigation Components

- `Tabs`: Content organization
- `Breadcrumb`: Navigation hierarchy
- `Pagination`: Page navigation
- `Menu`: Dropdown navigation

## Usage

### Basic Component Usage

```jsx
import { Button, Input, Card } from '../components/ui';

function LoginForm() {
  return (
    <Card title="Login" padding="lg">
      <form className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          required
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          required
        />
        <Button isFullWidth>Log In</Button>
      </form>
    </Card>
  );
}
```

### Theme Provider

Wrap your application with the ThemeProvider to make the theme available to all components:

```jsx
import { ThemeProvider } from '../components/ui/ThemeProvider';

function App() {
  return (
    <ThemeProvider>
      {/* Your application */}
    </ThemeProvider>
  );
}
```

### Customizing Components

All components accept a `className` prop for custom styling:

```jsx
<Button className="my-custom-class">Custom Button</Button>
```

You can also customize the theme by passing a `themeOverride` to the ThemeProvider:

```jsx
<ThemeProvider 
  themeOverride={{
    colors: {
      primary: {
        500: '#1a73e8', // Custom primary color
      }
    }
  }}
>
  {/* Components will use the customized theme */}
</ThemeProvider>
```

## Development Guidelines

### Adding New Components

When adding new components:

1. Define the component's props in `types.ts`
2. Create the component with detailed JSDoc comments
3. Export the component from the respective file
4. Create a Storybook story to showcase the component

### Consistency Guidelines

- **Naming**: Follow the established naming conventions (e.g., `isLoading` instead of `loading`)
- **Props**: Align with the common prop interfaces defined in `types.ts`
- **Styling**: Use the theme values via the `useTheme` hook
- **Tests**: Write tests for all components

## Component Architecture

Components follow a consistent architecture:

1. **Props Interface**: Defined in `types.ts`
2. **Component Implementation**: Functional component with forwarded refs
3. **Styling**: Tailwind CSS classes with variants using `class-variance-authority`
4. **Documentation**: JSDoc comments with examples

## Accessibility

All components are built with accessibility in mind:

- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Semantic HTML
- Color contrast compliance

## Contributing

Please follow these steps when contributing:

1. Create a new branch for your changes
2. Run tests to ensure your changes don't break existing functionality
3. Document your changes in the component's JSDoc
4. Create or update Storybook stories
5. Submit a pull request

## License

This component library is for internal use in the MentalSpace EHR system. 