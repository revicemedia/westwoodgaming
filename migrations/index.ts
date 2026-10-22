import * as migration_20261009_133126_initial from './20261009_133126_initial';
import * as migration_20261009_133138_seed_events from './20261009_133138_seed_events';
import * as migration_20261009_133620_rename_gta_v_to_gta_vi from './20261009_133620_rename_gta_v_to_gta_vi';
import * as migration_20261013_224242_news from './20261013_224242_news';
import * as migration_20261014_204712_media_storage_fields from './20261014_204712_media_storage_fields';
import * as migration_20261018_151039_lineups from './20261018_151039_lineups';
import * as migration_20261021_084141_waitlist_and_blocked_positions from './20261021_084141_waitlist_and_blocked_positions';
import * as migration_20261022_222101_signup_mode from './20261022_222101_signup_mode';
import * as migration_20261022_223701_signup_capacity_and_reservations from './20261022_223701_signup_capacity_and_reservations';
import * as migration_20261022_224131_custom_teams from './20261022_224131_custom_teams';

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
    up: migration_20261021_084141_waitlist_and_blocked_positions.up,
    down: migration_20261021_084141_waitlist_and_blocked_positions.down,
    name: '20261021_084141_waitlist_and_blocked_positions',
  },
  {
    up: migration_20261022_222101_signup_mode.up,
    down: migration_20261022_222101_signup_mode.down,
    name: '20261022_222101_signup_mode',
  },
  {
    up: migration_20261022_223701_signup_capacity_and_reservations.up,
    down: migration_20261022_223701_signup_capacity_and_reservations.down,
    name: '20261022_223701_signup_capacity_and_reservations',
  },
  {
    up: migration_20261022_224131_custom_teams.up,
    down: migration_20261022_224131_custom_teams.down,
    name: '20261022_224131_custom_teams'
  },
];
