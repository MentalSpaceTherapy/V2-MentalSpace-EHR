import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowRightLeft,
  Check,
  ChevronsUpDown,
  Copy,
  Edit,
  EyeIcon,
  Filter,
  Mail,
  MoreHorizontal,
  Pen,
  Plus,
  Save,
  Search,
  Send,
  Settings,
  Trash,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCRM } from '@/hooks/use-crm';

// Define types
type FilterCondition = {
  id: string;
  field: string;
  operator: string;
  value: string | number | string[] | null;
};

type ClientSegment = {
  id: string;
  name: string;
  description: string;
  tags: string[];
  filter: {
    matchType: 'all' | 'any';
    conditions: FilterCondition[];
  };
  clientCount: number;
  createdAt: string;
  updatedAt: string;
  isSystem?: boolean;
  isActive: boolean;
};

export function AudienceSegmentation() {
  // Sample client segments
  const [segments, setSegments] = useState<ClientSegment[]>([
    {
      id: 'seg1',
      name: 'Active Clients',
      description: 'Clients with at least one session in the last 60 days',
      tags: ['active', 'current'],
      filter: {
        matchType: 'all',
        conditions: [
          {
            id: 'c1',
            field: 'lastSession',
            operator: 'lessThan',
            value: 60,
          },
          {
            id: 'c2',
            field: 'status',
            operator: 'equals',
            value: 'active',
          }
        ],
      },
      clientCount: 87,
      createdAt: '2023-06-15T10:30:00Z',
      updatedAt: '2023-06-15T10:30:00Z',
      isSystem: true,
      isActive: true,
    },
    {
      id: 'seg2',
      name: 'Anxiety & Depression',
      description: 'Clients being treated for anxiety and/or depression',
      tags: ['anxiety', 'depression', 'conditions'],
      filter: {
        matchType: 'any',
        conditions: [
          {
            id: 'c1',
            field: 'diagnoses',
            operator: 'contains',
            value: 'anxiety',
          },
          {
            id: 'c2',
            field: 'diagnoses',
            operator: 'contains',
            value: 'depression',
          }
        ],
      },
      clientCount: 64,
      createdAt: '2023-07-20T14:45:00Z',
      updatedAt: '2023-07-20T14:45:00Z',
      isActive: true,
    },
    {
      id: 'seg3',
      name: 'High Value Clients',
      description: 'Clients with premium services or high session frequency',
      tags: ['premium', 'high-value'],
      filter: {
        matchType: 'any',
        conditions: [
          {
            id: 'c1',
            field: 'sessionFrequency',
            operator: 'greaterThan',
            value: 3,
          },
          {
            id: 'c2',
            field: 'packageType',
            operator: 'equals',
            value: 'premium',
          },
          {
            id: 'c3',
            field: 'lifetimeValue',
            operator: 'greaterThan',
            value: 5000,
          }
        ],
      },
      clientCount: 23,
      createdAt: '2023-08-05T09:15:00Z',
      updatedAt: '2023-09-12T11:30:00Z',
      isActive: true,
    },
    {
      id: 'seg4',
      name: 'New Clients (30 days)',
      description: 'Clients who joined within the last 30 days',
      tags: ['new', 'onboarding'],
      filter: {
        matchType: 'all',
        conditions: [
          {
            id: 'c1',
            field: 'joinDate',
            operator: 'lessThan',
            value: 30,
          }
        ],
      },
      clientCount: 12,
      createdAt: '2023-05-10T08:20:00Z',
      updatedAt: '2023-05-10T08:20:00Z',
      isSystem: true,
      isActive: true,
    },
    {
      id: 'seg5',
      name: 'Re-engagement Candidates',
      description: 'Former clients who haven\'t had a session in 3+ months',
      tags: ['inactive', 're-engagement'],
      filter: {
        matchType: 'all',
        conditions: [
          {
            id: 'c1',
            field: 'lastSession',
            operator: 'greaterThan',
            value: 90,
          },
          {
            id: 'c2',
            field: 'sessionCount',
            operator: 'greaterThan',
            value: 5,
          },
          {
            id: 'c3',
            field: 'status',
            operator: 'notEquals',
            value: 'terminated',
          }
        ],
      },
      clientCount: 31,
      createdAt: '2023-09-01T15:10:00Z',
      updatedAt: '2023-09-01T15:10:00Z',
      isActive: true,
    },
  ]);

  const [segmentDialog, setSegmentDialog] = useState({
    isOpen: false,
    mode: 'create', // 'create' or 'edit'
    currentSegment: null as ClientSegment | null,
  });

  const [filters, setFilters] = useState({
    search: '',
    tag: '',
    status: 'all',
  });

  // Filter segment data
  const filteredSegments = segments.filter((segment) => {
    // Apply search filter
    const searchMatch = filters.search
      ? segment.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        segment.description.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    // Apply tag filter
    const tagMatch = filters.tag
      ? segment.tags.includes(filters.tag)
      : true;

    // Apply status filter
    const statusMatch = filters.status === 'all'
      ? true
      : filters.status === 'active'
      ? segment.isActive
      : !segment.isActive;

    return searchMatch && tagMatch && statusMatch;
  });

  // All tags from all segments for the tag filter
  const allTags = Array.from(
    new Set(segments.flatMap((segment) => segment.tags))
  ).sort();

  // Field options for segment conditions
  const fieldOptions = [
    { value: 'status', label: 'Client Status' },
    { value: 'lastSession', label: 'Days Since Last Session' },
    { value: 'joinDate', label: 'Days Since Joined' },
    { value: 'sessionCount', label: 'Number of Sessions' },
    { value: 'diagnoses', label: 'Diagnoses' },
    { value: 'ageRange', label: 'Age Range' },
    { value: 'gender', label: 'Gender' },
    { value: 'insuranceType', label: 'Insurance Type' },
    { value: 'packageType', label: 'Service Package' },
    { value: 'referralSource', label: 'Referral Source' },
    { value: 'therapist', label: 'Assigned Therapist' },
    { value: 'sessionFrequency', label: 'Sessions per Month' },
    { value: 'hasFeedback', label: 'Has Provided Feedback' },
    { value: 'hasCompletedForms', label: 'Completed Required Forms' },
    { value: 'tags', label: 'Client Tags' },
    { value: 'lifetimeValue', label: 'Lifetime Value ($)' },
  ];

  // New segment form
  const [segmentForm, setSegmentForm] = useState<{
    name: string;
    description: string;
    tags: string[];
    matchType: 'all' | 'any';
    conditions: FilterCondition[];
  }>({
    name: '',
    description: '',
    tags: [],
    matchType: 'all',
    conditions: [
      {
        id: 'new-1',
        field: 'status',
        operator: 'equals',
        value: 'active',
      },
    ],
  });

  // Create/Edit Segment Dialog Handlers
  const openCreateSegmentDialog = () => {
    setSegmentForm({
      name: '',
      description: '',
      tags: [],
      matchType: 'all',
      conditions: [
        {
          id: 'new-1',
          field: 'status',
          operator: 'equals',
          value: 'active',
        },
      ],
    });
    setSegmentDialog({
      isOpen: true,
      mode: 'create',
      currentSegment: null,
    });
  };

  const openEditSegmentDialog = (segment: ClientSegment) => {
    setSegmentForm({
      name: segment.name,
      description: segment.description,
      tags: segment.tags,
      matchType: segment.filter.matchType,
      conditions: segment.filter.conditions,
    });
    setSegmentDialog({
      isOpen: true,
      mode: 'edit',
      currentSegment: segment,
    });
  };

  // Form handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSegmentForm({ ...segmentForm, name: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSegmentForm({ ...segmentForm, description: e.target.value });
  };

  const handleMatchTypeChange = (value: string) => {
    setSegmentForm({ ...segmentForm, matchType: value as 'all' | 'any' });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = [...segmentForm.tags];
    if (newTags.includes(tag)) {
      setSegmentForm({
        ...segmentForm,
        tags: newTags.filter((t) => t !== tag),
      });
    } else {
      setSegmentForm({ ...segmentForm, tags: [...newTags, tag] });
    }
  };

  const addCondition = () => {
    setSegmentForm({
      ...segmentForm,
      conditions: [
        ...segmentForm.conditions,
        {
          id: `new-${segmentForm.conditions.length + 1}`,
          field: 'status',
          operator: 'equals',
          value: '',
        },
      ],
    });
  };

  const updateCondition = (
    id: string,
    field: string,
    value: string | number | string[] | null
  ) => {
    setSegmentForm({
      ...segmentForm,
      conditions: segmentForm.conditions.map((condition) =>
        condition.id === id ? { ...condition, [field]: value } : condition
      ),
    });
  };

  const removeCondition = (id: string) => {
    setSegmentForm({
      ...segmentForm,
      conditions: segmentForm.conditions.filter(
        (condition) => condition.id !== id
      ),
    });
  };

  // Save segment
  const handleSaveSegment = () => {
    const newSegment: ClientSegment = {
      id: segmentDialog.currentSegment?.id || `seg${segments.length + 1}`,
      name: segmentForm.name,
      description: segmentForm.description,
      tags: segmentForm.tags,
      filter: {
        matchType: segmentForm.matchType,
        conditions: segmentForm.conditions,
      },
      clientCount: segmentDialog.currentSegment?.clientCount || 0,
      createdAt: segmentDialog.currentSegment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    if (segmentDialog.mode === 'create') {
      setSegments([...segments, newSegment]);
    } else {
      setSegments(
        segments.map((seg) =>
          seg.id === newSegment.id ? newSegment : seg
        )
      );
    }

    setSegmentDialog({ ...segmentDialog, isOpen: false });
  };

  // Delete segment
  const handleDeleteSegment = (id: string) => {
    setSegments(segments.filter((segment) => segment.id !== id));
  };

  // Toggle segment active status
  const toggleSegmentStatus = (id: string, isActive: boolean) => {
    setSegments(
      segments.map((segment) =>
        segment.id === id ? { ...segment, isActive } : segment
      )
    );
  };

  // Get operator options based on field
  const getOperatorOptions = (field: string) => {
    const stringOperators = [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Does Not Equal' },
      { value: 'contains', label: 'Contains' },
      { value: 'notContains', label: 'Does Not Contain' },
      { value: 'startsWith', label: 'Starts With' },
      { value: 'endsWith', label: 'Ends With' },
    ];

    const numberOperators = [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Does Not Equal' },
      { value: 'greaterThan', label: 'Greater Than' },
      { value: 'lessThan', label: 'Less Than' },
      { value: 'between', label: 'Between' },
    ];

    const booleanOperators = [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Does Not Equal' },
    ];

    // Determine field type
    if (['lastSession', 'joinDate', 'sessionCount', 'sessionFrequency', 'lifetimeValue'].includes(field)) {
      return numberOperators;
    } else if (['hasFeedback', 'hasCompletedForms'].includes(field)) {
      return booleanOperators;
    } else {
      return stringOperators;
    }
  };

  // Get value options based on field
  const getValueOptions = (field: string) => {
    switch (field) {
      case 'status':
        return [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' },
          { value: 'terminated', label: 'Terminated' },
        ];
      case 'gender':
        return [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
          { value: 'non-binary', label: 'Non-binary' },
          { value: 'other', label: 'Other' },
        ];
      case 'diagnoses':
        return [
          { value: 'anxiety', label: 'Anxiety' },
          { value: 'depression', label: 'Depression' },
          { value: 'bipolar', label: 'Bipolar Disorder' },
          { value: 'ptsd', label: 'PTSD' },
          { value: 'adhd', label: 'ADHD' },
          { value: 'ocd', label: 'OCD' },
        ];
      case 'insuranceType':
        return [
          { value: 'private', label: 'Private Insurance' },
          { value: 'medicare', label: 'Medicare' },
          { value: 'medicaid', label: 'Medicaid' },
          { value: 'self-pay', label: 'Self-Pay' },
        ];
      case 'packageType':
        return [
          { value: 'standard', label: 'Standard' },
          { value: 'premium', label: 'Premium' },
          { value: 'intensive', label: 'Intensive Care' },
        ];
      case 'referralSource':
        return [
          { value: 'google', label: 'Google Search' },
          { value: 'doctor', label: 'Doctor Referral' },
          { value: 'friend', label: 'Friend/Family' },
          { value: 'insurance', label: 'Insurance Directory' },
          { value: 'social-media', label: 'Social Media' },
        ];
      case 'hasFeedback':
      case 'hasCompletedForms':
        return [
          { value: 'true', label: 'Yes' },
          { value: 'false', label: 'No' },
        ];
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Client Segmentation</h2>
          <p className="text-muted-foreground">
            Create targeted groups of clients for personalized communications
          </p>
        </div>
        <Button onClick={openCreateSegmentDialog} className="gap-1.5">
          <Plus size={16} />
          <span>Create Segment</span>
        </Button>
      </div>

      {/* Search and Filter bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search segments..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.tag}
          onValueChange={(value) => setFilters({ ...filters, tag: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tags</SelectItem>
            {allTags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Segments Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Client Segments</CardTitle>
          <CardDescription>
            Groups of clients defined by specific criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Segment Name</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead className="text-center">Clients</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSegments.map((segment) => (
                <TableRow key={segment.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{segment.name}</span>
                        {segment.isSystem && (
                          <Badge variant="outline" className="text-xs rounded-sm">System</Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {segment.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {segment.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-xs bg-secondary/50"
                      >
                        {segment.filter.matchType === 'all' ? 'Match All' : 'Match Any'}
                      </Badge>
                      <span className="text-sm">
                        {segment.filter.conditions.length} condition{segment.filter.conditions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-medium">
                      {segment.clientCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={segment.isActive}
                      onCheckedChange={(checked) => toggleSegmentStatus(segment.id, checked)}
                      disabled={segment.isSystem}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditSegmentDialog(segment)}
                        disabled={segment.isSystem}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem className="gap-2" onClick={() => {}}>
                            <EyeIcon className="h-4 w-4" />
                            <span>View Clients</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => {}}>
                            <Send className="h-4 w-4" />
                            <span>Send Campaign</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2" onClick={() => {
                            const newSegment = {...segment};
                            newSegment.id = `seg${segments.length + 1}`;
                            newSegment.name = `${segment.name} (Copy)`;
                            newSegment.isSystem = false;
                            setSegments([...segments, newSegment]);
                          }}>
                            <Copy className="h-4 w-4" />
                            <span>Duplicate</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="gap-2 text-destructive focus:text-destructive" 
                            onClick={() => handleDeleteSegment(segment.id)}
                            disabled={segment.isSystem}
                          >
                            <Trash className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Segment Dialog */}
      <Dialog
        open={segmentDialog.isOpen}
        onOpenChange={(open) => setSegmentDialog({ ...segmentDialog, isOpen: open })}
      >
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {segmentDialog.mode === 'create'
                ? 'Create New Segment'
                : 'Edit Segment'}
            </DialogTitle>
            <DialogDescription>
              Define the criteria for your client segment
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="segmentName">Segment Name*</Label>
                <Input
                  id="segmentName"
                  value={segmentForm.name}
                  onChange={handleNameChange}
                  placeholder="E.g., High-Value Clients"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="segmentDescription">Description</Label>
                <Input
                  id="segmentDescription"
                  value={segmentForm.description}
                  onChange={handleDescriptionChange}
                  placeholder="Describe the purpose of this segment"
                />
              </div>

              <div className="grid gap-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 p-2 border rounded-md">
                  {allTags.map((tag) => (
                    <div
                      key={tag}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        segmentForm.tags.includes(tag)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </div>
                  ))}
                  <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/60 hover:bg-secondary/80 cursor-pointer">
                    + Add Tag
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-4 flex justify-between items-center">
                <Label>Filter Conditions</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">Match:</span>
                  <Select
                    value={segmentForm.matchType}
                    onValueChange={handleMatchTypeChange}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="any">Any Condition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ScrollArea className="max-h-[300px]">
                <div className="space-y-3">
                  {segmentForm.conditions.map((condition, index) => (
                    <div
                      key={condition.id}
                      className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2 items-center p-3 border rounded-md bg-secondary/10"
                    >
                      <Select
                        value={condition.field}
                        onValueChange={(value) =>
                          updateCondition(condition.id, 'field', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {fieldOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select
                        value={condition.operator}
                        onValueChange={(value) =>
                          updateCondition(condition.id, 'operator', value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          {getOperatorOptions(condition.field).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {getValueOptions(condition.field) ? (
                        <Select
                          value={condition.value as string || ''}
                          onValueChange={(value) =>
                            updateCondition(condition.id, 'value', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {getValueOptions(condition.field)?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={['lastSession', 'joinDate', 'sessionCount', 'sessionFrequency', 'lifetimeValue'].includes(condition.field) ? 'number' : 'text'}
                          value={condition.value as string || ''}
                          onChange={(e) =>
                            updateCondition(
                              condition.id,
                              'value',
                              e.target.type === 'number'
                                ? parseInt(e.target.value)
                                : e.target.value
                            )
                          }
                          placeholder="Enter value"
                        />
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCondition(condition.id)}
                        disabled={segmentForm.conditions.length === 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Button
                variant="outline"
                className="mt-3 gap-1.5"
                onClick={addCondition}
              >
                <Plus size={14} />
                <span>Add Condition</span>
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSegmentDialog({ ...segmentDialog, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSaveSegment}
              disabled={!segmentForm.name || segmentForm.conditions.length === 0}
              className="gap-1"
            >
              <Save size={16} />
              <span>
                {segmentDialog.mode === 'create' ? 'Create Segment' : 'Update Segment'}
              </span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}