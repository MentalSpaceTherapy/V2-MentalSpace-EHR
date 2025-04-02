import * as React from "react";
import { Meta, StoryObj } from "@storybook/react";
import { PageLayout, PageHeader, PageSection } from "../components/layout/PageLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const meta: Meta<typeof PageLayout> = {
  title: "Layout/PageLayout",
  component: PageLayout,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
PageLayout provides a consistent structure for pages in the application.
It includes a header and main content area with consistent spacing and styling.
`
      }
    }
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PageLayout>;

// Sample content for the story
const SampleContent = () => (
  <div className="space-y-6">
    <PageSection title="Patient Information">
      <div className="bg-gray-50 p-4 rounded-md text-center">
        Patient details would go here
      </div>
    </PageSection>
    
    <PageSection title="Recent Activity">
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md">Activity item 1</div>
        <div className="bg-gray-50 p-4 rounded-md">Activity item 2</div>
        <div className="bg-gray-50 p-4 rounded-md">Activity item 3</div>
      </div>
    </PageSection>
  </div>
);

export const Default: Story = {
  args: {
    header: (
      <PageHeader
        title="Patient Dashboard"
        description="View and manage patient information"
        actions={
          <Button>Add Patient</Button>
        }
      />
    ),
  },
  render: (args) => (
    <PageLayout {...args}>
      <SampleContent />
    </PageLayout>
  ),
};

export const WithoutHeader: Story = {
  args: {},
  render: (args) => (
    <PageLayout {...args}>
      <PageSection title="Patient Information">
        <div className="bg-gray-50 p-4 rounded-md text-center">
          Patient details would go here
        </div>
      </PageSection>
    </PageLayout>
  ),
};

export const FullWidth: Story = {
  args: {
    maxWidth: false,
    header: (
      <PageHeader
        title="Full Width Layout"
        description="This page stretches the full width of the screen"
      />
    ),
  },
  render: (args) => (
    <PageLayout {...args}>
      <PageSection title="Full Width Content">
        <div className="bg-gray-50 p-4 rounded-md text-center">
          This content takes up the full width of the viewport
        </div>
      </PageSection>
    </PageLayout>
  ),
};

export const NoPadding: Story = {
  args: {
    padding: false,
    header: (
      <PageHeader
        title="No Padding Layout"
        description="This page has no padding applied to the main content"
      />
    ),
  },
  render: (args) => (
    <PageLayout {...args}>
      <div className="bg-red-100 p-4 rounded-md">
        Content directly against the edges
      </div>
    </PageLayout>
  ),
}; 