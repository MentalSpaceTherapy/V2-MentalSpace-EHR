import React from 'react';
import type { Preview } from '@storybook/react';
import { ThemeProvider } from '../client/src/components/ui/ThemeProvider';
import '../client/src/index.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#f8fafc',
        },
        {
          name: 'dark',
          value: '#1e293b',
        },
      ],
    },
    layout: 'centered',
    docs: {
      source: {
        language: 'tsx',
        excludeDecorators: true,
      },
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
};

export default preview; 