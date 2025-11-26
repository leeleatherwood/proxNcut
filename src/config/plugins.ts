import { ProviderRegistry, ParserRegistry, MachineRegistry, GameRegistry } from '@/core/registry';
import { ApiCardProvider } from '@/modules/providers/api-provider';
import { MtgStandardParser, MtgPlaintextParser } from '@/modules/parsers/mtg-parser';
import { ArchidektParser } from '@/modules/parsers/archidekt-parser';
import { MoxfieldParser } from '@/modules/parsers/moxfield-parser';
import { TopdeckParser } from '@/modules/parsers/topdeck-parser';
import { SilhouetteMachine } from '@/modules/machines/silhouette';
import { HandCutMachine } from '@/modules/machines/hand-cut';
import { MtgGame } from '@/modules/games/mtg-game';
import { logger } from '@/lib/logger';

export interface PluginConfig {
  // Future config options
}

export function initializePlugins(config?: PluginConfig) {
  // Games
  GameRegistry.register(MtgGame.id, MtgGame);

  // Providers
  // Use the API Provider which talks to our Server DB
  ProviderRegistry.register(MtgGame.id, new ApiCardProvider(MtgGame.id));

  // Parsers
  // Order matters for auto-detection! More specific formats first.
  const archidekt = new ArchidektParser();
  ParserRegistry.register(archidekt.id, archidekt);

  const moxfield = new MoxfieldParser();
  ParserRegistry.register(moxfield.id, moxfield);

  const topdeck = new TopdeckParser();
  ParserRegistry.register(topdeck.id, topdeck);

  const mtgStandard = new MtgStandardParser();
  ParserRegistry.register(mtgStandard.id, mtgStandard);

  const mtgPlaintext = new MtgPlaintextParser();
  ParserRegistry.register(mtgPlaintext.id, mtgPlaintext);

  // Machines
  MachineRegistry.register('silhouette', new SilhouetteMachine());
  MachineRegistry.register('hand', new HandCutMachine());
  
  logger.info('Plugins initialized');
}
