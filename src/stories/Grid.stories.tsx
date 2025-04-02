import * as React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { Grid, GridItem } from "../components/layout/Grid";

const meta: Meta<typeof Grid> = {
  title: "Layout/Grid",
  component: Grid,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: `
The Grid component provides a flexible, responsive grid layout system.
It makes it easy to create consistent grid layouts that adapt to different screen sizes.
`
      }
    }
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Grid>;

const GridCell = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-blue-100 p-4 rounded-md border border-blue-200 flex items-center justify-center text-blue-800 font-medium">
    {children}
  </div>
);

export const Basic: Story = {
  args: {
    cols: { xs: 1, sm: 2, md: 3, lg: 4 },
    gap: "md",
  },
  render: (args) => (
    <Grid {...args}>
      <GridCell>Item 1</GridCell>
      <GridCell>Item 2</GridCell>
      <GridCell>Item 3</GridCell>
      <GridCell>Item 4</GridCell>
      <GridCell>Item 5</GridCell>
      <GridCell>Item 6</GridCell>
      <GridCell>Item 7</GridCell>
      <GridCell>Item 8</GridCell>
    </Grid>
  ),
};

export const DifferentGaps: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-2">No Gap</h3>
        <Grid cols={{ xs: 1, sm: 2, md: 4 }} gap="none">
          <GridCell>Item 1</GridCell>
          <GridCell>Item 2</GridCell>
          <GridCell>Item 3</GridCell>
          <GridCell>Item 4</GridCell>
        </Grid>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Small Gap</h3>
        <Grid cols={{ xs: 1, sm: 2, md: 4 }} gap="sm">
          <GridCell>Item 1</GridCell>
          <GridCell>Item 2</GridCell>
          <GridCell>Item 3</GridCell>
          <GridCell>Item 4</GridCell>
        </Grid>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Medium Gap</h3>
        <Grid cols={{ xs: 1, sm: 2, md: 4 }} gap="md">
          <GridCell>Item 1</GridCell>
          <GridCell>Item 2</GridCell>
          <GridCell>Item 3</GridCell>
          <GridCell>Item 4</GridCell>
        </Grid>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Large Gap</h3>
        <Grid cols={{ xs: 1, sm: 2, md: 4 }} gap="lg">
          <GridCell>Item 1</GridCell>
          <GridCell>Item 2</GridCell>
          <GridCell>Item 3</GridCell>
          <GridCell>Item 4</GridCell>
        </Grid>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-2">Extra Large Gap</h3>
        <Grid cols={{ xs: 1, sm: 2, md: 4 }} gap="xl">
          <GridCell>Item 1</GridCell>
          <GridCell>Item 2</GridCell>
          <GridCell>Item 3</GridCell>
          <GridCell>Item 4</GridCell>
        </Grid>
      </div>
    </div>
  ),
};

export const WithGridItems: Story = {
  args: {
    cols: { xs: 1, sm: 2, md: 3, lg: 4 },
    gap: "md",
  },
  render: (args) => (
    <Grid {...args}>
      <GridItem span={{ xs: 1, md: 2, lg: 2 }}>
        <GridCell>Spans 2 columns on medium and large screens</GridCell>
      </GridItem>
      <GridCell>Regular item</GridCell>
      <GridCell>Regular item</GridCell>
      <GridItem span={{ xs: 1, lg: 2 }}>
        <GridCell>Spans 2 columns on large screens</GridCell>
      </GridItem>
      <GridItem span={{ xs: 1, md: 3, lg: 4 }}>
        <GridCell>Full width on medium and large screens</GridCell>
      </GridItem>
    </Grid>
  ),
};

export const ResponsiveGrid: Story = {
  args: {},
  render: () => (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        Resize the browser window to see how the grid responds to different screen sizes.
        The number of columns changes at different breakpoints.
      </p>
      
      <Grid cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, "2xl": 6 }} gap="md">
        {Array.from({ length: 12 }).map((_, i) => (
          <GridCell key={i}>Item {i + 1}</GridCell>
        ))}
      </Grid>
    </div>
  ),
}; 