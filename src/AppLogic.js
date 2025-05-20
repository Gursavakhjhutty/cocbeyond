import { useEffect } from "react";
import { OCCUPATIONS } from "./occupations";

export const SKILLS = [
  { name: "Accounting", base: 5 },
  { name: "Anthropology", base: 1 },
  { name: "Appraise", base: 5 },
  { name: "Archaeology", base: 1 },
  { name: "Charm", base: 15 },
  { name: "Climb", base: 20 },
  { name: "Credit Rating", base: 0 },
  { name: "Cthulhu Mythos", base: 0 },
  { name: "Dodge", base: 0 },
  { name: "Fast Talk", base: 5 },
  { name: "Fighting (Brawl)", base: 25 },
  { name: "Firearms (Handgun)", base: 20 },
  { name: "First Aid", base: 30 },
  { name: "History", base: 5 },
  { name: "Library Use", base: 20 },
  { name: "Listen", base: 20 },
  { name: "Navigate", base: 10 },
  { name: "Occult", base: 5 },
  { name: "Persuade", base: 10 },
  { name: "Psychology", base: 10 },
  { name: "Spot Hidden", base: 25 },
  { name: "Stealth", base: 20 },
  { name: "Survival", base: 10 },
];

export function rollNd6(n) {
  return Array.from({ length: n }, () => Math.ceil(Math.random() * 6)).reduce((a, b) => a + b, 0);
}

export function generateAttributes() {
  const STR = rollNd6(3) * 5;
  const CON = rollNd6(3) * 5;
  const DEX = rollNd6(3) * 5;
  const APP = rollNd6(3) * 5;
  const POW = rollNd6(3) * 5;
  const LUCK = rollNd6(3) * 5;
  const SIZ = (rollNd6(2) + 6) * 5;
  const INT = (rollNd6(2) + 6) * 5;
  const EDU = (rollNd6(2) + 6) * 5;
  const MOV = (() => { if (STR > SIZ && DEX > SIZ) return 9; if (STR >= SIZ || DEX >= SIZ) return 8; return 7; })();

  const HP = Math.floor((CON + SIZ) / 10);
  const SAN = POW;
  const MP = Math.floor(POW / 5);
  const DODGE = Math.floor(DEX / 2);
  const Personal_Points = INT * 2;

  return {
    STR,
    CON,
    DEX,
    INT,
    SIZ,
    POW,
    APP,
    EDU,
    MOV,
    LUCK,
    HP,
    SAN,
    MP,
    DODGE,
    Personal_Points,
  };
}

export function splitSkillsIntoColumns(skills, columns) {
  const perColumn = Math.ceil(skills.length / columns);
  return Array.from({ length: columns }, (_, colIndex) =>
    skills.slice(colIndex * perColumn, colIndex * perColumn + perColumn)
  );
}

/*export async function fetchGeminiDescription(occupation) {
  const res = await fetch("https://cocbeyond.onrender.com/api/occupation-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ occupation }),
  });

  const data = await res.json();
  return data.description || "Description unavailable.";
}*/

export async function generateOccupationData(occupation, setOccupationDetails) {
  if (!occupation) return;
  const selectedOccupation = OCCUPATIONS.find(o => o.name === occupation);
  const creditRating = selectedOccupation?.creditRating || "Credit Rating unavailable.";
  const skills = selectedOccupation?.skills || "Skills unavailable.";
  const points = selectedOccupation?.points || "Points unavailable.";
  const description = selectedOccupation?.description || "Description unavailable.";

  setOccupationDetails({ creditRating, skills, description, points });
}

/*export function useOccupationEffect(occupation, setOccupationDetails) {
  useEffect(() => {
    if (occupation) {
      generateOccupationData(occupation, setOccupationDetails);
    }
  }, [occupation]);
}*/

if (typeof window !== "undefined") {
  window.generateAttributes = generateAttributes;
}
