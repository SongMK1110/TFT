import ironBladeIcon from '../../assets/generated/items/frames/item-icons_01.png';
import giantBeltIcon from '../../assets/generated/items/frames/item-icons_02.png';
import swiftBowIcon from '../../assets/generated/items/frames/item-icons_03.png';
import mysticStaffIcon from '../../assets/generated/items/frames/item-icons_04.png';
import guardianArmorIcon from '../../assets/generated/items/frames/item-icons_05.png';
import focusCharmIcon from '../../assets/generated/items/frames/item-icons_06.png';
import manaCrystalIcon from '../../assets/generated/items/frames/item-icons_07.png';
import flameRapidbladeIcon from '../../assets/generated/items/completed/flame-rapidblade/frames/flame-rapidblade_01.png';
import runebladeIcon from '../../assets/generated/items/completed/runeblade/frames/runeblade_01.png';
import type { Item } from '../types/item';

export const itemIconUrls: Record<Item['id'], string> = {
  'iron-blade': ironBladeIcon,
  'giant-belt': giantBeltIcon,
  'swift-bow': swiftBowIcon,
  'mystic-staff': mysticStaffIcon,
  'guardian-armor': guardianArmorIcon,
  'focus-charm': focusCharmIcon,
  'mana-crystal': manaCrystalIcon,
  'flame-rapidblade': flameRapidbladeIcon,
  runeblade: runebladeIcon,
  'mana-blade': ironBladeIcon,
  'warmog-heart': giantBeltIcon,
  'giant-plate': guardianArmorIcon,
  'spirit-cape': giantBeltIcon,
  'vitality-crystal': manaCrystalIcon,
  'azure-repeater': swiftBowIcon,
  'ranger-bow': swiftBowIcon,
  'archmage-hat': mysticStaffIcon,
  'blue-essence': mysticStaffIcon,
};
