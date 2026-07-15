import Phaser from 'phaser';
import focusCharmUrl from '../../../../assets/generated/items/frames/item-icons_06.png';
import giantBeltUrl from '../../../../assets/generated/items/frames/item-icons_02.png';
import guardianArmorUrl from '../../../../assets/generated/items/frames/item-icons_05.png';
import ironBladeUrl from '../../../../assets/generated/items/frames/item-icons_01.png';
import manaCrystalUrl from '../../../../assets/generated/items/frames/item-icons_07.png';
import mysticStaffUrl from '../../../../assets/generated/items/frames/item-icons_04.png';
import swiftBowUrl from '../../../../assets/generated/items/frames/item-icons_03.png';
import type { Item } from '../../../types/item';

const itemIconKeys: Record<Item['id'], string> = {
  'iron-blade': 'item-icon-iron-blade',
  'giant-belt': 'item-icon-giant-belt',
  'swift-bow': 'item-icon-swift-bow',
  'mystic-staff': 'item-icon-mystic-staff',
  'guardian-armor': 'item-icon-guardian-armor',
  'focus-charm': 'item-icon-focus-charm',
  'mana-crystal': 'item-icon-mana-crystal',
};

const itemIconUrls: Record<Item['id'], string> = {
  'iron-blade': ironBladeUrl,
  'giant-belt': giantBeltUrl,
  'swift-bow': swiftBowUrl,
  'mystic-staff': mysticStaffUrl,
  'guardian-armor': guardianArmorUrl,
  'focus-charm': focusCharmUrl,
  'mana-crystal': manaCrystalUrl,
};

export function preloadItemIcons(scene: Phaser.Scene) {
  for (const itemId of Object.keys(itemIconKeys)) {
    const typedItemId = itemId as Item['id'];

    scene.load.image(itemIconKeys[typedItemId], itemIconUrls[typedItemId]);
  }
}

export function getItemIconKey(itemId: Item['id']): string {
  return itemIconKeys[itemId];
}
