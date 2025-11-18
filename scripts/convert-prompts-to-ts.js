#!/usr/bin/env node
/**
 * Convert markdown prompt files to TypeScript constants
 * This ensures they're included in Vercel's deployment bundle
 */

const fs = require('fs');
const path = require('path');

const promptsDir = path.join(__dirname, '../src/master-prompts');

const files = [
  'flashcard-generation-prompt.md',
  'hierarchical-knowledge-extraction-prompt.md',
  'syllabus-concept-extraction-prompt.md',
  'transcript-concept-extraction-prompt.md'
];

files.forEach(filename => {
  const mdPath = path.join(promptsDir, filename);
  const tsFilename = filename.replace('.md', '.ts');
  const tsPath = path.join(promptsDir, tsFilename);
  
  // Read markdown content
  const content = fs.readFileSync(mdPath, 'utf-8');
  
  // Extract prompt name from filename
  // Remove '-prompt' suffix if it exists, then add '_PROMPT' at the end
  const baseName = filename
    .replace('.md', '')
    .replace(/-prompt$/, ''); // Remove trailing '-prompt'
  
  const promptName = baseName
    .split('-')
    .map(word => word.toUpperCase())
    .join('_') + '_PROMPT';
  
  // Create TypeScript file
  const tsContent = `/**
 * ${filename.replace('.md', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Prompt
 * 
 * This prompt is stored as a TypeScript constant to ensure it's included
 * in the Vercel deployment bundle (serverless compatibility).
 * 
 * Converted from: ${filename}
 */

export const ${promptName} = \`${content.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
`;
  
  // Write TypeScript file
  fs.writeFileSync(tsPath, tsContent, 'utf-8');
  console.log(`✓ Converted ${filename} → ${tsFilename}`);
});

console.log('\n✅ All prompts converted successfully!');
console.log('\nNext steps:');
console.log('1. Update imports in files that use these prompts');
console.log('2. Remove the .md files after verifying everything works');
console.log('3. Test locally with: pnpm build && pnpm start');
console.log('4. Deploy to Vercel and test course creation');
