export interface Observation {
  date: string;
  /** null cuando FRED no publica valor (vacío o "."). */
  value: number | null;
}

/** Parsea el CSV de fredgraph.csv: "observation_date,<ID>". No descarta filas: los nulos
 *  y duplicados se conservan para que validate.ts los pueda detectar. */
export function parseFredCsv(text: string): Observation[] {
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift();
  if (!header || !header.startsWith('observation_date,')) {
    throw new Error(`CSV de FRED con encabezado inesperado: ${header ?? '(vacío)'}`);
  }
  return lines.map((line) => {
    const [date = '', raw = ''] = line.split(',');
    const trimmed = raw.trim();
    const value = trimmed === '' || trimmed === '.' ? null : Number(trimmed);
    if (value !== null && !Number.isFinite(value)) {
      throw new Error(`Valor no numérico en ${date}: "${raw}"`);
    }
    return { date: date.trim(), value };
  });
}
