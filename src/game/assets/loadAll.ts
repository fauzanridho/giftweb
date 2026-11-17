import type { KAPLAYCtx } from "kaplay";
import { generateTileAssets } from "./tiles";
import { generatePropAssets } from "./props";
import { generateCharacterSpritesheet, CharacterAppearance } from "./characters";

export function loadAllGameAssets(k: KAPLAYCtx) {
  // 1. Muat Tiles
  const tiles = generateTileAssets();
  k.loadSprite("tile_grass", tiles.grass);
  k.loadSprite("tile_grass_flower", tiles.grassFlower);
  k.loadSprite("tile_sand", tiles.sand);
  k.loadSprite("tile_wood", tiles.woodFloor);
  k.loadSprite("tile_soil", tiles.soil);

  // Animasi Air (3 frames)
  k.loadSprite("tile_water", tiles.water.dataURL, {
    sliceX: 3,
    sliceY: 1,
    anims: {
      wave: { from: 0, to: 2, loop: true, speed: 2 },
    },
  });

  // 2. Muat Props
  const props = generatePropAssets();
  k.loadSprite("prop_tree", props.tree);
  k.loadSprite("prop_bakso_cart", props.baksoCart);
  k.loadSprite("prop_boat", props.boat);
  k.loadSprite("prop_bowl", props.bowl);
  k.loadSprite("prop_lantern", props.lantern);
  k.loadSprite("prop_flower_bush", props.flowerBush);
  k.loadSprite("prop_helper_stone", props.helperStone);

  // 3. Muat Karakter Default (Fauzan & Ay)
  const fauzanApp: CharacterAppearance = {
    skin: "fair",
    hairStyle: "short",
    hairColor: "black",
    outfit: "blue",
    accessory: "none",
  };
  const fauzanSheet = generateCharacterSpritesheet(fauzanApp);
  k.loadSprite("char_fauzan", fauzanSheet.dataURL, {
    sliceX: 12,
    sliceY: 1,
    anims: fauzanSheet.anims,
  });

  const ayApp: CharacterAppearance = {
    skin: "fair",
    hairStyle: "long",
    hairColor: "brown",
    outfit: "pink",
    accessory: "flower",
  };
  const aySheet = generateCharacterSpritesheet(ayApp);
  k.loadSprite("char_ay", aySheet.dataURL, {
    sliceX: 12,
    sliceY: 1,
    anims: aySheet.anims,
  });
}

