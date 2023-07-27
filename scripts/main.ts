/// Casting as any because TypeScript sucks at HTML/SVG
const singletForm = document.getElementById("form-singlet") as any;
const singletPath = document.getElementById("path-singlet") as any;

const doubletForm = document.getElementById("form-doublet") as any;
const doubletPath = document.getElementById("path-doublet") as any;

const singlet = singletForm.elements as { [key: string]: HTMLInputElement };
const doublet = doubletForm.elements as { [key: string]: HTMLInputElement };

function parseR(value: string): number {
  if ("infinity".startsWith(value.toLowerCase())) return Infinity;
  else if ("-infinity".startsWith(value.toLowerCase())) return -Infinity;
  return parseFloat(value);
}

function singletPower(no: number, nl: number, ni: number, r1: number, r2: number, d1: number): number {
  const p1 = (nl - no) / r1;
  const p2 = (ni - nl) / r2;

  return p1 + p2 - p1 * p2 * d1 / nl;
}

function curve(radius: number, invert: boolean): string {
  if (isFinite(radius) && isFinite(1 / radius)) {
    if (radius > 0) {
      return invert ? "a 5 5 180 0 1 0 -3" : "a 5 5 180 0 0 0 3";
    }
    return invert ? "a 5 5 180 0 0 0 -3" : "a 5 5 180 0 1 0 3";
  }
  return invert ? "v -3" : "v 3"
}

function updateDoublet(p1: number, p2: number, no: number, ni: number) {
  const fixed = doublet.fixed.value;

  const n1 = doublet.n1.valueAsNumber;
  const n2 = doublet.n2.valueAsNumber;

  const d1 = doublet.d1.valueAsNumber;
  const d2 = doublet.d2.valueAsNumber;

  let r1: number, r2: number, r3: number;

  if (fixed === "r1") {
    r1 = parseR(doublet.r1.value);
    r2 = (n2 - n1) * (1 - (n1 - no) * d1 / n1 / r1) / (p1 - (n1 - no) / r1);
    r3 = (ni - n2) * (1 - (n2 - n1) * d2 / n2 / r2) / (p2 - (n2 - n1) / r2);
  } else if (fixed === "r2") {
    r2 = parseR(doublet.r2.value);
    r1 = (n1 - no) * (1 - (n2 - n1) * d1 / n1 / r2) / (p1 - (n2 - n1) / r2);
    r3 = (ni - n2) * (1 - (n2 - n1) * d2 / n2 / r2) / (p2 - (n2 - n1) / r2);
  } else {
    r3 = parseR(doublet.r3.value);
    r2 = (n2 - n1) * (1 - (ni - n2) * d2 / n2 / r3) / (p2 - (ni - n2) / r3);
    r1 = (n1 - no) * (1 - (n2 - n1) * d1 / n1 / r2) / (p1 - (n2 - n1) / r2);
  }

  const radius = { r1, r2, r3 };
  doubletForm.querySelectorAll("input[name^=r]").forEach((input: any) => {
    input.disabled = input.name != fixed;
    if (input.disabled) {
      input.value = radius[input.name];
    }
  });
  doubletPath.attributes.d.value = `m -1.0 -1.5 ${curve(r1, false)} h 2 ${curve(r3, true)} z m 1 3 ${curve(r2, true)}`;
  doublet.p1.valueAsNumber = p1;
  doublet.p2.valueAsNumber = p2;
}

function update() {
  const r1 = parseR(singlet.r1.value);
  const r2 = parseR(singlet.r2.value);

  const no = singlet.no.valueAsNumber;
  const nl = singlet.nl.valueAsNumber;
  const ni = singlet.ni.valueAsNumber;

  const v1 = doublet.v1.valueAsNumber;
  const v2 = doublet.v2.valueAsNumber;

  const p = singletPower(no, nl, ni, r1, r2, singlet.d1.valueAsNumber);

  const p1 = p * v1 / (v1 - v2);
  const p2 = p * v2 / (v2 - v1);

  console.log(p, p1, p2, p1 + p2);

  singletPath.attributes.d.value = `m -0.5 -1.5 ${curve(r1, false)} h 1 ${curve(r2, true)} z`;
  singlet.p.valueAsNumber = p;
  updateDoublet(p1, p2, no, ni);
}

singletForm.addEventListener("input", update);
doubletForm.addEventListener("input", update);

update();
