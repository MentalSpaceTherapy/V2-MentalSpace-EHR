import { Meta, StoryObj } from "@storybook/react";
import { z } from "zod";
import { Form } from "../components/form/Form";
import { FormField } from "../components/form/FormField";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { EmailField, PasswordField, PhoneField } from "../components/form/InputField";

const meta: Meta<typeof Form> = {
  title: "Forms/Form",
  component: Form,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
Form is a component that integrates Zod validation with React Hook Form.
It provides a simple way to create forms with validation, error messages, and form submission.
`
      }
    }
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Form>;

// Simple login form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const Login: Story = {
  args: {
    schema: loginSchema,
    onSubmit: (data) => {
      console.log("Form submitted", data);
      alert(JSON.stringify(data, null, 2));
    },
  },
  render: (args) => (
    <Form {...args} className="space-y-4 w-96 p-6 bg-white rounded-lg border shadow-sm">
      {({ isSubmitting }) => (
        <>
          <h2 className="text-xl font-semibold text-gray-900">Login</h2>
          
          <FormField
            name="email"
            label="Email Address"
            isRequired
          >
            <Input type="email" />
          </FormField>
          
          <FormField
            name="password"
            label="Password"
            isRequired
          >
            <Input type="password" />
          </FormField>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </>
      )}
    </Form>
  ),
};

// Registration form schema
const registrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const Registration: Story = {
  args: {
    schema: registrationSchema,
    onSubmit: (data) => {
      console.log("Form submitted", data);
      alert(JSON.stringify(data, null, 2));
    },
  },
  render: (args) => (
    <Form {...args} className="space-y-6 w-[500px] p-8 bg-white rounded-lg border shadow-sm">
      {({ isSubmitting, isValid }) => (
        <>
          <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
          <p className="text-sm text-gray-500">Please fill out the form below to create your account.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              name="firstName"
              label="First Name"
              isRequired
            >
              <Input />
            </FormField>
            
            <FormField
              name="lastName"
              label="Last Name"
              isRequired
            >
              <Input />
            </FormField>
          </div>
          
          <EmailField
            name="email"
            label="Email Address"
            isRequired
            helpText="We'll never share your email with anyone else."
          />
          
          <PhoneField
            name="phone"
            label="Phone Number"
            isRequired
            helpText="Please enter your 10-digit phone number."
          />
          
          <PasswordField
            name="password"
            label="Password"
            isRequired
            helpText="Password must be at least 8 characters long."
          />
          
          <FormField
            name="confirmPassword"
            label="Confirm Password"
            isRequired
          >
            <Input type="password" />
          </FormField>
          
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full"
          >
            {isSubmitting ? "Creating Account..." : "Create Account"}
          </Button>
        </>
      )}
    </Form>
  ),
}; 