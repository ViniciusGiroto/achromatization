/// Casting as any because TypeScript sucks at HTML/SVG
const singletForm = document.getElementById("form-singlet") as any;
const singletPath = document.getElementById("path-singlet") as any;

const doubletForm = document.getElementById("form-doublet") as any;
const doubletPath = document.getElementById("path-doublet") as any;

const singletInputs = singletForm.elements as { [key: string]: HTMLInputElement };
const doubletInputs = doubletForm.elements as { [key: string]: HTMLInputElement };

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
  const fixed = doubletInputs.fixed.value;

  const n1 = doubletInputs.n1.valueAsNumber;
  const n2 = doubletInputs.n2.valueAsNumber;

  const d1 = doubletInputs.d1.valueAsNumber;
  const d2 = doubletInputs.d2.valueAsNumber;

  let r1: number, r2: number, r3: number;
  /*
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
  */

  if (fixed === "r1") {
    r1 = parseR(doubletInputs.r1.value);
    r2 = (1 - n1) * (1 - (n1 - no) * d1 / n1 / r1) / (p1 - (n1 - no) / r1);
    r3 = (ni - n2) * (1 - (n2 - 1) * d2 / n2 / r2) / (p2 - (n2 - 1) / r2);
  } else if (fixed === "r2") {
    r2 = parseR(doubletInputs.r2.value);
    r1 = (n1 - no) * (1 - (1 - n1) * d1 / n1 / r2) / (p1 - (1 - n1) / r2);
    r3 = (ni - n2) * (1 - (n2 - 1) * d2 / n2 / r2) / (p2 - (n2 - 1) / r2);
  } else if (fixed === "r3") {
    r3 = parseR(doubletInputs.r3.value);
    r2 = (n2 - 1) * (1 - (ni - n2) * d2 / n2 / r3) / (p2 - (ni - n2) / r3);
    r1 = (n1 - no) * (1 - (1 - n1) * d1 / n1 / r2) / (p1 - (1 - n1) / r2);
  } else {
    r1 = (-n1 + 2 * n1 * n1 - n1 * no + Math.sqrt((n1 - 2 * n1 * n1 + n1 * no) ** 2 - 4 * n1 * d1 * p1 * (-n1 + n1 * n1 + no - n1 * no))) / (2 * n1 * p1);
    r2 = -r1;
    r3 = (ni - n2) * (1 - (n2 - 1) * d2 / n2 / r2) / (p2 - (n2 - 1) / r2);
  }

  const radius = { r1, r2, r3 };
  doubletForm.querySelectorAll("input[name^=r]").forEach((input: any) => {
    input.disabled = input.name != fixed;
    if (input.disabled) {
      input.value = radius[input.name];
    }
  });
  doubletPath.attributes.d.value = `m -1.0 -1.5 ${curve(r1, false)} h 2 ${curve(r3, true)} z m 1 3 ${curve(r2, true)}`;
  doubletInputs.f1.valueAsNumber = 1 / p1;
  doubletInputs.f2.valueAsNumber = 1 / p2;
}

function update() {
  const fixed = singletInputs.fixed.value;
  const r2emr1 = singletInputs.r2emr1.checked;

  /*
  singletForm.querySelectorAll("input[type=radio]+input").forEach((input: any) => {
    input.disabled = input.name != fixed;
  });
  */

  const no = singletInputs.no.valueAsNumber;
  const nl = singletInputs.nl.valueAsNumber;
  const ni = singletInputs.ni.valueAsNumber;

  const v1 = doubletInputs.v1.valueAsNumber;
  const v2 = doubletInputs.v2.valueAsNumber;

  const d1 = singletInputs.d1.valueAsNumber;

  const singlet = {
    r1: 0,
    r2: 0,
    p: 0,
    f: 0,
  }

  if (r2emr1) {
    if (fixed === "f") {
      singlet.f = parseR(singletInputs.f.value);
      singlet.p = 1 / singlet.f;

      let a = nl * (ni - 2 * nl + no);
      let b = d1 * (-ni * nl + nl * nl + ni * no - nl * no);
      let c = a * a - 4 * nl * b * singlet.p;

      singlet.r1 = (nl * (-ni + 2 * nl - no) + Math.sqrt(c)) / (2 * nl * singlet.p);
      singlet.r2 = -singlet.r1;
    } else {
      if (fixed === "r1") {
        singlet.r2 = -(singlet.r1 = parseR(singletInputs.r1.value));
      } else {
        singlet.r1 = -(singlet.r2 = parseR(singletInputs.r2.value));
      }

      singlet.p = (d1 * ni * nl - d1 * nl * nl - d1 * ni * no + d1 * nl * no - ni * nl * singlet.r1 + 2 * nl * nl * singlet.r1 - nl * no * singlet.r1) / (nl * singlet.r1 * singlet.r1);
      singlet.f = 1 / singlet.p;
    }
  } else {
    if (fixed === "f") {
      singlet.r1 = parseR(singletInputs.r1.value);
      singlet.r2 = parseR(singletInputs.r2.value);
      singlet.p = singletPower(no, nl, ni, singlet.r1, singlet.r2, singletInputs.d1.valueAsNumber);
    } else if (fixed === "r1") {
      singlet.p = 1 / parseR(singletInputs.f.value);
      singlet.r2 = parseR(singletInputs.r2.value);
      singlet.r1 = ((nl - no) * (-(d1 * ni) + d1 * nl + nl * singlet.r2)) / (nl * (-ni + nl + singlet.p * singlet.r2));
    } else { // r2
      singlet.p = 1 / parseR(singletInputs.f.value);
      singlet.r1 = parseR(singletInputs.r1.value);
      singlet.r2 = ((ni - nl) * (d1 * nl - d1 * no - nl * singlet.r1)) / (nl * (nl - no - singlet.p * singlet.r1));
    }

    singlet.f = 1 / singlet.p;
  }


  singletForm.querySelectorAll("input[type=radio]+input").forEach((input: any) => {
    input.disabled = (input.name === fixed) !== r2emr1;

    if (input.disabled) {
      input.value = singlet[input.name];
    }
  });

  const p1 = singlet.p * v1 / (v1 - v2);
  const p2 = singlet.p * v2 / (v2 - v1);

  console.log(singlet.p, p1, p2, p1 + p2);

  singletPath.attributes.d.value = `m -0.5 -1.5 ${curve(singlet.r1, false)} h 1 ${curve(singlet.r2, true)} z`;
  updateDoublet(p1, p2, no, ni);
}

singletForm.addEventListener("input", update);
doubletForm.addEventListener("input", update);

update();
