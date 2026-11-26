// research/STORY.template.md + data/processed/market-data.json → research/STORY.md
// Se niega a generar STORY.md si la validación no pasó, salvo --allow-incomplete,
// que agrega un aviso visible arriba del documento.
import { readFileSync, writeFileSync } from 'node:fs';
import { PATHS } from './lib/config.ts';
import { render } from './lib/render.ts';

const allowIncomplete = process.argv.includes('--allow-incomplete');
const checkOnly = process.argv.includes('--check');

const validation = JSON.parse(readFileSync(PATHS.validation, 'utf8')) as { status: string; findings: { level: string; series?: string; detail: string }[] };
const data = JSON.parse(readFileSync(PATHS.marketData, 'utf8')) as { meta: { complete: boolean; missing: unknown; generated_at: string; data_downloaded_at: string } };
const template = readFileSync(PATHS.storyTemplate, 'utf8');

try {
  let story = render(template, data);
  if (checkOnly) {
    console.log('Plantilla OK: sin números escritos a mano y todos los marcadores resuelven.');
    process.exit(0);
  }
  if (validation.status !== 'PASS') {
    if (!allowIncomplete) {
      console.error('La validación no pasó (data/processed/validation-report.json). No se genera STORY.md.');
      console.error('Errores:', validation.findings.filter((f) => f.level === 'error').map((f) => `${f.series ?? '-'}: ${f.detail}`).join(' | '));
      console.error('Para generar un borrador marcado como incompleto: pnpm render --allow-incomplete');
      process.exit(1);
    }
    story = `> ⚠️ **BORRADOR CON DATOS INCOMPLETOS.** La validación no pasó: ${JSON.stringify(data.meta.missing)}. No usar para publicar.\n\n${story}`;
  }
  story += `\n\n---\n<sub>Generado por \`scripts/render-story.ts\` desde \`data/processed/market-data.json\` (datos descargados ${data.meta.data_downloaded_at}). Ningún número de este documento fue escrito a mano.</sub>\n`;
  writeFileSync(PATHS.story, story);
  console.log(`OK ${PATHS.story}`);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
