import type { LocalityConfig } from "@/lib/locality";

const boardWebsite = "https://www.loudoun.gov/86/Board-of-Supervisors";

export const loudounCounty: LocalityConfig = {
  id: "loudoun-county-va",
  name: "Loudoun County",
  state: "Virginia",
  supported: true,
  agendaSources: [
    { name: "Board and Planning Commission meetings", url: "https://www.loudoun.gov/Meetings" },
    { name: "Board meeting documents", url: "https://www.loudoun.gov/bosdocuments" },
    { name: "County meetings calendar", url: "https://www.loudoun.gov/calendar.aspx?CID=14" },
  ],
  governingBodies: [
    { name: "Loudoun County Board of Supervisors", type: "County governing body", website: boardWebsite },
    { name: "Loudoun County Planning Commission", type: "Advisory commission", website: "https://www.loudoun.gov/86/Planning-Commission" },
  ],
  representatives: [
    { name: "Phyllis J. Randall", title: "Chair At-Large", website: boardWebsite, phone: "703-777-0204" },
    { name: "Michael R. Turner", title: "Supervisor", district: "Ashburn", website: boardWebsite, phone: "703-777-0204" },
    { name: "Juli E. Briskman", title: "Supervisor", district: "Algonkian", website: boardWebsite, phone: "703-777-0204" },
    { name: "Sylvia R. Glass", title: "Supervisor", district: "Broad Run", website: boardWebsite, phone: "703-777-0204" },
    { name: "Caleb A. Kershner", title: "Supervisor", district: "Catoctin", website: boardWebsite, phone: "703-777-0204" },
    { name: "Matthew F. Letourneau", title: "Supervisor", district: "Dulles", website: boardWebsite, phone: "703-777-0204" },
    { name: "Kristen C. Umstattd", title: "Supervisor", district: "Leesburg", website: boardWebsite, phone: "703-777-0204" },
    { name: "Laura A. TeKrony", title: "Supervisor", district: "Little River", website: boardWebsite, phone: "703-777-0204" },
    { name: "Koran T. Saines", title: "Supervisor", district: "Sterling", website: boardWebsite, phone: "703-777-0204" },
  ],
  participationLinks: [
    { label: "Board public-input instructions", url: "https://www.loudoun.gov/4853/About-Board-of-Supervisors-Meetings", detail: "Advance speaker sign-up generally closes at noon on the meeting day; verify for the specific meeting." },
    { label: "Planning Commission public-hearing instructions", url: "https://www.loudoun.gov/1890/Speaking-at-Planning-Commission-Public-H", detail: "Written and spoken comments may become part of the public record." },
    { label: "County contact directory", url: "https://www.loudoun.gov/2364/Contact-Us" },
  ],
  directoryUrl: "https://www.loudoun.gov/Directory.aspx",
  mainPhone: "703-777-0100",
};

export const localityOptions = [
  { id: loudounCounty.id, name: "Loudoun County, Virginia", supported: true },
  { id: "fairfax-county-va", name: "Fairfax County, Virginia — Coming soon", supported: false },
] as const;

export const stateOptions = [
  { id: "virginia", name: "Virginia", supported: true },
  { id: "maryland", name: "Maryland — Coming soon", supported: false },
  { id: "washington-dc", name: "Washington, DC — Coming soon", supported: false },
] as const;
