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
    const onlyOwned = document.getElementById('onlyOwned')?.checked;

    if (!/^#([0-9A-F]{3}){1,2}$/i.test(input)) {
        if (!live) alert('Please enter a valid hex color (e.g. #AABBCC)');
        document.getElementById('result').innerHTML = '';
        return;
    }

    const inputRgb = hexToRgb(input);
    const allColors = [];

    for (const [paletteName, matrix] of Object.entries(palettes)) {
        // If onlyOwned is enabled, skip palettes not marked owned
        if (onlyOwned && !isPaletteOwned(paletteName)) continue;
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
    if (allColors.length === 0) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `<h3>No matching colours found (check owned filters)</h3>`;
        return;
    }

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

// Helper to normalize hex codes to full 6-character form with leading '#'
function normalizeHex(hex) {
    if (!hex) return hex;
    hex = hex.trim();
    if (hex[0] !== '#') hex = '#' + hex;
    // Expand 3-digit hex to 6-digit (e.g. #abc -> #aabbcc)
    if (/^#([0-9A-Fa-f]){3}$/.test(hex)) {
        hex = hex.replace(/^#([0-9A-Fa-f])([0-9A-Fa-f])([0-9A-Fa-f])$/, (_m, r, g, b) => '#' + r + r + g + g + b + b);
    }
    return hex.toUpperCase();
}

// Wire up color picker if present
const colorPicker = document.getElementById('colorPicker');
const colorInput = document.getElementById('colorInput');
if (colorPicker) {
    // Initialize picker value from the text input (normalized)
    colorPicker.value = normalizeHex(colorInput.value) || '#000000';

    // When the picker changes, update the text input and run search
    colorPicker.addEventListener('input', (e) => {
        const hex = normalizeHex(e.target.value);
        colorInput.value = hex;
        findClosestColors(true);
    });

    // When the text input changes, try to update the picker when possible
    colorInput.addEventListener('input', (e) => {
        const normalized = normalizeHex(e.target.value);
        // Only set the picker if the normalized value is a full 6-digit hex
        if (/^#([0-9A-F]{6})$/i.test(normalized)) {
            colorPicker.value = normalized;
        }
    });
}

// ----- Owned palettes persistence helpers -----
const OWNED_KEY = 'wf_owned_palettes_v1';
function loadOwnedPalettes() {
    try {
        const raw = localStorage.getItem(OWNED_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch (e) {
        return {};
    }
}

function saveOwnedPalettes(map) {
    try {
        localStorage.setItem(OWNED_KEY, JSON.stringify(map));
    } catch (e) {
        // ignore
    }
}

function isPaletteOwned(name) {
    const map = loadOwnedPalettes();
    return !!map[name];
}

function setPaletteOwned(name, owned) {
    const map = loadOwnedPalettes();
    if (owned) map[name] = true;
    else delete map[name];
    saveOwnedPalettes(map);
}

// Persist 'onlyOwned' checkbox state
const ONLY_OWNED_KEY = 'wf_only_owned_v1';
function loadOnlyOwned() {
    try { return localStorage.getItem(ONLY_OWNED_KEY) === '1'; } catch (e) { return false; }
}
function saveOnlyOwned(val) { try { localStorage.setItem(ONLY_OWNED_KEY, val ? '1' : '0'); } catch (e) {} }

function markAllOwned() {
    const map = {};
    for (const name of Object.keys(palettes)) map[name] = true;
    saveOwnedPalettes(map);
    renderPalettes();
    updateOwnedCount();
    // animate all palettes briefly
    document.querySelectorAll('.palette').forEach(p => {
        p.classList.add('animate-owned');
        setTimeout(() => p.classList.remove('animate-owned'), 350);
    });
    findClosestColors(true);
}

function unmarkAllOwned() {
    saveOwnedPalettes({});
    renderPalettes();
    updateOwnedCount();
    document.querySelectorAll('.palette').forEach(p => {
        p.classList.add('animate-owned');
        setTimeout(() => p.classList.remove('animate-owned'), 350);
    });
    findClosestColors(true);
}

// Helper to update palette checkbox UI after bulk actions
function updatePaletteCheckboxes() {
}



function renderPalettes() {
    const container = document.getElementById('palettesContainer');
    container.innerHTML = '';

    for (const [paletteName, matrix] of Object.entries(palettes)) {
        const paletteDiv = document.createElement('div');
        paletteDiv.className = 'palette';
        const title = document.createElement('h3');
        title.textContent = paletteName;
        // Owned checkbox
        const owned = isPaletteOwned(paletteName);
        if (owned) paletteDiv.classList.add('owned');

        const ownedLabel = document.createElement('label');
        ownedLabel.style.fontSize = '0.85rem';
        ownedLabel.style.marginLeft = '0.5rem';
        const ownedInput = document.createElement('input');
        ownedInput.type = 'checkbox';
        ownedInput.checked = owned;
        ownedInput.title = 'Mark palette as owned';
        ownedInput.addEventListener('change', (e) => {
            const isOwned = e.target.checked;
            setPaletteOwned(paletteName, isOwned);
            if (isOwned) paletteDiv.classList.add('owned'); else paletteDiv.classList.remove('owned');
            // Rerun search to respect "only owned" filter
            // animate the card for feedback
            paletteDiv.classList.add('animate-owned');
            setTimeout(() => paletteDiv.classList.remove('animate-owned'), 300);
            updateOwnedCount();
            findClosestColors(true);
        });
        ownedLabel.appendChild(ownedInput);
        const badge = document.createElement('span');
        badge.className = 'owned-badge';
        badge.textContent = 'Owned';
        ownedLabel.appendChild(badge);

        const titleWrap = document.createElement('div');
        titleWrap.style.display = 'flex';
        titleWrap.style.alignItems = 'center';
        titleWrap.style.justifyContent = 'center';
        titleWrap.appendChild(title);
        titleWrap.appendChild(ownedLabel);
        paletteDiv.appendChild(titleWrap);

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
// Initialize onlyOwned from storage
const onlyOwnedEl = document.getElementById('onlyOwned');
if (onlyOwnedEl) {
    onlyOwnedEl.checked = loadOnlyOwned();
    onlyOwnedEl.addEventListener('change', (e) => {
        saveOnlyOwned(e.target.checked);
        findClosestColors(true);
    });
}

// Owned count UI
function updateOwnedCount() {
    const countEl = document.getElementById('ownedCount');
    if (!countEl) return;
    const map = loadOwnedPalettes();
    const count = Object.keys(map).length;
    countEl.textContent = String(count);
}

// Ensure initial owned count reflects storage
updateOwnedCount();

document.getElementById('colorInput').addEventListener('input', () => findClosestColors(true));
document.getElementById('excludeSame').addEventListener('change', () => findClosestColors(true));
document.getElementById('limitOnePerPalette').addEventListener('change', () => findClosestColors(true));

// Hook up mark all / unmark all buttons
const markBtn = document.getElementById('markAllOwned');
const unmarkBtn = document.getElementById('unmarkAllOwned');
if (markBtn) markBtn.addEventListener('click', () => markAllOwned());
if (unmarkBtn) unmarkBtn.addEventListener('click', () => unmarkAllOwned());
