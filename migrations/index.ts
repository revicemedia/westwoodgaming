import * as migration_20261009_133126_initial from './20261009_133126_initial';
import * as migration_20261009_133138_seed_events from './20261009_133138_seed_events';
import * as migration_20261009_133620_rename_gta_v_to_gta_vi from './20261009_133620_rename_gta_v_to_gta_vi';
import * as migration_20261013_224242_news from './20261013_224242_news';
import * as migration_20261014_204712_media_storage_fields from './20261014_204712_media_storage_fields';
import * as migration_20261018_151039_lineups from './20261018_151039_lineups';
import * as migration_20261020_132019_signups_and_players from './20261020_132019_signups_and_players';

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
    name: '20261009_133620_rename_gta_v_to_gta_vi',
  },
  {
    up: migration_20261013_224242_news.up,
    down: migration_20261013_224242_news.down,
    name: '20261013_224242_news',
  },
  {
    up: migration_20261014_204712_media_storage_fields.up,
    down: migration_20261014_204712_media_storage_fields.down,
    name: '20261014_204712_media_storage_fields',
  },
  {
    up: migration_20261018_151039_lineups.up,
    down: migration_20261018_151039_lineups.down,
    name: '20261018_151039_lineups',
  },
  {
    up: migration_20261020_132019_signups_and_players.up,
    down: migration_20261020_132019_signups_and_players.down,
    name: '20261020_132019_signups_and_players'
  },
];
