# TODO

## Locally assignable (non protocol specific) options

These entry-local options from `.nailfec/limine-config-docs.md` are not in the app yet:

- [ ] `comment` — optional comment string shown when an entry is selected
- [ ] `protocol` — boot protocol (`linux`, `limine`, `multiboot` / `multiboot1`, `multiboot2`, `efi`, `efi_boot_entry`, `bios`)
- [ ] `cmdline` — command line passed to the kernel/executable
- [ ] `kernel_cmdline` — alias of `cmdline` (import only; one GUI field)
- [ ] `if_fw_type` — hide entry unless firmware matches (`BIOS` / `UEFI`)
- [ ] `if_arch` — hide entry unless CPU architecture is in the space-separated list

Also map protocol aliases on import: `uefi` / `efi_chainload` → `efi`, `bios_chainload` → `bios`.

Do **not** handle *Locally assignable (protocol specific) options* yet.
