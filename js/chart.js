// chart.js - the bar + line chart.
// Bars  = total money spent on a habit by the end of each year.
// Line  = what the same money would be worth if it were invested at 7% a year.
// It is drawn as an SVG string, so there is no chart library to download.

function drawSpendChart(container, monthly, years) {
  const width = 480;
  const height = 250;
  const padLeft = 6;
  const padRight = 6;
  const padTop = 14;
  const padBottom = 28;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Work out the numbers for each year
  const spent = [];
  const invested = [];
  for (let year = 1; year <= years; year++) {
    spent.push(monthly * 12 * year);
    invested.push(futureValueOfMonthly(monthly, year, GROWTH_RATE));
  }
  const maxValue = Math.max(invested[years - 1], 1); // the line always ends highest
  const slot = plotWidth / years;
  const barWidth = slot * 0.56;

  function yFor(value) {
    return padTop + plotHeight - (value / maxValue) * plotHeight;
  }

  let svg =
    '<svg viewBox="0 0 ' + width + " " + height + '" role="img" aria-label="Bar and line chart over ' + years +
    " years. Money spent reaches " + formatMoney(spent[years - 1]) + ". The same money invested at 7 percent reaches " +
    formatMoney(invested[years - 1]) + '.">';

  // Light grid lines
  for (let i = 0; i <= 3; i++) {
    const y = padTop + (plotHeight / 3) * i;
    svg += '<line class="chart-grid" x1="' + padLeft + '" x2="' + (width - padRight) + '" y1="' + y + '" y2="' + y + '"/>';
  }

  // Bars
  for (let i = 0; i < years; i++) {
    const x = padLeft + slot * i + (slot - barWidth) / 2;
    const y = yFor(spent[i]);
    svg += '<rect class="chart-bar" style="animation-delay:' + (i * 60) + 'ms" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
      '" width="' + barWidth.toFixed(1) + '" height="' + (padTop + plotHeight - y).toFixed(1) + '" rx="1.5"/>';
  }

  // Line over the bars
  let points = "";
  for (let i = 0; i < years; i++) {
    const x = padLeft + slot * i + slot / 2;
    points += x.toFixed(1) + "," + yFor(invested[i]).toFixed(1) + " ";
  }
  svg += '<polyline class="chart-line" pathLength="1" points="' + points.trim() + '"/>';
  const lastX = padLeft + slot * (years - 1) + slot / 2;
  svg += '<circle class="chart-dot" cx="' + lastX.toFixed(1) + '" cy="' + yFor(invested[years - 1]).toFixed(1) + '" r="4"/>';

  // Year labels along the bottom
  for (let i = 0; i < years; i++) {
    if (years > 6 && i % 2 === 1 && i !== years - 1) continue; // skip some labels on busy charts
    const x = padLeft + slot * i + slot / 2;
    svg += '<text class="chart-label" x="' + x.toFixed(1) + '" y="' + (height - 8) + '" text-anchor="middle">Yr ' + (i + 1) + "</text>";
  }
  svg += "</svg>";

  const legend =
    '<ul class="chart-legend">' +
    '<li><span class="swatch swatch-bar"></span>Spent <strong>' + formatMoney(spent[years - 1]) + "</strong></li>" +
    '<li><span class="swatch swatch-line"></span>Invested at 7% <strong>' + formatMoney(invested[years - 1]) + "</strong></li></ul>";

  container.innerHTML = svg + legend;
}
