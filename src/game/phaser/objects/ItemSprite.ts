import Phaser from 'phaser';
import { itemIconUrls } from '../../../assets/itemIcons';
import type { Item } from '../../../types/item';

const itemIconKeys = Object.fromEntries(
  Object.keys(itemIconUrls).map((itemId) => [itemId, `item-icon-${itemId}`]),
) as Record<Item['id'], string>;

export function preloadItemIcons(scene: Phaser.Scene) {
  for (const [itemId, iconUrl] of Object.entries(itemIconUrls)) {
    scene.load.image(itemIconKeys[itemId], iconUrl);
  }
}

export function getItemIconKey(itemId: Item['id']): string {
  return itemIconKeys[itemId] ?? itemIconKeys['mana-crystal'];
}
