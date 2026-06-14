/**
 * render_canva.js - Renderer for Tali bodygraph template using THD API data.
 * renderBodygraph(apiData) -> SVG string
 */
'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = __dirname;
const SVG_PATH = path.join(ROOT, 'TALI_with_ids.svg');

const SVG_TEMPLATE = fs.readFileSync(SVG_PATH, 'utf-8');

const C_DESIGN   = '#a62121';  // red — Design
const C_PERSON   = '#30302e';  // dark graphite — Personality
const C_CENTER   = '#90734b';  // beige-brown — defined center
const ALPHA_CDEF = '0.65';

// Maps THD API center names → SVG element IDs
const CENTER_TO_SVG = {
  'Ajna':        'Center_Ajna',
  'Ego':         'Center_Heart',
  'Sacral':      'Center_Sacral',
  'SolarPlexus': 'Center_SolarPlexus',
  'Spleen':      'Center_Spleen',
  'Throat':      'Center_Throat',
  'G':           'Center_Identity',
  'Head':        'Center_Head',
  'Root':        'Center_Root',
};

// Y-coords of planet rows in D (left) column — for gate.line text overlay
const D_PLANET_Y = {
  'Sun': 116.5, 'Earth': 159.5, 'NorthNode': 202.0, 'SouthNode': 243.9,
  'Mercury': 281.2, 'Venus': 325.8, 'Mars': 365.0,
  'Jupiter': 405.6, 'Saturn': 452.7, 'Uranus': 494.8,
  'Neptune': 535.0, 'Pluto': 566.4, 'Moon': 609.4,
};

// Y-coords of planet rows in P (right) column
const P_PLANET_Y = {
  'Sun': 122.3, 'Earth': 165.4, 'NorthNode': 207.9, 'SouthNode': 249.7,
  'Mercury': 287.1, 'Venus': 331.6, 'Mars': 367.6, 'Jupiter': 411.4,
  'Saturn': 453.6, 'Uranus': 500.7, 'Neptune': 531.6, 'Pluto': 572.3, 'Moon': 615.3,
};

// Integration circuit channels — handled via Bridge paths instead of Ch_ paths
const INTEGRATION_CHANNEL_GATES = [
  [10, 34], [20, 34], [10, 57], [20, 57],
];

function normalizeChannelKey(apiId) {
  const [a, b] = apiId.split('-').map(Number);
  return `Ch_${Math.min(a, b)}_${Math.max(a, b)}`;
}

function isIntegrationChannel(apiId) {
  const [a, b] = apiId.split('-').map(Number);
  return INTEGRATION_CHANNEL_GATES.some(([x, y]) =>
    (a === x && b === y) || (a === y && b === x)
  );
}

function findTagEnd(svg, tagStart) {
  let i = tagStart + 1;
  let inStr = false;
  let strChar = '';
  while (i < svg.length) {
    const c = svg[i];
    if (inStr) {
      if (c === strChar) inStr = false;
    } else if (c === '"' || c === "'") {
      inStr = true;
      strChar = c;
    } else if (c === '>') {
      return i + 1;
    }
    i++;
  }
  return i;
}

/**
 * Find element by id and replace its fill (and optionally opacity).
 * Returns unchanged svg if id not found.
 */
function setFill(svg, elementId, color, opacity) {
  const marker = `id="${elementId}"`;
  const pos = svg.indexOf(marker);
  if (pos === -1) return svg;

  const tagStart = svg.lastIndexOf('<', pos);
  if (tagStart === -1) return svg;

  const tagEnd = findTagEnd(svg, tagStart);
  let tag = svg.slice(tagStart, tagEnd);

  if (/ fill="/.test(tag)) {
    tag = tag.replace(/ fill="[^"]*"/, ` fill="${color}"`);
  }

  if (opacity !== undefined) {
    if (/ opacity="/.test(tag)) {
      tag = tag.replace(/ opacity="[^"]*"/, ` opacity="${opacity}"`);
    } else {
      tag = tag.replace('/>', ` opacity="${opacity}"/>`);
    }
  }

  return svg.slice(0, tagStart) + tag + svg.slice(tagEnd);
}

/**
 * Pick activation color: D only → red, P only or both → graphite.
 * Returns null if neither active.
 */
function activationColor(hasD, hasP) {
  if (hasD && !hasP) return C_DESIGN;
  if (hasP)          return C_PERSON;
  return null;
}

function renderBodygraph(apiData) {
  let svg = SVG_TEMPLATE;

  const definedCenters   = new Set(apiData.centers?.defined   || []);
  const personalityGates = new Set(apiData.gates?.personalityGates || []);
  const designGates      = new Set(apiData.gates?.designGates      || []);
  const channels         = apiData.channels || [];
  const pActs = apiData.activations?.personality || [];
  const dActs = apiData.activations?.design      || [];

  // 1. Centers
  for (const [apiName, svgId] of Object.entries(CENTER_TO_SVG)) {
    if (definedCenters.has(apiName)) {
      svg = setFill(svg, svgId, C_CENTER, ALPHA_CDEF);
    }
  }

  // 2. Channels + Bridges
  // Track which integration gates are activated by D or P
  const integBridge = { D: false, P: false };  // gate 57 side
  const bridge34    = { D: false, P: false };  // gate 34 side

  for (const ch of channels) {
    const [g1, g2] = (ch.id || ch.gates || '').split('-').map(Number);
    if (!g1 || !g2) continue;

    const hasD = designGates.has(g1) || designGates.has(g2);
    const hasP = personalityGates.has(g1) || personalityGates.has(g2);

    if (isIntegrationChannel(ch.id)) {
      // Track bridge activation by anchor gate
      if (g1 === 57 || g2 === 57) {
        if (hasD) integBridge.D = true;
        if (hasP) integBridge.P = true;
      } else if (g1 === 34 || g2 === 34) {
        if (hasD) bridge34.D = true;
        if (hasP) bridge34.P = true;
      }
      continue;  // integration channels have no individual Ch_ paths
    }

    const color = activationColor(hasD, hasP);
    if (color) {
      const key = normalizeChannelKey(ch.id);
      // Both shadow-pair paths get the same color
      svg = setFill(svg, `${key}_D`, color);
      svg = setFill(svg, `${key}_P`, color);
    }
  }

  // Color bridge paths (both shadow copies same color)
  if (integBridge.D || integBridge.P) {
    const c = activationColor(integBridge.D, integBridge.P);
    svg = setFill(svg, 'Bridge_Integ_D', c, '1');
    svg = setFill(svg, 'Bridge_Integ_P', c, '1');
  }
  if (bridge34.D || bridge34.P) {
    const c = activationColor(bridge34.D, bridge34.P);
    svg = setFill(svg, 'Bridge_34_D', c, '1');
    svg = setFill(svg, 'Bridge_34_P', c, '1');
  }

  // 3. Planet gate.line numbers as text overlay (positioned next to planet icons)
  const FONT = 'font-family="Arial,Helvetica,sans-serif" font-size="11"';
  let textOverlay = '\n<!-- Planet gate.line numbers -->\n';

  for (const act of dActs) {
    const y = D_PLANET_Y[act.planet];
    if (!y || act.gate == null) continue;
    textOverlay += `<text x="78" y="${y + 4}" ${FONT} fill="${C_DESIGN}" dominant-baseline="middle">${act.gate}.${act.line}</text>\n`;
  }
  for (const act of pActs) {
    const y = P_PLANET_Y[act.planet];
    if (!y || act.gate == null) continue;
    textOverlay += `<text x="772" y="${y + 4}" ${FONT} fill="${C_PERSON}" text-anchor="end" dominant-baseline="middle">${act.gate}.${act.line}</text>\n`;
  }

  svg = svg.replace('</svg>', textOverlay + '</svg>');

  return svg;
}

module.exports = { renderBodygraph };
