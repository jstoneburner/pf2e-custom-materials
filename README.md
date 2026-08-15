# Custom Precious Materials for PF2e

A Foundry VTT module that lets Game Masters define their own homebrew precious materials for the
Pathfinder Second Edition system and apply them to weapons, armor, shields, and equipment.

The Pathfinder Second Edition system does not expose precious materials as a homebrew-extensible
element the way it does traits or languages, so this module builds the feature on top of the parts
of the system that *are* open for extension: item traits, item flags, and rule elements. See
[How it works](#how-it-works) below for the tradeoffs that come with that approach.

## Features

- A "Manage Materials" settings menu (Settings > Custom Precious Materials) where a GM can create,
  edit, and delete materials.
- Each material supports up to three grades (low, standard, high), each with its own level, price,
  and — for shields — hardness and max HP.
- Choose which item types a material applies to: weapons, armor, shields, equipment, or consumables.
- Optionally attach raw PF2e rule elements to a material (for example a flat attack or damage bonus)
  that are added to an item while the material is applied and removed cleanly when it is cleared.
- Materials appear as a labeled section directly on the physical item sheet, with an Apply / Clear
  control.
- Applying a material adds it as a real item trait, so GM-authored resistances/weaknesses that check
  for that trait (or its `item:trait:<slug>` roll option) work the same way they do for any other
  trait-based interaction.

## Installation

1. Copy this folder into your Foundry VTT `Data/modules/` directory, or package it and install it
   via the module manifest.
2. Enable **Custom Precious Materials for PF2e** in your world's Manage Modules screen.
3. As a GM, open **Settings > Custom Precious Materials** to create your first material.

## Usage

1. Open **Settings > Custom Precious Materials** and click **New Material**.
2. Give it a label (the slug is generated automatically, or you can set your own on creation — it
   cannot be changed later without creating a new entry).
3. Choose which item types it applies to.
4. Enable at least one grade and fill in its level, price, and (for shields) hardness/max HP.
5. Optionally add a description and any rule elements you want the material to grant.
6. Save. Open a matching item's sheet and you'll see a **Custom Precious Material** panel where you
   can pick the material and grade and click **Apply**.

Clearing a material from an item restores its previous name, price, traits, hardness/HP (shields),
and removes the rule elements the material added.

## How it works

The PF2e system's own precious-material data (which materials exist, their price/hardness/HP tables,
and the dropdown on item sheets) is closed — it isn't part of the system's Homebrew Elements feature
and isn't exposed for modules to extend. Rather than monkey-patching those internals (which would be
fragile and likely to break on system updates), this module works entirely through supported,
public mechanisms:

- **Item traits** (`system.traits.value`) are an open field — this is exactly how the system's own
  Homebrew Elements custom traits work — so applying a material adds its slug as a real trait.
- **`CONFIG.PF2E` trait records** (`weaponTraits`, `armorTraits`, `shieldTraits`, `equipmentTraits`,
  `consumableTraits`) are plain mutable objects; the module registers a label there so the trait
  displays properly instead of showing a raw slug.
- **Item flags** track which material/grade is applied to an item and the previous state, so it can
  be cleanly reverted.
- **Rule elements** are the system's own supported extension mechanism for granting mechanical
  effects, so any bonuses a material grants are implemented that way rather than through a bespoke
  system.

The tradeoff: price is a simplified approximation (base price plus the grade's flat price, without
the system's bulk-scaling refinement), and applying a material does not change an item's `level`
field or feed into the compendium browser's material filter, since those are driven by the system's
closed internal data. For most homebrew purposes — a reskin of a magic material with its own price,
resistance-bypass behavior, and flavor — this is enough; it just isn't a byte-for-byte reproduction
of how the printed materials work under the hood.

## License

See [LICENSE](LICENSE).
