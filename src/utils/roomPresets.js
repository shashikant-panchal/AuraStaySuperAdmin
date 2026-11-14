export const ROOM_TYPE_PRESETS = [
  {
    name: 'Standard Room',
    price: 2500,
    bed: 'Queen Bed',
    maxAdults: 2,
    areaSqft: 280,
    description: 'Comfortable Standard Room featuring modern amenities and high-speed Wi-Fi.'
  },
  {
    name: 'Deluxe Room',
    price: 3500,
    bed: 'King Bed',
    maxAdults: 3,
    areaSqft: 350,
    description: 'Spacious Deluxe Room featuring modern amenities and high-speed Wi-Fi.'
  },
  {
    name: 'Executive Room',
    price: 4500,
    bed: 'King Bed',
    maxAdults: 3,
    areaSqft: 420,
    description: 'Executive Room with dedicated workspace, lounge seating, and high-speed Wi-Fi.'
  },
  {
    name: 'Executive Suite',
    price: 5500,
    bed: 'King Bed',
    maxAdults: 4,
    areaSqft: 550,
    description: 'Luxury Executive Suite with separate living area and premium views.'
  }
];

export const ROOM_TYPE_NAMES = ROOM_TYPE_PRESETS.map(p => p.name);

export function normalizeRoomCategoryName(rawName) {
  const cleaned = String(rawName || 'Standard Room').trim();
  if (!cleaned) return 'Standard Room';
  if (/^standard$/i.test(cleaned)) return 'Standard Room';
  if (/^delux(e)?$/i.test(cleaned)) return 'Deluxe Room';
  if (/^executive$/i.test(cleaned)) return 'Executive Room';
  const hasSuffix = /\b(room|rooms|suite|suites|villa|villas|cottage|studio|tent|cabin|penthouse|loft)\b/i.test(cleaned);
  return hasSuffix ? cleaned : `${cleaned} Room`;
}

export function buildNextCategoryRow(existingRows = [], baseFloorOffset = 0, presetNameOverride = null) {
  const usedNames = new Set(existingRows.map(r => String(r.name || '').trim().toLowerCase()));
  const chosenPreset =
    (presetNameOverride && ROOM_TYPE_PRESETS.find(p => p.name === presetNameOverride)) ||
    ROOM_TYPE_PRESETS.find(p => !usedNames.has(p.name.toLowerCase())) ||
    ROOM_TYPE_PRESETS[existingRows.length % ROOM_TYPE_PRESETS.length];

  const floorIdx = baseFloorOffset + existingRows.length + 1;
  return {
    name: presetNameOverride || chosenPreset.name,
    count: 2,
    startRoomNumber: floorIdx * 100 + 1,
    roomNumbers: '',
    price: chosenPreset.price,
    bed: chosenPreset.bed,
    floor: `Floor ${floorIdx}`,
    areaSqft: chosenPreset.areaSqft,
    maxAdults: chosenPreset.maxAdults
  };
}
