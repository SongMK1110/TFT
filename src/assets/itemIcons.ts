import ironBladeIcon from '../../assets/generated/items/frames/item-icons_01.png';
import giantBeltIcon from '../../assets/generated/items/frames/item-icons_02.png';
import swiftBowIcon from '../../assets/generated/items/frames/item-icons_03.png';
import mysticStaffIcon from '../../assets/generated/items/frames/item-icons_04.png';
import guardianArmorIcon from '../../assets/generated/items/frames/item-icons_05.png';
import focusCharmIcon from '../../assets/generated/items/frames/item-icons_06.png';
import manaCrystalIcon from '../../assets/generated/items/frames/item-icons_07.png';
import type { Item } from '../types/item';

export const itemIconUrls: Record<Item['id'], string> = {
  'iron-blade': ironBladeIcon,
  'giant-belt': giantBeltIcon,
  'swift-bow': swiftBowIcon,
  'mystic-staff': mysticStaffIcon,
  'guardian-armor': guardianArmorIcon,
  'focus-charm': focusCharmIcon,
  'mana-crystal': manaCrystalIcon,
};
