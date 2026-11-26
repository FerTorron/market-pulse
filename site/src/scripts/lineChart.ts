// Client-side behavior for <LineChart>: crosshair and tooltip on hover, touch and arrow keys.
// It only shows values already formatted on the server (embedded as JSON); it never computes them.

interface ChartData {
  points: number[]; // x position of each date, in %
  tooltip: { heading: string; rows: { name: string; value: string; color: string }[] }[];
}

function fillTooltip(el: HTMLElement, entry: ChartData['tooltip'][number]) {
  el.replaceChildren();
  const heading = document.createElement('div');
  heading.className = 'tt-heading';
  heading.textContent = entry.heading;
  el.append(heading);
  for (const row of entry.rows) {
    const line = document.createElement('div');
    line.className = 'tt-row';
    const key = document.createElement('span');
    key.className = 'tt-key';
    key.style.background = row.color;
    const name = document.createElement('span');
    name.textContent = row.name;
    const value = document.createElement('span');
    value.className = 'tt-value';
    value.textContent = row.value;
    line.append(key, name, value);
    el.append(line);
  }
}

function enhance(figure: HTMLElement) {
  const plot = figure.querySelector<HTMLElement>('[data-plot]');
  const crosshair = figure.querySelector<HTMLElement>('[data-crosshair]');
  const tooltip = figure.querySelector<HTMLElement>('[data-tooltip]');
  const json = figure.querySelector('[data-chart-data]')?.textContent;
  if (!plot || !crosshair || !tooltip || !json) return;
  const data = JSON.parse(json) as ChartData;
  let current = -1;

  const show = (i: number) => {
    current = Math.max(0, Math.min(data.points.length - 1, i));
    const x = data.points[current]!;
    crosshair.hidden = false;
    crosshair.style.left = `${x}%`;
    fillTooltip(tooltip, data.tooltip[current]!);
    tooltip.hidden = false;
    // Keep the tooltip inside the plot: right of the crosshair on the left half, left of it otherwise.
    tooltip.style.left = x < 50 ? `calc(${x}% + 10px)` : '';
    tooltip.style.right = x >= 50 ? `calc(${100 - x}% + 10px)` : '';
  };
  const hide = () => {
    crosshair.hidden = true;
    tooltip.hidden = true;
  };
  const indexAt = (clientX: number) => {
    const box = plot.getBoundingClientRect();
    const pct = ((clientX - box.left) / box.width) * 100;
    let best = 0;
    data.points.forEach((p, i) => {
      if (Math.abs(p - pct) < Math.abs(data.points[best]! - pct)) best = i;
    });
    return best;
  };

  plot.addEventListener('pointermove', (e) => show(indexAt(e.clientX)));
  plot.addEventListener('pointerdown', (e) => show(indexAt(e.clientX)));
  plot.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') hide();
  });
  plot.addEventListener('focus', () => show(current < 0 ? data.points.length - 1 : current));
  plot.addEventListener('blur', hide);
  plot.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'Home') show(0);
    else if (e.key === 'End') show(data.points.length - 1);
    else if (e.key === 'Escape') hide();
    else return;
    e.preventDefault();
  });
}

export function enhanceLineCharts() {
  document.querySelectorAll<HTMLElement>('[data-line-chart]').forEach((figure) => {
    if (figure.dataset.enhanced) return;
    figure.dataset.enhanced = 'true';
    enhance(figure);
  });
}
