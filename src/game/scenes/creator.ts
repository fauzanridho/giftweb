import type { KAPLAYCtx } from "kaplay";
import { CharacterAppearance, generateCharacterSpritesheet } from "../assets/characters";
import { getSupabase } from "@/lib/supabaseClient";
import { playClick, playSuccess } from "../audio/sfx";

export function creatorScene(k: KAPLAYCtx) {
  k.scene("creator", async () => {
    // Background Lembut
    k.add([
      k.rect(320, 240),
      k.pos(0, 0),
      k.color(252, 228, 214),
    ]);

    k.add([
      k.text("BUAT KARAKTER AY 💕", { size: 10 }),
      k.pos(160, 16),
      k.anchor("center"),
      k.color(196, 122, 106),
    ]);

    // Data Penampilan Awal
    const currentApp: CharacterAppearance = {
      skin: "fair",
      hairStyle: "long",
      hairColor: "brown",
      outfit: "pink",
      accessory: "flower",
    };

    const hairStyles: CharacterAppearance["hairStyle"][] = ["short", "messy", "bob", "long", "ponytail", "hijab"];
    const hairColors: CharacterAppearance["hairColor"][] = ["black", "brown", "blonde", "pink", "blue"];
    const outfits: CharacterAppearance["outfit"][] = ["blue", "pink", "sage", "cream"];
    const accessories: NonNullable<CharacterAppearance["accessory"]>[] = ["none", "glasses", "ribbon", "flower"];

    let hairStyleIdx = hairStyles.indexOf(currentApp.hairStyle);
    let hairColorIdx = hairColors.indexOf(currentApp.hairColor);
    let outfitIdx = outfits.indexOf(currentApp.outfit);
    let accessoryIdx = accessories.indexOf(currentApp.accessory || "none");

    // Preview Karakter (Kotak Tengah)
    k.add([
      k.rect(60, 60, { radius: 8 }),
      k.pos(160, 68),
      k.anchor("center"),
      k.color(255, 255, 255),
      k.outline(2, k.Color.fromHex("#c47a6a")),
    ]);

    // Karakter Sprite Preview (Skala 2x agar jelas)
    let previewObj = k.add([
      k.sprite("char_ay"),
      k.pos(160, 68),
      k.anchor("center"),
      k.scale(1.8),
    ]);
    previewObj.play("walk-down");

    function refreshPreview() {
      const sheet = generateCharacterSpritesheet(currentApp);
      const tempKey = `char_preview_${Date.now()}`;
      k.loadSprite(tempKey, sheet.dataURL, {
        sliceX: 12,
        sliceY: 1,
        anims: sheet.anims,
      });

      previewObj.destroy();
      previewObj = k.add([
        k.sprite(tempKey),
        k.pos(160, 68),
        k.anchor("center"),
        k.scale(1.8),
      ]);
      previewObj.play("walk-down");
    }

    // Helper Pembuat Tombol Pilihan
    const createSelector = (label: string, yPos: number, onPrev: () => void, onNext: () => void, getVal: () => string) => {
      k.add([
        k.text(label, { size: 6 }),
        k.pos(50, yPos),
        k.anchor("left"),
        k.color(100, 80, 80),
      ]);

      // Nilai Teks
      const valLabel = k.add([
        k.text(getVal(), { size: 6 }),
        k.pos(210, yPos),
        k.anchor("center"),
        k.color(196, 122, 106),
      ]);

      // Tombol <
      const prevBtn = k.add([
        k.rect(14, 14, { radius: 3 }),
        k.pos(155, yPos),
        k.anchor("center"),
        k.color(244, 166, 142),
        k.area(),
      ]);
      k.add([k.text("<", { size: 7 }), k.pos(155, yPos), k.anchor("center"), k.color(255, 255, 255)]);

      prevBtn.onClick(() => {
        playClick();
        onPrev();
        valLabel.text = getVal();
        refreshPreview();
      });

      // Tombol >
      const nextBtn = k.add([
        k.rect(14, 14, { radius: 3 }),
        k.pos(265, yPos),
        k.anchor("center"),
        k.color(244, 166, 142),
        k.area(),
      ]);
      k.add([k.text(">", { size: 7 }), k.pos(265, yPos), k.anchor("center"), k.color(255, 255, 255)]);

      nextBtn.onClick(() => {
        playClick();
        onNext();
        valLabel.text = getVal();
        refreshPreview();
      });
    };

    // Kontrol Baris 1: Gaya Rambut
    createSelector(
      "Gaya Rambut:",
      115,
      () => {
        hairStyleIdx = (hairStyleIdx - 1 + hairStyles.length) % hairStyles.length;
        currentApp.hairStyle = hairStyles[hairStyleIdx];
      },
      () => {
        hairStyleIdx = (hairStyleIdx + 1) % hairStyles.length;
        currentApp.hairStyle = hairStyles[hairStyleIdx];
      },
      () => currentApp.hairStyle.toUpperCase()
    );

    // Kontrol Baris 2: Warna Rambut
    createSelector(
      "Warna Rambut:",
      135,
      () => {
        hairColorIdx = (hairColorIdx - 1 + hairColors.length) % hairColors.length;
        currentApp.hairColor = hairColors[hairColorIdx];
      },
      () => {
        hairColorIdx = (hairColorIdx + 1) % hairColors.length;
        currentApp.hairColor = hairColors[hairColorIdx];
      },
      () => currentApp.hairColor.toUpperCase()
    );

    // Kontrol Baris 3: Baju
    createSelector(
      "Warna Baju:",
      155,
      () => {
        outfitIdx = (outfitIdx - 1 + outfits.length) % outfits.length;
        currentApp.outfit = outfits[outfitIdx];
      },
      () => {
        outfitIdx = (outfitIdx + 1) % outfits.length;
        currentApp.outfit = outfits[outfitIdx];
      },
      () => currentApp.outfit.toUpperCase()
    );

    // Kontrol Baris 4: Aksesori
    createSelector(
      "Aksesori:",
      175,
      () => {
        accessoryIdx = (accessoryIdx - 1 + accessories.length) % accessories.length;
        currentApp.accessory = accessories[accessoryIdx];
      },
      () => {
        accessoryIdx = (accessoryIdx + 1) % accessories.length;
        currentApp.accessory = accessories[accessoryIdx];
      },
      () => (currentApp.accessory || "none").toUpperCase()
    );

    // Tombol Simpan & Masuk Pulau
    const confirmBtn = k.add([
      k.rect(130, 22, { radius: 6 }),
      k.pos(160, 210),
      k.anchor("center"),
      k.color(155, 184, 133),
      k.outline(1, k.Color.fromHex("#496833")),
      k.area(),
    ]);

    k.add([
      k.text("Selesai & Masuk Pulau! ✨", { size: 7 }),
      k.pos(160, 210),
      k.anchor("center"),
      k.color(255, 255, 255),
    ]);

    confirmBtn.onClick(async () => {
      playSuccess();

      // Perbarui sprite char_ay di asset manager dengan hasil kustomisasi
      const finalSheet = generateCharacterSpritesheet(currentApp);
      k.loadSprite("char_ay", finalSheet.dataURL, {
        sliceX: 12,
        sliceY: 1,
        anims: finalSheet.anims,
      });

      // Simpan ke Supabase jika login
      try {
        const sb = getSupabase();
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          await sb
            .from("island_members")
            .update({ appearance: currentApp })
            .eq("user_id", user.id);
        }
      } catch (err) {
        console.warn("Simpan karakter lokal:", err);
      }

      k.go("hub");
    });
  });
}

