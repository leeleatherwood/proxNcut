import { MachineRegistry, GameRegistry } from '@/core/registry';
import { StandardDecklist, PaperSize, LayoutResult, MachineId } from '@/core/types';
import { generatePdf } from '@/lib/pdf-utils';

export class MachineService {
  getAvailableMachines() {
    return MachineRegistry.getAll();
  }

  getMachine(id: MachineId) {
    return MachineRegistry.get(id);
  }

  async calculateLayout(
    machineId: MachineId,
    decklist: StandardDecklist,
    paperSize: PaperSize,
    sensorSafe: boolean
  ): Promise<LayoutResult | null> {
    const machine = MachineRegistry.get(machineId);
    const game = GameRegistry.get(decklist.game);
    if (!machine || !game || decklist.cards.length === 0) return null;

    const isSilhouette = machineId.includes('silhouette');
    return machine.calculateLayout(decklist, paperSize, game.defaultCardSize, {
      avoidRegistrationMarks: isSilhouette && sensorSafe
    });
  }

  async generateCutFile(
    machineId: MachineId,
    decklist: StandardDecklist,
    paperSize: PaperSize,
    sensorSafe: boolean
  ): Promise<{ blob: Blob; extension: string } | null> {
    const machine = MachineRegistry.get(machineId);
    if (!machine || decklist.cards.length === 0) return null;

    const layout = await this.calculateLayout(machineId, decklist, paperSize, sensorSafe);
    if (!layout) return null;

    const blob = await machine.generateCutFile(layout);
    const extension = machineId.includes('silhouette') ? 'dxf' : 'txt';

    return { blob, extension };
  }

  async generatePdf(
    machineId: MachineId,
    decklist: StandardDecklist,
    paperSize: PaperSize,
    sensorSafe: boolean
  ): Promise<Blob | null> {
    const machine = MachineRegistry.get(machineId);
    if (!machine || decklist.cards.length === 0) return null;

    const layout = await this.calculateLayout(machineId, decklist, paperSize, sensorSafe);
    if (!layout) return null;

    return generatePdf(layout, decklist, machineId, paperSize);
  }
}

export const machineService = new MachineService();
