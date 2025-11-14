#!/usr/bin/env node
/*
Run the AI Doc Updater:
- Reads the latest auto-diff file from docs/ai_sessions/ (or a path via --diff)
- Reads prompts/ai_doc_update_prompt.md and prompts/ai_system_prompt.md
- Calls OpenAI Chat Completions API
- Writes patches to docs/ai_sessions/auto-patches-<timestamp>.md

Env vars:
- OPENAI_API_KEY (required to run)
- OPENAI_MODEL (optional, default: gpt-4o-mini)

Usage:
  node scripts/run_ai_doc_updater.js --diff docs/ai_sessions/auto-diff-....md
*/

const fs = require('fs');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const diffArgIdx = args.indexOf('--diff');
  let diffPath = diffArgIdx >= 0 ? args[diffArgIdx + 1] : '';

  const repoRoot = path.resolve(__dirname, '..');
  const sessionsDir = path.join(repoRoot, 'docs', 'ai_sessions');
  if (!diffPath) {
    // pick latest auto-diff file
    if (!fs.existsSync(sessionsDir)) {
      console.error('No docs/ai_sessions directory found.');
      process.exit(1);
    }
    const files = fs
      .readdirSync(sessionsDir)
      .filter((f) => f.startsWith('auto-diff-') && f.endsWith('.md'))
      .sort()
      .reverse();
    if (files.length === 0) {
      console.error('No auto-diff files found in docs/ai_sessions/. Run the diff collector first.');
      process.exit(1);
    }
    diffPath = path.join(sessionsDir, files[0]);
  }

  const systemPromptPath = path.join(repoRoot, 'prompts', 'ai_system_prompt.md');
  const updaterPromptPath = path.join(repoRoot, 'prompts', 'ai_doc_update_prompt.md');

  const ensureFile = (p) => {
    if (!fs.existsSync(p)) {
      console.error('Missing required file:', p);
      process.exit(1);
    }
  };
  ensureFile(systemPromptPath);
  ensureFile(updaterPromptPath);
  ensureFile(diffPath);

  const systemPrompt = fs.readFileSync(systemPromptPath, 'utf8');
  const updaterPrompt = fs.readFileSync(updaterPromptPath, 'utf8');
  const diffPayload = fs.readFileSync(diffPath, 'utf8');

  const provider = (process.env.DOC_AI_PROVIDER || '').toLowerCase();

  let content = '';
  if (process.env.OPENAI_API_KEY && (!provider || provider === 'openai')) {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const OpenAI = require('openai');
    const client = new OpenAI({ apiKey });
    const messages = [
      { role: 'system', content: systemPrompt + "\n\nYou are now operating as the AI Doc Updater. Follow repository conventions strictly and output only minimal patch blocks, then a short summary footer." },
      { role: 'user', content: updaterPrompt },
      { role: 'user', content: `Here is the diff payload to process.\n\n${diffPayload}` }
    ];
    console.log(`Calling OpenAI model: ${model} ...`);
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.2,
    });
    content = response.choices?.[0]?.message?.content || '';
  } else if (process.env.ANTHROPIC_API_KEY && (!provider || provider === 'anthropic' || provider === 'claude')) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest';
    const Anthropic = require('anthropic');
    const client = new Anthropic({ apiKey });
    console.log(`Calling Anthropic model: ${model} ...`);
    const resp = await client.messages.create({
      model,
      max_tokens: 4000,
      system: systemPrompt + "\n\nYou are now operating as the AI Doc Updater. Follow repository conventions strictly and output only minimal patch blocks, then a short summary footer.",
      messages: [
        { role: 'user', content: updaterPrompt },
        { role: 'user', content: `Here is the diff payload to process.\n\n${diffPayload}` }
      ]
    });
    const parts = resp.content || [];
    content = parts.map((p) => p.text || '').join('\n');
  } else {
    console.log('No AI provider configured. Skipping AI Doc Updater run.');
    console.log('Configure one of the following and re-run:');
    console.log('- OpenAI: set OPENAI_API_KEY [and optional OPENAI_MODEL], or');
    console.log('- Anthropic (Claude): set ANTHROPIC_API_KEY [and optional ANTHROPIC_MODEL], and optionally DOC_AI_PROVIDER=anthropic');
    process.exit(0);
  }
  if (!content) {
    console.error('No content returned from model.');
    process.exit(1);
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '').slice(0, 15);
  const outPath = path.join(sessionsDir, `auto-patches-${ts}.md`);
  fs.writeFileSync(outPath, content, 'utf8');
  console.log('Wrote patches to', outPath);

  // Optionally print a short hint
  console.log('\nReview the patch blocks and apply them here, or paste them into your editor to apply.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
