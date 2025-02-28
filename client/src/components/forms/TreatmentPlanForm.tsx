import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Check, Save, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Schema for the treatment plan form
const treatmentPlanSchema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  diagnosisCode: z.string().min(1, "Diagnosis code is required"),
  diagnosisDescription: z.string().min(1, "Diagnosis description is required"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  reviewDate: z.date({
    required_error: "Review date is required",
  }),
  presentingProblems: z.string().min(10, "Please provide a detailed description"),
  goals: z.array(z.object({
    description: z.string().min(3, "Goal description is required"),
    objective: z.string().min(3, "Objective is required"),
    interventions: z.string().min(3, "Interventions are required"),
    targetDate: z.date(),
    status: z.enum(["Not Started", "In Progress", "Achieved", "Discontinued"])
  })).min(1, "At least one goal is required"),
  recommendedServices: z.array(z.string()).min(1, "At least one service is required"),
  treatmentFrequency: z.string().min(1, "Treatment frequency is required"),
  clientStrengths: z.string().min(10, "Please provide client strengths"),
  additionalNotes: z.string().optional(),
  clientAgreement: z.boolean().refine(val => val === true, {
    message: "Client must agree to the treatment plan",
  }),
});

type TreatmentPlanValues = z.infer<typeof treatmentPlanSchema>;

const treatmentServiceOptions = [
  { id: "individual", label: "Individual Therapy" },
  { id: "group", label: "Group Therapy" },
  { id: "family", label: "Family Therapy" },
  { id: "cbt", label: "Cognitive Behavioral Therapy" },
  { id: "dbt", label: "Dialectical Behavior Therapy" },
  { id: "medication", label: "Medication Management" },
  { id: "psychiatry", label: "Psychiatric Evaluation" },
  { id: "skills", label: "Skills Training" },
  { id: "case", label: "Case Management" },
];

export function TreatmentPlanForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goals, setGoals] = useState([
    {
      id: 1,
      description: "",
      objective: "",
      interventions: "",
      targetDate: new Date(),
      status: "Not Started" as const
    }
  ]);

  // Initialize the form with default values
  const form = useForm<TreatmentPlanValues>({
    resolver: zodResolver(treatmentPlanSchema),
    defaultValues: {
      clientName: "",
      dateOfBirth: new Date(),
      diagnosisCode: "",
      diagnosisDescription: "",
      startDate: new Date(),
      reviewDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      presentingProblems: "",
      goals: [
        {
          description: "",
          objective: "",
          interventions: "",
          targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          status: "Not Started"
        }
      ],
      recommendedServices: [],
      treatmentFrequency: "Weekly",
      clientStrengths: "",
      additionalNotes: "",
      clientAgreement: false,
    },
  });

  // Add a new goal
  const addGoal = () => {
    const newGoal = {
      id: goals.length + 1,
      description: "",
      objective: "",
      interventions: "",
      targetDate: new Date(),
      status: "Not Started" as const
    };
    
    setGoals([...goals, newGoal]);
    
    const currentGoals = form.getValues("goals");
    form.setValue("goals", [...currentGoals, {
      description: "",
      objective: "",
      interventions: "",
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      status: "Not Started"
    }]);
  };

  // Remove a goal
  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      const updatedGoals = [...goals];
      updatedGoals.splice(index, 1);
      setGoals(updatedGoals);
      
      const currentGoals = form.getValues("goals");
      const updatedFormGoals = [...currentGoals];
      updatedFormGoals.splice(index, 1);
      form.setValue("goals", updatedFormGoals);
    }
  };

  function onSubmit(data: TreatmentPlanValues) {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Treatment Plan Data:", data);
      
      toast({
        title: "Treatment Plan Saved",
        description: `Treatment plan for ${data.clientName} has been saved successfully.`,
      });
      
      setIsSubmitting(false);
    }, 1500);
  }

  // Helper function to format dates in inputs
  const formatDate = (date: Date) => {
    return format(date, "PPP");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Treatment Plan</h1>
        <p className="text-gray-600">Complete all sections to create a comprehensive treatment plan</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Basic information about the client</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="diagnosisCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., F41.1" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the ICD-10 or DSM-5 code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="diagnosisDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnosis Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Generalized Anxiety Disorder" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reviewDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Review Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                formatDate(field.value)
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Usually 90 days from start date
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle>Assessment</CardTitle>
              <CardDescription>Client's presenting problems and strengths</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="presentingProblems"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Presenting Problems</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the client's presenting problems, symptoms, and their impact on functioning"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clientStrengths"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Strengths and Resources</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the client's strengths, coping skills, and available support systems"
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Treatment Goals</CardTitle>
                  <CardDescription>Specific, measurable goals and objectives</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  onClick={addGoal}
                >
                  Add Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {goals.map((goal, index) => (
                <div key={goal.id} className="mb-8 p-4 border rounded-lg bg-gradient-to-r from-white to-emerald-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-emerald-700">Goal {index + 1}</h3>
                    {goals.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeGoal(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`goals.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the therapeutic goal in specific and measurable terms"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`goals.${index}.objective`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objectives</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List specific, measurable steps to achieve this goal"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`goals.${index}.interventions`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interventions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Therapeutic interventions to be used to achieve this goal"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`goals.${index}.targetDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Target Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      formatDate(field.value)
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) =>
                                    date < new Date()
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`goals.${index}.status`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <RadioGroup 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                                className="flex space-x-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Not Started" id={`status-not-started-${index}`} />
                                  <Label htmlFor={`status-not-started-${index}`}>Not Started</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="In Progress" id={`status-in-progress-${index}`} />
                                  <Label htmlFor={`status-in-progress-${index}`}>In Progress</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Achieved" id={`status-achieved-${index}`} />
                                  <Label htmlFor={`status-achieved-${index}`}>Achieved</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="Discontinued" id={`status-discontinued-${index}`} />
                                  <Label htmlFor={`status-discontinued-${index}`}>Discontinued</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <CardTitle>Treatment Recommendations</CardTitle>
              <CardDescription>Recommended services and frequency</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <FormField
                control={form.control}
                name="recommendedServices"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Recommended Services</FormLabel>
                      <FormDescription>
                        Select all services that apply to this treatment plan
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {treatmentServiceOptions.map((option) => (
                        <FormField
                          key={option.id}
                          control={form.control}
                          name="recommendedServices"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                      const currentValue = field.value || [];
                                      return checked
                                        ? field.onChange([...currentValue, option.id])
                                        : field.onChange(
                                            currentValue.filter(
                                              (value) => value !== option.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="treatmentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treatment Frequency</FormLabel>
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Weekly" id="frequency-weekly" />
                          <Label htmlFor="frequency-weekly">Weekly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Bi-weekly" id="frequency-biweekly" />
                          <Label htmlFor="frequency-biweekly">Bi-weekly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Monthly" id="frequency-monthly" />
                          <Label htmlFor="frequency-monthly">Monthly</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="As needed" id="frequency-asneeded" />
                          <Label htmlFor="frequency-asneeded">As needed</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information or special considerations for this treatment plan"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <CardTitle>Agreement</CardTitle>
              <CardDescription>Client agreement and signatures</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="clientAgreement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Client Agreement
                      </FormLabel>
                      <FormDescription>
                        By checking this box, you confirm that the client has reviewed and agreed to this treatment plan.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
              >
                Save as Draft
              </Button>
              <button
                type="submit"
                className="group relative overflow-hidden rounded-md bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-2 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-green-500/25 hover:scale-105"
                disabled={isSubmitting}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 transition duration-300 group-hover:opacity-100"></span>
                <span className="relative z-10 flex items-center">
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Treatment Plan
                    </>
                  )}
                </span>
                <span className="absolute -bottom-1 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-white opacity-70 transition-all duration-300 group-hover:w-1/2"></span>
              </button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}