export interface Driver {
  code: string;
  name: string;
  shortName: string;
  teams: Record<number, string>;
  image: string;
}

export const drivers: Record<string, Driver> = {
  RIC: { code: "RIC", name: "Daniel Ricciardo", shortName: "Ricciardo", teams: { 2024: "RB" }, image: "/drivers/ric.png" },
  SAR: { code: "SAR", name: "Logan Sargeant", shortName: "Sargeant", teams: { 2024: "Williams" }, image: "/drivers/sar.png" },
  DRU: { code: "DRU", name: "Felipe Drugovich", shortName: "Drugovich", teams: { 2024: "Aston Martin", 2025: "Aston Martin" }, image: "/drivers/dru.png" },
  VER: { code: "VER", name: "Max Verstappen", shortName: "Verstappen", teams: { 2024: "Red Bull Racing", 2025: "Red Bull Racing" }, image: "/drivers/ver.png" },
  PER: { code: "PER", name: "Sergio Pérez", shortName: "Pérez", teams: { 2024: "Red Bull Racing", 2025: "Red Bull Racing" }, image: "/drivers/per.png" },
  HAM: { code: "HAM", name: "Lewis Hamilton", shortName: "Hamilton", teams: { 2024: "Mercedes", 2025: "Ferrari" }, image: "/drivers/ham.png" },
  RUS: { code: "RUS", name: "George Russell", shortName: "Russell", teams: { 2024: "Mercedes", 2025: "Mercedes" }, image: "/drivers/rus.png" },
  LEC: { code: "LEC", name: "Charles Leclerc", shortName: "Leclerc", teams: { 2024: "Ferrari", 2025: "Ferrari" }, image: "/drivers/lec.png" },
  SAI: { code: "SAI", name: "Carlos Sainz", shortName: "Sainz", teams: { 2024: "Ferrari", 2025: "Williams" }, image: "/drivers/sai.png" },
  NOR: { code: "NOR", name: "Lando Norris", shortName: "Norris", teams: { 2024: "McLaren", 2025: "McLaren" }, image: "/drivers/nor.png" },
  PIA: { code: "PIA", name: "Oscar Piastri", shortName: "Piastri", teams: { 2024: "McLaren", 2025: "McLaren" }, image: "/drivers/pia.png" },
  ALO: { code: "ALO", name: "Fernando Alonso", shortName: "Alonso", teams: { 2024: "Aston Martin", 2025: "Aston Martin" }, image: "/drivers/alo.png" },
  STR: { code: "STR", name: "Lance Stroll", shortName: "Stroll", teams: { 2024: "Aston Martin", 2025: "Aston Martin" }, image: "/drivers/str.png" },
  GAS: { code: "GAS", name: "Pierre Gasly", shortName: "Gasly", teams: { 2024: "Alpine", 2025: "Alpine" }, image: "/drivers/gas.png" },
  OCO: { code: "OCO", name: "Esteban Ocon", shortName: "Ocon", teams: { 2024: "Alpine", 2025: "Haas" }, image: "/drivers/oco.png" },
  ALB: { code: "ALB", name: "Alexander Albon", shortName: "Albon", teams: { 2024: "Williams", 2025: "Williams" }, image: "/drivers/alb.png" },
  COL: { code: "COL", name: "Franco Colapinto", shortName: "Colapinto", teams: { 2024: "Williams", 2025: "Williams" }, image: "/drivers/col.png" },
  TSU: { code: "TSU", name: "Yuki Tsunoda", shortName: "Tsunoda", teams: { 2024: "RB", 2025: "RB" }, image: "/drivers/tsu.png" },
  LAW: { code: "LAW", name: "Liam Lawson", shortName: "Lawson", teams: { 2024: "RB", 2025: "RB" }, image: "/drivers/law.png" },
  BOT: { code: "BOT", name: "Valtteri Bottas", shortName: "Bottas", teams: { 2024: "Kick Sauber", 2025: "Kick Sauber" }, image: "/drivers/bot.png" },
  ZHO: { code: "ZHO", name: "Zhou Guanyu", shortName: "Zhou", teams: { 2024: "Kick Sauber", 2025: "Kick Sauber" }, image: "/drivers/zho.png" },
  MAG: { code: "MAG", name: "Kevin Magnussen", shortName: "Magnussen", teams: { 2024: "Haas", 2025: "Haas" }, image: "/drivers/mag.png" },
  HUL: { code: "HUL", name: "Nico Hülkenberg", shortName: "Hülkenberg", teams: { 2024: "Haas", 2025: "Kick Sauber" }, image: "/drivers/hul.png" },
  BEA: { code: "BEA", name: "Oliver Bearman", shortName: "Bearman", teams: { 2024: "Ferrari", 2025: "Haas" }, image: "/drivers/bea.png" },
  DOO: { code: "DOO", name: "Jack Doohan", shortName: "Doohan", teams: { 2024: "Alpine", 2025: "Alpine" }, image: "/drivers/doo.png" },
  ANT: { code: "ANT", name: "Andrea Kimi Antonelli", shortName: "Antonelli", teams: { 2025: "Mercedes" }, image: "/drivers/ant.png" }
};

export const getDriverTeam = (code: string, year: number): string => {
  const driver = drivers[code.toUpperCase()];
  if (!driver) return "Unknown";
  // Try exact year, fallback to 2024, fallback to first available
  return driver.teams[year] || driver.teams[2024] || Object.values(driver.teams)[0] || "Unknown";
};
