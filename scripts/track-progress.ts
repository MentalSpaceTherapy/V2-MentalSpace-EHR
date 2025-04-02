import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface ProgressStats {
  completed: number;
  inProgress: number;
  pending: number;
  total: number;
}

interface ComponentProgress {
  name: string;
  status: 'completed' | 'inProgress' | 'pending';
  items: string[];
}

const PROGRESS_FILE = path.join(process.cwd(), 'PROGRESS.md');

// Define patterns to check for different components
const PATTERNS = {
  api: {
    routes: 'server/routes/**/*.ts',
    controllers: 'server/controllers/**/*.ts',
    middleware: 'server/middleware/**/*.ts'
  },
  frontend: {
    components: 'src/components/**/*.tsx',
    pages: 'src/pages/**/*.tsx',
    hooks: 'src/hooks/**/*.ts',
    utils: 'src/lib/**/*.ts'
  },
  tests: {
    unit: 'src/__tests__/**/*.test.ts',
    integration: 'server/__tests__/**/*.test.ts',
    e2e: 'tests/e2e/**/*.test.ts'
  }
};

// Define completion criteria
const COMPLETION_CRITERIA = {
  api: {
    routes: (files: string[]) => files.length >= 8, // All main route files
    controllers: (files: string[]) => files.length >= 8,
    middleware: (files: string[]) => files.length >= 3
  },
  frontend: {
    components: (files: string[]) => files.length >= 10,
    pages: (files: string[]) => files.length >= 8,
    hooks: (files: string[]) => files.length >= 5,
    utils: (files: string[]) => files.length >= 5
  },
  tests: {
    unit: (files: string[]) => files.length >= 5,
    integration: (files: string[]) => files.length >= 5,
    e2e: (files: string[]) => files.length >= 3
  }
};

async function checkComponentProgress(component: string, pattern: string, criteria: (files: string[]) => boolean): Promise<ComponentProgress> {
  const files = await glob(pattern);
  const status = criteria(files) ? 'completed' : (files.length > 0 ? 'inProgress' : 'pending');
  
  return {
    name: component,
    status,
    items: files.map(f => path.basename(f, path.extname(f)))
  };
}

async function calculateProgress(): Promise<ProgressStats> {
  const components: ComponentProgress[] = [];
  let completed = 0;
  let inProgress = 0;
  let pending = 0;

  // Check API progress
  for (const [component, pattern] of Object.entries(PATTERNS.api)) {
    const progress = await checkComponentProgress(
      component,
      pattern,
      COMPLETION_CRITERIA.api[component as keyof typeof COMPLETION_CRITERIA.api]
    );
    components.push(progress);
    if (progress.status === 'completed') completed++;
    else if (progress.status === 'inProgress') inProgress++;
    else pending++;
  }

  // Check Frontend progress
  for (const [component, pattern] of Object.entries(PATTERNS.frontend)) {
    const progress = await checkComponentProgress(
      component,
      pattern,
      COMPLETION_CRITERIA.frontend[component as keyof typeof COMPLETION_CRITERIA.frontend]
    );
    components.push(progress);
    if (progress.status === 'completed') completed++;
    else if (progress.status === 'inProgress') inProgress++;
    else pending++;
  }

  // Check Tests progress
  for (const [component, pattern] of Object.entries(PATTERNS.tests)) {
    const progress = await checkComponentProgress(
      component,
      pattern,
      COMPLETION_CRITERIA.tests[component as keyof typeof COMPLETION_CRITERIA.tests]
    );
    components.push(progress);
    if (progress.status === 'completed') completed++;
    else if (progress.status === 'inProgress') inProgress++;
    else pending++;
  }

  const total = completed + inProgress + pending;

  return {
    completed,
    inProgress,
    pending,
    total
  };
}

function generateProgressMarkdown(stats: ProgressStats, components: ComponentProgress[]): string {
  const completedPercentage = Math.round((stats.completed / stats.total) * 100);
  const inProgressPercentage = Math.round((stats.inProgress / stats.total) * 100);
  const pendingPercentage = Math.round((stats.pending / stats.total) * 100);

  return `# Project Progress & Verification

## 📊 Progress Overview

\`\`\`mermaid
pie title Project Progress
    "Completed" : ${completedPercentage}
    "In Progress" : ${inProgressPercentage}
    "Pending" : ${pendingPercentage}
\`\`\`

## 🟢 Completed Components

${components
  .filter(c => c.status === 'completed')
  .map(c => `### ${c.name}\n${c.items.map(i => `- ${i}`).join('\n')}`)
  .join('\n\n')}

## 🟡 In Progress Components

${components
  .filter(c => c.status === 'inProgress')
  .map(c => `### ${c.name}\n${c.items.map(i => `- ${i}`).join('\n')}`)
  .join('\n\n')}

## 🔴 Pending Components

${components
  .filter(c => c.status === 'pending')
  .map(c => `### ${c.name}\n${c.items.map(i => `- ${i}`).join('\n')}`)
  .join('\n\n')}

## 📈 Statistics

- Total Components: ${stats.total}
- Completed: ${stats.completed} (${completedPercentage}%)
- In Progress: ${stats.inProgress} (${inProgressPercentage}%)
- Pending: ${stats.pending} (${pendingPercentage}%)

Last Updated: ${new Date().toISOString()}
`;
}

async function main() {
  try {
    const stats = await calculateProgress();
    const components = await Promise.all([
      ...Object.entries(PATTERNS.api).map(([component, pattern]) =>
        checkComponentProgress(
          component,
          pattern,
          COMPLETION_CRITERIA.api[component as keyof typeof COMPLETION_CRITERIA.api]
        )
      ),
      ...Object.entries(PATTERNS.frontend).map(([component, pattern]) =>
        checkComponentProgress(
          component,
          pattern,
          COMPLETION_CRITERIA.frontend[component as keyof typeof COMPLETION_CRITERIA.frontend]
        )
      ),
      ...Object.entries(PATTERNS.tests).map(([component, pattern]) =>
        checkComponentProgress(
          component,
          pattern,
          COMPLETION_CRITERIA.tests[component as keyof typeof COMPLETION_CRITERIA.tests]
        )
      )
    ]);

    const markdown = generateProgressMarkdown(stats, components);
    fs.writeFileSync(PROGRESS_FILE, markdown);
    console.log('Progress tracking completed successfully!');
  } catch (error) {
    console.error('Error tracking progress:', error);
    process.exit(1);
  }
}

main(); 