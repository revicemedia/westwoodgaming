import * as migration_20261009_133126_initial from './20261009_133126_initial';
import * as migration_20261009_133138_seed_events from './20261009_133138_seed_events';
import * as migration_20261009_133620_rename_gta_v_to_gta_vi from './20261009_133620_rename_gta_v_to_gta_vi';

export const migrations = [
  {
    up: migration_20261009_133126_initial.up,
    down: migration_20261009_133126_initial.down,
    name: '20261009_133126_initial',
  },
  {
    up: migration_20261009_133138_seed_events.up,
    down: migration_20261009_133138_seed_events.down,
    name: '20261009_133138_seed_events',
  },
  {
    up: migration_20261009_133620_rename_gta_v_to_gta_vi.up,
    down: migration_20261009_133620_rename_gta_v_to_gta_vi.down,
    name: '20261009_133620_rename_gta_v_to_gta_vi'
  },
];
