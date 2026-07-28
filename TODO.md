# TODO

## Locally assignable (non protocol specific) options

These entry-local options from `.nailfec/limine-config-docs.md` are now in the System page:

- [x] `comment` — optional comment string shown when an entry is selected
- [x] `protocol` — boot protocol (`linux`, `limine`, `multiboot` / `multiboot1`, `multiboot2`, `efi`, `efi_boot_entry`, `bios`)
- [x] `cmdline` — command line passed to the kernel/executable
- [x] `kernel_cmdline` — alias of `cmdline` (import only; one GUI field)
- [x] `if_fw_type` — hide entry unless firmware matches (`BIOS` / `UEFI`)
- [x] `if_arch` — hide entry unless CPU architecture is in the space-separated list

Also map protocol aliases on import: `uefi` / `efi_chainload` → `efi`, `bios_chainload` → `bios`.

Do **not** handle *Locally assignable (protocol specific) options* yet.

## GUI preview fidelity (vs Limine `menu.c` / `gterm.c`)

Closer, but still approximate. Remaining gaps:

- [x] **Bitmap font** — Limine uses 8×16 (optionally scaled) glyphs; preview loads CP437 TTFs generated from `user/fonts/*.bin` (VGA collection / Limine built-in)
- [ ] **Margin gradient corners** — Limine uses circular distance-field blending at corners; preview uses four linear edge fades
- [ ] **Dynamic tree window** — Limine sizes the visible entry window from terminal `rows` / branding / secondary help; preview uses a fixed `TREE_WINDOW = 12`
- [ ] **Wallpaper load → chrome defaults** — Limine applies wallpaper margin/bg defaults only after the image actually opens; preview keys off path presence (`hasWallpaper`)
- [ ] **Empty `INTERFACE_BRANDING`** — Limine hides branding when the key is present but empty; preview still synthesizes a default title
- [ ] **UEFI Shell help (`U`)** — Limine shows `U UEFI Shell` when a shell binary is found; preview only shows `S Firmware Setup` (+ `B` when editor enabled)
- [ ] **Name truncation** — Limine truncates long entry/branding/comment lines with `...` to terminal width; preview ellipsizes via CSS only
- [ ] **QEMU side-by-side check** — optional visual QA against `.nailfec/qemu-preview` for pixel-ish comparison
