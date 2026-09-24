/* ============================================================================
   art.js — the character rig (paper-doll engine)

   Every character is built from the SAME anchored parts on one grid, so an
   outfit, a hat, an activity, or an idle behaviour is authored ONCE and works
   on all 9. viewBox is 0 0 100 132 for every character.

   Shared anchors (do not drift — outfits/hats/props depend on them):
     head centre .......... (50, 58)   radius ~19
     eye line ............. y 56,  eyes at x 43 / 57
     mouth ................ (50, 67)
     hat seat ............. (50, 40)   top of head
     neck / collar ........ (50, 82)
     torso box ............ x 30..70,  y 84..122
     left shoulder pivot .. (35, 90)   right shoulder pivot (65, 90)
     right hand (held) .... (72, 108)

   Layer order (back to front): shadow, back-arm, torso+outfit, legs,
   front-arm+held-prop, head (ears, skull, face, signature, hat).

   Groups carry classes the idle ticker + activities toggle:
     .eyes .pupils .browL .browR  .mouth (m-smile/m-open/m-flat/m-o/m-frown)
     .arm-front .arm-back  .held  .sweat  .zzz
   Root <g class="char"> gets state classes: blink look-l look-r scratch talk
   yawn oof, and act-<anim> for the assigned activity.
   ============================================================================ */

const SKIN_DEFAULT = "#f0c9a0";
const OUTLINE = "#3a2f28";

/* ---- shared body parts ---------------------------------------------------- */
function shadow() {
  return `<ellipse class="shadow" cx="50" cy="127" rx="27" ry="5" fill="#00000022"/>`;
}
function feet(color) {
  return `<ellipse cx="42" cy="123" rx="7" ry="5" fill="${color}"/>
          <ellipse cx="58" cy="123" rx="7" ry="5" fill="${color}"/>`;
}
function torso(color) {
  return `<path class="torso" d="M31 123 Q27 88 50 83 Q73 88 69 123 Z" fill="${color}"/>`;
}
/* arms rotate about the shoulder; transform-origin set inline so CSS rotate works */
function backArm(color, skin) {
  return `<g class="arm-back" style="transform-origin:35px 90px">
    <path d="M35 90 Q27 100 27 110" stroke="${color}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="27" cy="111" r="5" fill="${skin}"/></g>`;
}
function frontArm(color, skin, heldSVG) {
  return `<g class="arm-front" style="transform-origin:65px 90px">
    <path d="M65 90 Q73 100 73 110" stroke="${color}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="73" cy="111" r="5" fill="${skin}"/>
    <g class="held" transform="translate(73 108)">${heldSVG || ""}</g></g>`;
}

/* ---- face (identical anchors for all humanoid heads) ---------------------- */
function face() {
  return `
    <g class="eyes">
      <g class="eye"><ellipse cx="43" cy="56" rx="3.4" ry="4.2" fill="#fff"/>
        <circle class="pupil" cx="43" cy="56.5" r="2.2" fill="${OUTLINE}"/></g>
      <g class="eye"><ellipse cx="57" cy="56" rx="3.4" ry="4.2" fill="#fff"/>
        <circle class="pupil" cx="57" cy="56.5" r="2.2" fill="${OUTLINE}"/></g>
    </g>
    <g class="eyes-shut"><path d="M39 56 Q43 59 47 56" stroke="${OUTLINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M53 56 Q57 59 61 56" stroke="${OUTLINE}" stroke-width="1.8" fill="none" stroke-linecap="round"/></g>
    <path class="brow browL" d="M39 50 Q43 48 47 50" stroke="${OUTLINE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <path class="brow browR" d="M53 50 Q57 48 61 50" stroke="${OUTLINE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <g class="mouth">
      <path class="m m-smile" d="M45 65 Q50 70 55 65" stroke="#b5654a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <ellipse class="m m-open" cx="50" cy="67" rx="4" ry="5" fill="#8a4636"/>
      <path class="m m-flat" d="M46 67 H54" stroke="#b5654a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <circle class="m m-o" cx="50" cy="67" r="3" fill="#8a4636"/>
      <path class="m m-frown" d="M45 68 Q50 63 55 68" stroke="#b5654a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    </g>
    <circle class="sweat" cx="64" cy="52" r="3.2" fill="#7fd0e8"/>
    <g class="zzz"><text x="70" y="40" font-size="10" fill="#9aa6b2" font-weight="800">z</text>
      <text x="76" y="32" font-size="7" fill="#b7c1cc" font-weight="800">z</text></g>`;
}

/* ---- per-character heads (skull + ears/antenna + signature) --------------
   Each returns the head group contents. Face() is appended by the builder so
   every character shares the same animatable eyes/mouth. Heads sit on the
   shared anchor: centre (50,58), so hats and expressions line up. */
const HEADS = {
  gnome: s => `<circle cx="50" cy="58" r="18" fill="${s}"/>
    <ellipse cx="50" cy="64" rx="5.5" ry="4.5" fill="#f0a878"/>
    ${face()}
    <path class="sig" d="M34 64 Q50 90 66 64 Q60 82 50 84 Q40 82 34 64Z" fill="#fbfbf7"/>`,
  dog: s => `<ellipse class="ear" cx="30" cy="50" rx="7" ry="12" fill="#a86a34" style="transform-origin:34px 46px"/>
    <ellipse class="ear" cx="70" cy="50" rx="7" ry="12" fill="#a86a34" style="transform-origin:66px 46px"/>
    <circle cx="50" cy="56" r="19" fill="${s}"/>
    <ellipse cx="50" cy="64" rx="8" ry="6" fill="#f3ddc0"/>
    <circle cx="50" cy="61" r="3" fill="${OUTLINE}"/>
    ${face()}`,
  caveman: s => `<path d="M30 48 Q50 26 70 48 Q64 42 50 42 Q36 42 30 48Z" fill="#2e2620"/>
    <circle cx="50" cy="58" r="18" fill="${s}"/>
    ${face()}
    <path class="sig" d="M40 66 Q50 70 60 66 Q56 78 50 78 Q44 78 40 66Z" fill="#3a2f28"/>`,
  coder: s => `<path d="M31 50 Q50 34 69 50 Q50 44 31 50Z" fill="#7d5a34"/>
    <circle cx="50" cy="58" r="18" fill="${s}"/>
    ${face()}
    <g class="sig"><rect x="36" y="52" width="12" height="9" rx="4" fill="none" stroke="${OUTLINE}" stroke-width="2"/>
      <rect x="52" y="52" width="12" height="9" rx="4" fill="none" stroke="${OUTLINE}" stroke-width="2"/>
      <line x1="48" y1="56" x2="52" y2="56" stroke="${OUTLINE}" stroke-width="2"/></g>`,
  pm: s => `<path d="M31 52 Q50 36 69 52 Q50 46 31 52Z" fill="#2e2620"/>
    <circle cx="50" cy="58" r="18" fill="${s}"/>
    ${face()}
    <g class="sig"><path d="M32 56 Q28 64 33 70" stroke="${OUTLINE}" stroke-width="2.6" fill="none"/>
      <circle cx="33" cy="70" r="3.4" fill="${OUTLINE}"/></g>`,
  robot: () => `<rect x="33" y="40" width="34" height="34" rx="9" fill="#b7c1cc"/>
    <rect x="30" y="50" width="4" height="12" rx="2" fill="#8a97a5"/>
    <rect x="66" y="50" width="4" height="12" rx="2" fill="#8a97a5"/>
    <line x1="50" y1="40" x2="50" y2="31" stroke="#8a97a5" stroke-width="2.6"/>
    <circle cx="50" cy="29" r="3.5" fill="#e8743b"/>
    <g class="eyes"><rect x="39" y="52" width="8" height="8" rx="2.5" fill="#2c3e50"/>
      <rect x="53" y="52" width="8" height="8" rx="2.5" fill="#2c3e50"/>
      <g class="pupils"><circle cx="43" cy="56" r="2" fill="#7fd0e8"/><circle cx="57" cy="56" r="2" fill="#7fd0e8"/></g></g>
    <g class="eyes-shut"><rect x="39" y="55" width="8" height="2.4" rx="1" fill="#2c3e50"/>
      <rect x="53" y="55" width="8" height="2.4" rx="1" fill="#2c3e50"/></g>
    <g class="mouth"><rect class="m m-smile" x="43" y="66" width="14" height="3" rx="1.5" fill="#5b6b7d"/>
      <rect class="m m-open" x="44" y="64" width="12" height="7" rx="2" fill="#2c3e50"/>
      <rect class="m m-flat" x="44" y="67" width="12" height="2.4" rx="1" fill="#5b6b7d"/>
      <rect class="m m-o" x="46" y="65" width="8" height="6" rx="3" fill="#2c3e50"/>
      <rect class="m m-frown" x="43" y="66" width="14" height="3" rx="1.5" fill="#5b6b7d"/></g>
    <circle class="sweat" cx="66" cy="50" r="3.2" fill="#7fd0e8"/>
    <g class="zzz"><text x="70" y="40" font-size="10" fill="#9aa6b2" font-weight="800">z</text></g>`,
  warrior: s => `<circle cx="50" cy="58" r="18" fill="${s}"/>${face()}
    <path class="sig" d="M31 56 Q31 34 50 34 Q69 34 69 56 L69 50 Q50 44 31 50Z" fill="#b8c0c7"/>
    <rect class="sig" x="47" y="44" width="6" height="18" fill="#9aa6b2"/>`,
  alien: () => `<path class="ant" d="M40 40 Q36 26 30 24" stroke="#5bbd68" stroke-width="2.6" fill="none" stroke-linecap="round" style="transform-origin:40px 40px"/>
    <circle cx="30" cy="23" r="3.2" fill="#f0a641"/>
    <path class="ant" d="M60 40 Q64 26 70 24" stroke="#5bbd68" stroke-width="2.6" fill="none" stroke-linecap="round" style="transform-origin:60px 40px"/>
    <circle cx="70" cy="23" r="3.2" fill="#f0a641"/>
    <ellipse cx="50" cy="56" rx="20" ry="22" fill="#86dc8f"/>
    <g class="eyes"><ellipse cx="42" cy="56" rx="5.5" ry="8" fill="#1b1e26" transform="rotate(-16 42 56)"/>
      <ellipse cx="58" cy="56" rx="5.5" ry="8" fill="#1b1e26" transform="rotate(16 58 56)"/>
      <g class="pupils"><circle cx="41" cy="53" r="1.8" fill="#fff"/><circle cx="57" cy="53" r="1.8" fill="#fff"/></g></g>
    <g class="eyes-shut"><path d="M37 56 Q42 60 47 55" stroke="#3a6b3f" stroke-width="1.8" fill="none"/>
      <path d="M53 55 Q58 60 63 56" stroke="#3a6b3f" stroke-width="1.8" fill="none"/></g>
    <g class="mouth"><path class="m m-smile" d="M45 68 Q50 71 55 68" stroke="#3a6b3f" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse class="m m-open" cx="50" cy="69" rx="3" ry="4" fill="#3a6b3f"/>
      <path class="m m-flat" d="M46 69 H54" stroke="#3a6b3f" stroke-width="2" fill="none" stroke-linecap="round"/>
      <circle class="m m-o" cx="50" cy="69" r="2.4" fill="#3a6b3f"/>
      <path class="m m-frown" d="M45 70 Q50 66 55 70" stroke="#3a6b3f" stroke-width="2" fill="none" stroke-linecap="round"/></g>
    <g class="zzz"><text x="72" y="40" font-size="10" fill="#9aa6b2" font-weight="800">z</text></g>`,
  wizard: s => `<circle cx="50" cy="58" r="17" fill="${s}"/>${face()}
    <path class="sig" d="M35 62 Q50 96 65 62 Q58 86 50 88 Q42 86 35 62Z" fill="#f4f0ea"/>`,
};

/* Body colour + skin + which head, per character id. */
const RIG = {
  gnome:   { body: "#2f9e8f", skin: "#f6d3b0", head: "gnome"   },
  dog:     { body: "#c98a4e", skin: "#e0a866", head: "dog"     },
  caveman: { body: "#7d5a34", skin: "#d7a877", head: "caveman" },
  coder:   { body: "#5b6b7d", skin: "#f0c9a0", head: "coder"   },
  pm:      { body: "#3f78c4", skin: "#f0c9a0", head: "pm"      },
  robot:   { body: "#9aa6b2", skin: "#c3ccd6", head: "robot"   },
  warrior: { body: "#8a5f38", skin: "#e6b98a", head: "warrior" },
  alien:   { body: "#6fce7a", skin: "#86dc8f", head: "alien"   },
  wizard:  { body: "#6b46c1", skin: "#f0c9a0", head: "wizard"  },
};

/* ---- universal hats (drawn to the hat seat, fit every head) --------------- */
const HAT_SVG = {
  hardhat:   `<path d="M34 42 Q50 28 66 42 Z" fill="#f4b400"/><rect x="32" y="41" width="36" height="4" rx="2" fill="#e0a200"/>`,
  party:     `<path d="M50 22 L58 44 H42 Z" fill="#e8743b"/><circle cx="50" cy="21" r="3" fill="#f0a641"/>
              <circle cx="46" cy="36" r="1.6" fill="#fff"/><circle cx="54" cy="40" r="1.6" fill="#fff"/>`,
  crown:     `<path d="M36 44 L38 30 L44 38 L50 28 L56 38 L62 30 L64 44 Z" fill="#f4c430"/>
              <circle cx="50" cy="31" r="2" fill="#d8564b"/>`,
  tophat:    `<rect x="40" y="24" width="20" height="18" rx="2" fill="#2e2620"/><rect x="33" y="41" width="34" height="4" rx="2" fill="#2e2620"/>
              <rect x="40" y="37" width="20" height="4" fill="#d8564b"/>`,
  propeller: `<path d="M36 44 Q50 34 64 44 Z" fill="#4c9a6a"/><rect x="34" y="43" width="32" height="3" rx="1.5" fill="#3a7a52"/>
              <rect x="38" y="20" width="24" height="3" rx="1.5" fill="#e8743b"/><circle cx="50" cy="21" r="2.4" fill="#f0a641"/>`,
  helmet:    `<path d="M32 44 Q32 26 50 26 Q68 26 68 44 L68 40 Q50 34 32 40Z" fill="#b8c0c7"/><rect x="47" y="30" width="6" height="16" fill="#9aa6b2"/>`,
  gnomeHat:  `<path d="M30 46 Q50 -2 70 46 Q50 36 30 46Z" fill="#d8564b"/>`,
  wizardHat: `<path d="M28 46 Q50 -14 72 46 Q50 38 28 46Z" fill="#4c3391"/>
              <path d="M50 8 l1.8 4 4 .4 -3 2.8 .8 4-3.6-2-3.6 2 .8-4-3-2.8 4-.4Z" fill="#f0a641"/>`,
  chromehat: `<path d="M34 42 Q50 28 66 42 Z" fill="#e9edf2"/><rect x="32" y="41" width="36" height="4" rx="2" fill="#c7ced6"/>`,
};

/* ---- universal outfits (drawn to the torso box, fit every body) ----------- */
const OUTFIT_SVG = {
  cape:    `<path d="M32 88 Q50 96 68 88 L74 122 Q50 116 26 122 Z" fill="#d8564b" opacity=".92"/>`,
  labcoat: `<path d="M42 84 L42 122 L36 122 Q31 100 34 88 Z" fill="#fafafa"/>
            <path d="M58 84 L58 122 L64 122 Q69 100 66 88 Z" fill="#fafafa"/>
            <line x1="50" y1="86" x2="50" y2="120" stroke="#dfe4e8" stroke-width="1.5"/>`,
  hawaiian:`<path d="M31 92 Q50 88 69 92 L69 122 Q50 118 31 122 Z" fill="#f0a641"/>
            <circle cx="40" cy="102" r="3" fill="#d8564b"/><circle cx="54" cy="110" r="3" fill="#4c9a6a"/>
            <circle cx="60" cy="98" r="2.4" fill="#e8743b"/><circle cx="44" cy="116" r="2.4" fill="#4c9a6a"/>`,
  scarf:   `<path d="M38 84 Q50 90 62 84 L60 92 Q50 96 40 92 Z" fill="#c0483d"/>
            <path d="M56 90 L60 108 L54 108 L52 92 Z" fill="#c0483d"/>`,
  hero:    `<path d="M31 90 Q50 86 69 90 L69 122 Q50 118 31 122 Z" fill="#2f6fd0"/>
            <path d="M50 96 L54 104 L50 112 L46 104 Z" fill="#f4c430"/>`,
};

/* ---- activity poses: root class + arm/expression + held prop ---------------
   returns { cls, held, mouth } consumed by the builder. */
const ACTIVITY_POSE = {
  coding:    { cls: "act-coding",  held: `<rect x="-9" y="-2" width="18" height="12" rx="2" fill="#2c3e50"/><rect x="-7" y="0" width="14" height="7" rx="1" fill="#7fd0e8"/>` },
  coffee:    { cls: "act-coffee holding",  held: `<rect x="-4" y="-3" width="9" height="9" rx="1.5" fill="#fff"/><rect x="-3" y="-2" width="7" height="3" fill="#8a4636"/><path d="M5 -1 q4 0 4 3 t-4 3" stroke="#fff" stroke-width="1.6" fill="none"/>` },
  biking:    { cls: "act-biking",  held: "", prop: `<g class="bike"><circle cx="40" cy="120" r="8" fill="none" stroke="#3a2f28" stroke-width="2.4"/><circle cx="62" cy="120" r="8" fill="none" stroke="#3a2f28" stroke-width="2.4"/><path d="M40 120 L51 110 L62 120 M51 110 L51 118" stroke="#e8743b" stroke-width="2.4" fill="none"/></g>` },
  rca:       { cls: "act-rca holding",  held: `<rect x="-5" y="-6" width="11" height="14" rx="1.5" fill="#fafafa" stroke="#c7ced6" stroke-width="1"/><line x1="-3" y1="-3" x2="3" y2="-3" stroke="#9aa6b2" stroke-width="1"/><line x1="-3" y1="0" x2="3" y2="0" stroke="#9aa6b2" stroke-width="1"/>`, ticket: true },
  napping:   { cls: "act-napping sleep", held: "" },
  debugging: { cls: "act-debugging holding", held: `<ellipse cx="0" cy="2" rx="6" ry="5" fill="#f4c430"/><circle cx="-3" cy="-1" r="1.2" fill="#3a2f28"/><path d="M3 2 q3 0 3 2" stroke="#e8743b" stroke-width="1.6" fill="none"/>` },
};

/* ---- the builder ---------------------------------------------------------- */
/* Returns the inner <g class="char ..."> for one character, ready to drop
   inside an <svg viewBox="0 0 100 132">. cData = { hat, outfit, activity, gold }. */
function buildCharacter(cid, cData = {}) {
  const rig = RIG[cid]; if (!rig) return "";
  const headFn = HEADS[rig.head];
  const pose = cData.activity ? ACTIVITY_POSE[cData.activity] : null;

  const hatId = cData.hat;
  const hat = hatId && HAT_SVG[hatId] ? `<g class="hat">${HAT_SVG[hatId]}</g>` : "";
  const outfit = cData.outfit && OUTFIT_SVG[cData.outfit]
    ? `<g class="outfit">${OUTFIT_SVG[cData.outfit]}</g>` : "";
  const held = pose ? pose.held : "";
  const extraProp = pose && pose.prop ? pose.prop : "";
  const ticket = pose && pose.ticket ? `<text class="ticket" x="78" y="96" font-size="9">🎫</text>` : "";

  const rootCls = ["char", pose ? pose.cls : "", cData.gold ? "gold" : "", cData.oof ? "oof" : ""]
    .filter(Boolean).join(" ");

  // cape sits behind the torso; everything else in front
  const capeBehind = cData.outfit === "cape" ? outfit : "";
  const outfitFront = cData.outfit === "cape" ? "" : outfit;

  return `<g class="${rootCls}">
    ${shadow()}
    ${extraProp}
    ${capeBehind}
    ${backArm(rig.body, rig.skin)}
    ${torso(rig.body)}
    ${outfitFront}
    ${feet(rig.body)}
    ${frontArm(rig.body, rig.skin, held)}
    <g class="head">${headFn(rig.skin)}${hat}</g>
    ${ticket}
  </g>`;
}

/* expose for game.js (plain script include, no modules) */
window.buildCharacter = buildCharacter;
window.HAT_SVG = HAT_SVG;
window.OUTFIT_SVG = OUTFIT_SVG;
window.RIG = RIG;
