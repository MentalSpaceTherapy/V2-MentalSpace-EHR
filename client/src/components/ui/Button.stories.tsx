import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { 
  ArrowRightIcon, 
  PlusIcon, 
  CheckIcon, 
  XIcon, 
  SettingsIcon 
} from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['solid', 'outline', 'ghost', 'link'],
      description: 'The visual style of the button',
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'success', 'warning', 'error', 'neutral'],
      description: 'The color scheme of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The size of the button',
    },
    isFullWidth: {
      control: { type: 'boolean' },
      description: 'Whether the button should take up the full width of its container',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the button is in a loading state',
    },
    loadingText: {
      control: { type: 'text' },
      description: 'Text to display when the button is loading',
    },
    leadingIcon: {
      control: { type: 'select' },
      options: ['none', 'arrow', 'plus', 'check', 'x', 'settings'],
      description: 'Icon displayed before the button text',
      mapping: {
        none: undefined,
        arrow: <ArrowRightIcon size={16} />,
        plus: <PlusIcon size={16} />,
        check: <CheckIcon size={16} />,
        x: <XIcon size={16} />,
        settings: <SettingsIcon size={16} />,
      },
    },
    trailingIcon: {
      control: { type: 'select' },
      options: ['none', 'arrow', 'plus', 'check', 'x', 'settings'],
      description: 'Icon displayed after the button text',
      mapping: {
        none: undefined,
        arrow: <ArrowRightIcon size={16} />,
        plus: <PlusIcon size={16} />,
        check: <CheckIcon size={16} />,
        x: <XIcon size={16} />,
        settings: <SettingsIcon size={16} />,
      },
    },
  },
  args: {
    children: 'Button',
    variant: 'solid',
    color: 'primary',
    size: 'md',
    isFullWidth: false,
    isLoading: false,
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * Default button with primary color and solid variant
 */
export const Default: Story = {};

/**
 * Buttons with different color variations
 */
export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="success">Success</Button>
      <Button color="warning">Warning</Button>
      <Button color="error">Error</Button>
      <Button color="neutral">Neutral</Button>
    </div>
  ),
};

/**
 * Buttons with different variants
 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="solid">Solid</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

/**
 * Buttons in different sizes
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

/**
 * Button in a disabled state
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/**
 * Button in a loading state
 */
export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

/**
 * Button with loading text
 */
export const LoadingWithText: Story = {
  args: {
    isLoading: true,
    loadingText: 'Loading...',
  },
};

/**
 * Button with an icon before the text
 */
export const WithLeadingIcon: Story = {
  args: {
    leadingIcon: <PlusIcon size={16} />,
  },
};

/**
 * Button with an icon after the text
 */
export const WithTrailingIcon: Story = {
  args: {
    trailingIcon: <ArrowRightIcon size={16} />,
  },
};

/**
 * Full-width button that takes up the entire width of its container
 */
export const FullWidth: Story = {
  args: {
    isFullWidth: true,
  },
  parameters: {
    layout: 'padded',
  },
};

/**
 * All variants of buttons showing different states
 */
export const ButtonGrid: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-4 text-lg font-bold">Solid Buttons</div>
      <Button variant="solid" color="primary">Primary</Button>
      <Button variant="solid" color="secondary">Secondary</Button>
      <Button variant="solid" color="success">Success</Button>
      <Button variant="solid" color="error">Error</Button>
      
      <div className="col-span-4 text-lg font-bold">Outline Buttons</div>
      <Button variant="outline" color="primary">Primary</Button>
      <Button variant="outline" color="secondary">Secondary</Button>
      <Button variant="outline" color="success">Success</Button>
      <Button variant="outline" color="error">Error</Button>
      
      <div className="col-span-4 text-lg font-bold">Ghost Buttons</div>
      <Button variant="ghost" color="primary">Primary</Button>
      <Button variant="ghost" color="secondary">Secondary</Button>
      <Button variant="ghost" color="success">Success</Button>
      <Button variant="ghost" color="error">Error</Button>
      
      <div className="col-span-4 text-lg font-bold">Link Buttons</div>
      <Button variant="link" color="primary">Primary</Button>
      <Button variant="link" color="secondary">Secondary</Button>
      <Button variant="link" color="success">Success</Button>
      <Button variant="link" color="error">Error</Button>
      
      <div className="col-span-4 text-lg font-bold">States</div>
      <Button disabled>Disabled</Button>
      <Button isLoading>Loading</Button>
      <Button leadingIcon={<PlusIcon size={16} />}>With Icon</Button>
      <Button variant="outline" color="success" trailingIcon={<CheckIcon size={16} />}>Success</Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
}; 