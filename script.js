import { palettes } from './palettes.js';

function hexToRgb(hex) {
    const bigint = parseInt(hex.replace('#', ''), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

// distance = √(r1​−r2​)^2+(g1​−g2​)^2+(b1​−b2​)^2
function colorDistance(c1, c2) {
    return Math.sqrt(
        Math.pow(c1.r - c2.r, 2) +
        Math.pow(c1.g - c2.g, 2) +
        Math.pow(c1.b - c2.b, 2)
    );
}

function findClosestColors(live = false) {
    const input = document.getElementById('colorInput').value.trim();
    const excludeSame = document.getElementById('excludeSame').checked;
    const limitOnePerPalette = document.getElementById('limitOnePerPalette')?.checked;

    if (!/^#([0-9A-F]{3}){1,2}$/i.test(input)) {
        if (!live) alert('Please enter a valid hex color (e.g. #AABBCC)');
        document.getElementById('result').innerHTML = '';
        return;
    }

    const inputRgb = hexToRgb(input);
    const allColors = [];

    for (const [paletteName, matrix] of Object.entries(palettes)) {
        // Loop through the matrix
        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                const color = matrix[row][col];
                const dist = colorDistance(inputRgb, hexToRgb(color));
                allColors.push({
                    palette: paletteName,
                    hex: color,
                    distance: dist,
                    row: row + 1,
                    col: col + 1
                });
            }
        }
    }

    allColors.sort((a, b) => a.distance - b.distance);

    // Exclude same palette filter
    const bestPalette = allColors[0].palette;
    let filtered = excludeSame
        ? allColors.filter(c => c.palette !== bestPalette)
        : allColors;

    // Limit one per palette filter
    if (limitOnePerPalette) {
        const seen = new Set();
        filtered = filtered.filter(c => {
            if (seen.has(c.palette)) return false;
            seen.add(c.palette);
            return true;
        });
    }

    const topResults = filtered.slice(0, 5);

    const resultDiv = document.getElementById('result');
    // Don't let me do css or html at 1am
    resultDiv.innerHTML = `
        <h3>Top ${topResults.length} closest matches:</h3>
        <div>${topResults.map(c => `
            <div class="color-card">
                <div class="color-box" style="background:${c.hex}"></div>
                <div><b>${c.hex}</b></div>
                <div>${c.palette}</div>
                <div>Position: ${String.fromCharCode(64 + c.col)}${c.row}</div>
                <div style="font-size:0.8em;color:#666;">Distance: ${c.distance.toFixed(1)}</div>
            </div>
        `).join('')}</div>
    `;
}


function renderPalettes() {
    const container = document.getElementById('palettesContainer');
    container.innerHTML = '';

    for (const [paletteName, matrix] of Object.entries(palettes)) {
        const paletteDiv = document.createElement('div');
        paletteDiv.className = 'palette';
        const title = document.createElement('h3');
        title.textContent = paletteName;
        paletteDiv.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'grid';

        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                const color = matrix[row][col];
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.background = color;
                cell.title = `${String.fromCharCode(64 + col + 1)}${row + 1} ${color}`;
                cell.onclick = () => {
                    document.getElementById('colorInput').value = color;
                    findClosestColors(true);
                };
                grid.appendChild(cell);
            }
        }

        paletteDiv.appendChild(grid);
        container.appendChild(paletteDiv);
    }
}


renderPalettes();
findClosestColors(true);

document.getElementById('colorInput').addEventListener('input', () => findClosestColors(true));
document.getElementById('excludeSame').addEventListener('change', () => findClosestColors(true));
document.getElementById('limitOnePerPalette').addEventListener('change', () => findClosestColors(true));
