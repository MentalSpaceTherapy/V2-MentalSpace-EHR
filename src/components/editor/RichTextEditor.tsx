import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import {
  Box,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  TextField,
  Popover,
} from '@mui/material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as OrderedListIcon,
  FormatQuote as BlockquoteIcon,
  Code as CodeIcon,
  Title as HeadingIcon,
  Highlight as HighlightIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  LocalHospital as ClinicalIcon,
} from '@mui/icons-material';

// Clinical terminology suggestions
const CLINICAL_TERMS = {
  mentalStatus: [
    'Alert and oriented x3', 
    'Mood euthymic, affect congruent', 
    'Mood depressed, affect constricted',
    'Mood anxious, affect appropriate',
    'Thought process logical and goal-directed',
    'No evidence of thought disorder or perceptual disturbances',
    'No suicidal or homicidal ideation',
    'Memory intact for recent and remote events',
    'Attention and concentration within normal limits',
    'Insight and judgment fair to good'
  ],
  diagnoses: [
    'Major Depressive Disorder, Recurrent, Moderate (F33.1)',
    'Generalized Anxiety Disorder (F41.1)',
    'Post-Traumatic Stress Disorder (F43.10)',
    'Bipolar I Disorder, Current Episode Depressed, Moderate (F31.32)',
    'Attention-Deficit/Hyperactivity Disorder, Combined Presentation (F90.2)',
    'Substance Use Disorder, Alcohol, Moderate (F10.20)',
    'Obsessive-Compulsive Disorder (F42.2)',
    'Adjustment Disorder with Mixed Anxiety and Depressed Mood (F43.23)',
    'Social Anxiety Disorder (F40.10)',
    'Persistent Depressive Disorder (Dysthymia) (F34.1)'
  ],
  interventions: [
    'Cognitive Behavioral Therapy (CBT)',
    'Dialectical Behavior Therapy (DBT)',
    'Motivational Interviewing',
    'Exposure and Response Prevention',
    'Mindfulness-based interventions',
    'Acceptance and Commitment Therapy (ACT)',
    'Solution-Focused Brief Therapy',
    'Interpersonal Therapy',
    'Psychoeducation',
    'Supportive therapy'
  ],
  assessments: [
    'PHQ-9 Score: ', 
    'GAD-7 Score: ',
    'AUDIT Score: ',
    'DAST-10 Score: ',
    'PCL-5 Score: ',
    'YMRS Score: ',
    'Columbia Suicide Severity Rating Scale (C-SSRS): ',
    'ADHD Rating Scale: ',
    'Montreal Cognitive Assessment (MoCA): ',
    'Mini-Mental State Examination (MMSE): '
  ]
};

interface RichTextEditorProps {
  onChange: (content: string) => void;
  initialContent?: string;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [clinicalCategory, setClinicalCategory] = useState<keyof typeof CLINICAL_TERMS>('mentalStatus');
  
  if (!editor) {
    return null;
  }

  const handleClinicalClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClinicalTermInsert = (term: string) => {
    editor.commands.focus();
    editor.commands.insertContent(term);
    handleClose();
  };

  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setClinicalCategory(event.target.value as keyof typeof CLINICAL_TERMS);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'clinical-terms-popover' : undefined;

  return (
    <Box sx={{ mb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
      <Tooltip title="Bold">
        <IconButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          size="small"
        >
          <BoldIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Italic">
        <IconButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          size="small"
        >
          <ItalicIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Heading">
        <IconButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          size="small"
        >
          <HeadingIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="Bullet List">
        <IconButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          size="small"
        >
          <BulletListIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Ordered List">
        <IconButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          size="small"
        >
          <OrderedListIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Block Quote">
        <IconButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          size="small"
        >
          <BlockquoteIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Code Block">
        <IconButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          size="small"
        >
          <CodeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Highlight">
        <IconButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={editor.isActive('highlight') ? 'is-active' : ''}
          size="small"
        >
          <HighlightIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Divider orientation="vertical" flexItem />
      
      <Tooltip title="Undo">
        <IconButton
          onClick={() => editor.chain().focus().undo().run()}
          size="small"
          disabled={!editor.can().undo()}
        >
          <UndoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Tooltip title="Redo">
        <IconButton
          onClick={() => editor.chain().focus().redo().run()}
          size="small"
          disabled={!editor.can().redo()}
        >
          <RedoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Tooltip title="Insert Clinical Terminology">
        <IconButton
          color="primary"
          size="small"
          onClick={handleClinicalClick}
          aria-describedby={id}
        >
          <ClinicalIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Insert Clinical Terminology
          </Typography>
          
          <FormControl size="small" fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={clinicalCategory}
              label="Category"
              onChange={handleCategoryChange as any}
            >
              <MenuItem value="mentalStatus">Mental Status</MenuItem>
              <MenuItem value="diagnoses">Diagnoses</MenuItem>
              <MenuItem value="interventions">Interventions</MenuItem>
              <MenuItem value="assessments">Assessments</MenuItem>
            </Select>
          </FormControl>
          
          <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', p: 1 }}>
            {CLINICAL_TERMS[clinicalCategory].map((term, index) => (
              <Box
                key={index}
                sx={{
                  p: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderBottom: index < CLINICAL_TERMS[clinicalCategory].length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
                onClick={() => handleClinicalTermInsert(term)}
              >
                <Typography variant="body2">{term}</Typography>
              </Box>
            ))}
          </Paper>
        </Box>
      </Popover>
    </Box>
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  onChange,
  initialContent = '',
  placeholder = 'Write your clinical note here...',
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
      Highlight,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    autofocus: true,
  });

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
    }
  }, [initialContent, editor]);

  return (
    <Box 
      sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1
      }}
    >
      <MenuBar editor={editor} />
      <Divider sx={{ mb: 1 }} />
      <EditorContent 
        editor={editor}
        style={{ 
          minHeight: '200px',
          padding: '8px'
        }}
      />
    </Box>
  );
};

export default RichTextEditor; 