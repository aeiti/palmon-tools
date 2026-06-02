// "Other Inventory" catalog data. Pure facts about item groups and the
// built-in items players can track — edit this file when the in-game catalog
// changes. State helpers (custom items, normalize, totals) live in
// src/lib/other.js.

export const OTHER_GROUPS = [
  { key: 'ap', label: 'Action Points' },
  { key: 'boss-items', label: 'Boss Items' },
  { key: 'skillfruit', label: 'Skillfruit' },
  { key: 'totem-essence', label: 'Totem Essence' },
  { key: 'camp-movers', label: 'Camp Movers' },
  { key: 'camp-shields', label: 'Camp Shields' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'evolution-items', label: 'Evolution Items' },
  { key: 'mount', label: 'Mount Items' },
  { key: 'premium', label: 'Premium' },
  { key: 'palmon', label: 'Palmon Acquisition' },
  { key: 'utility', label: 'Reset / Utility' },
];

// Built-in items, alphabetized by label within each group. The display
// order follows OTHER_GROUPS above.
//
// Keys are append-only — once a key is in use, renaming it strands user
// data (the load-time normalize filters keys not present in this array
// to zero). Labels and group assignments can change freely.
export const OTHER_ITEMS = [
  // Action Points
  { key: 'ap-10', label: '10 AP', group: 'ap' },
  { key: 'ap-50', label: '50 AP', group: 'ap' },

  // Boss Items
  { key: 'bloomstone', label: 'Bloomstone', group: 'boss-items' },
  { key: 'crispy-biscuit', label: 'Crispy Biscuit', group: 'boss-items' },
  { key: 'drake-crystal', label: 'Drake Crystal', group: 'boss-items' },
  { key: 'golden-leaf', label: 'Golden Leaf', group: 'boss-items' },
  { key: 'mystery-mushroom', label: 'Mystery Mushroom', group: 'boss-items' },
  { key: 'titan-seal', label: 'Titan Seal', group: 'boss-items' },
  { key: 'trench-prawn', label: 'Trench Prawn', group: 'boss-items' },
  { key: 'unstable-battery', label: 'Unstable Battery', group: 'boss-items' },

  // Skillfruit
  { key: 'skillfruit-epic', label: 'Epic Skillfruit', group: 'skillfruit' },
  {
    key: 'skillfruit-epic-refund',
    label: 'Epic Skillfruit (Refund)',
    group: 'skillfruit',
  },
  {
    key: 'skillfruit-legendary',
    label: 'Legendary Skillfruit',
    group: 'skillfruit',
  },
  {
    key: 'skillfruit-legendary-refund',
    label: 'Legendary Skillfruit (Refund)',
    group: 'skillfruit',
  },
  { key: 'skillfruit-rare', label: 'Rare Skillfruit', group: 'skillfruit' },
  {
    key: 'skillfruit-rare-refund',
    label: 'Rare Skillfruit (Refund)',
    group: 'skillfruit',
  },
  { key: 'skillfruit-chest', label: 'Skillfruit Chest', group: 'skillfruit' },

  // Totem Essence
  {
    key: 'totem-essence-earth',
    label: 'Earth Totem Essence',
    group: 'totem-essence',
  },
  {
    key: 'totem-essence-electric',
    label: 'Electric Totem Essence',
    group: 'totem-essence',
  },
  {
    key: 'totem-essence-fire',
    label: 'Fire Totem Essence',
    group: 'totem-essence',
  },
  {
    key: 'totem-essence-water',
    label: 'Water Totem Essence',
    group: 'totem-essence',
  },

  // Camp Movers
  {
    key: 'camp-mover-guild',
    label: 'Camp Mover (Guild)',
    group: 'camp-movers',
  },
  {
    key: 'camp-mover-random',
    label: 'Camp Mover (Random)',
    group: 'camp-movers',
  },
  {
    key: 'camp-mover-targeted',
    label: 'Camp Mover (Targeted)',
    group: 'camp-movers',
  },

  // Camp Shields (alphabetical-by-label puts "12hr" before "24hr" before
  // "8hr" — quirky but consistent with the every-group-is-alphabetical
  // convention. The duration is in the label so the order doesn't bury
  // anything.)
  { key: 'camp-shield-12h', label: '12hr Shield', group: 'camp-shields' },
  { key: 'camp-shield-24h', label: '24hr Shield', group: 'camp-shields' },
  { key: 'camp-shield-8h', label: '8hr Shield', group: 'camp-shields' },

  // Equipment
  { key: 'dreamium-1', label: 'Dreamium I', group: 'equipment' },
  { key: 'dreamium-2', label: 'Dreamium II', group: 'equipment' },
  { key: 'dreamium-3', label: 'Dreamium III', group: 'equipment' },
  { key: 'dreamium-4', label: 'Dreamium IV', group: 'equipment' },
  { key: 'dreamium-5', label: 'Dreamium V', group: 'equipment' },
  { key: 'temperite-large', label: 'Large Temperite', group: 'equipment' },
  { key: 'temperite-medium', label: 'Medium Temperite', group: 'equipment' },
  { key: 'opus-pearl', label: 'Opus Pearl', group: 'equipment' },
  { key: 'temperite-small', label: 'Small Temperite', group: 'equipment' },

  // Evolution Items
  {
    key: 'aurora-essence',
    label: 'Aurora Essence',
    group: 'evolution-items',
  },
  {
    key: 'element-energy-earth',
    label: 'Earth Energy',
    group: 'evolution-items',
  },
  {
    key: 'element-energy-earth-refund',
    label: 'Earth Energy (Refund)',
    group: 'evolution-items',
  },
  {
    key: 'element-energy-electric',
    label: 'Electric Energy',
    group: 'evolution-items',
  },
  {
    key: 'element-energy-electric-refund',
    label: 'Electric Energy (Refund)',
    group: 'evolution-items',
  },
  {
    key: 'evolution-essence',
    label: 'Evolution Essence',
    group: 'evolution-items',
  },
  {
    key: 'evolution-stone',
    label: 'Evolution Stone',
    group: 'evolution-items',
  },
  {
    key: 'element-energy-fire',
    label: 'Fire Energy',
    group: 'evolution-items',
  },
  {
    key: 'element-energy-fire-refund',
    label: 'Fire Energy (Refund)',
    group: 'evolution-items',
  },
  {
    key: 'element-energy-water',
    label: 'Water Energy',
    group: 'evolution-items',
  },
  {
    key: 'element-energy-water-refund',
    label: 'Water Energy (Refund)',
    group: 'evolution-items',
  },

  // Mount Items
  { key: 'mount-feed', label: 'Mount Feed', group: 'mount' },
  { key: 'mount-feed-refund', label: 'Mount Feed (Refund)', group: 'mount' },
  // `mount-shoes` key kept plural for backward-compat; label is singular
  // to match the in-game name.
  { key: 'mount-shoes', label: 'Mount Shoe', group: 'mount' },
  {
    key: 'mount-shoes-refund',
    label: 'Mount Shoe (Refund)',
    group: 'mount',
  },

  // Premium
  {
    key: 'ur-palmon-omni-token',
    label: 'UR Palmon Omni Token',
    group: 'premium',
  },
  { key: 'ur-palmon-token', label: 'UR Palmon Token', group: 'premium' },

  // Palmon Acquisition
  { key: 'palmon-catcher', label: 'Palmon Catcher', group: 'palmon' },
  { key: 'palmon-egg', label: 'Palmon Egg', group: 'palmon' },

  // Reset / Utility
  { key: 'reset-voucher', label: 'Reset Voucher', group: 'utility' },
];
