import type { DesignConfig } from "./types";

export type FieldType =
	| "yesno"
	| "text"
	| "number"
	| "resolution"
	| "color"
	| "color_alpha"
	| "enum"
	| "path_list"
	| "palette";

export type DesignGroupId =
	| "wallpaper"
	| "interface"
	| "terminal_colors"
	| "terminal_font"
	| "behavior"
	| "editor";

export type DesignField = {
	key: keyof DesignConfig;
	label: string;
	type: FieldType;
	group: DesignGroupId;
	description?: string;
	options?: { value: string; label: string }[];
	placeholder?: string;
	enabledWhen?: (config: DesignConfig) => boolean;
};

export type DesignGroup = {
	id: DesignGroupId;
	label: string;
	collapsedByDefault?: boolean;
};

export const DESIGN_GROUPS: DesignGroup[] = [
	{ id: "wallpaper", label: "Wallpaper" },
	{ id: "interface", label: "Interface" },
	{ id: "terminal_colors", label: "Terminal colors" },
	{ id: "terminal_font", label: "Terminal font / margins" },
	{ id: "behavior", label: "Behavior", collapsedByDefault: true },
	{ id: "editor", label: "Editor", collapsedByDefault: true },
];

const graphicsOn = (c: DesignConfig) => c.graphics === "yes";
const serialOn = (c: DesignConfig) => c.serial === "yes";
const editorOn = (c: DesignConfig) => c.editor_enabled === "yes";

export const DESIGN_FIELDS: DesignField[] = [
	{
		key: "graphics",
		label: "Graphics",
		type: "yesno",
		group: "wallpaper",
		description:
			"If set to `no`, force text mode for the boot menu, else use a video mode.",
	},
	{
		key: "wallpaper",
		label: "Wallpaper",
		type: "path_list",
		group: "wallpaper",
		description:
			"Path to a file to use as a wallpaper. BMP, PNG, JPEG, and QOI formats are supported. There can be multiple of this option, in which case the wallpaper will be randomly selected from the provided options.",
		placeholder: "boot():/boot/wallpaper.png",
		enabledWhen: graphicsOn,
	},
	{
		key: "wallpaper_style",
		label: "Wallpaper style",
		type: "enum",
		group: "wallpaper",
		description:
			"The style which will be used to display the wallpaper image: `tiled`, `centered`, or `stretched`. Default is `stretched`.",
		options: [
			{ value: "stretched", label: "Stretched" },
			{ value: "centered", label: "Centered" },
			{ value: "tiled", label: "Tiled" },
		],
		enabledWhen: graphicsOn,
	},
	{
		key: "backdrop",
		label: "Backdrop",
		type: "color",
		group: "wallpaper",
		description:
			"When the background style is `centered`, this specifies the colour of the backdrop for parts of the screen not covered by the background image, in RRGGBB format.",
		enabledWhen: (c) => graphicsOn(c) && c.wallpaper_style === "centered",
	},
	{
		key: "interface_resolution",
		label: "Resolution",
		type: "resolution",
		group: "interface",
		description:
			"Specify screen resolution to be used by the Limine interface (menu, editor, console...) in the form `<width>x<height>`. This will *only* affect the Limine interface, not any booted OS. If not specified, Limine will pick a resolution automatically. If the resolution is not available, Limine will pick another one automatically. Ignored if using text mode.",
		placeholder: "1920x1080",
		enabledWhen: graphicsOn,
	},
	{
		key: "interface_rotation",
		label: "Rotation",
		type: "enum",
		group: "interface",
		description:
			"Specifies the rotation of the Limine interface. It can be any of the following values: `0`, `90`, `180`, `270`. Default is `0`.",
		options: [
			{ value: "0", label: "0°" },
			{ value: "90", label: "90°" },
			{ value: "180", label: "180°" },
			{ value: "270", label: "270°" },
		],
	},
	{
		key: "interface_branding",
		label: "Branding",
		type: "text",
		group: "interface",
		description: "A string that will be displayed on top of the Limine interface.",
		placeholder: "liminal",
	},
	{
		key: "interface_branding_colour",
		label: "Branding colour",
		type: "color",
		group: "interface",
		description:
			"An `RRGGBB` hexadecimal value specifying the colour of the branding string. Default is `00aaaa`.",
	},
	{
		key: "interface_help_hidden",
		label: "Hide help",
		type: "yesno",
		group: "interface",
		description:
			"Hides the help text located at the top of the screen showing the key bindings.",
	},
	{
		key: "interface_help_colour",
		label: "Help colour",
		type: "color",
		group: "interface",
		description:
			"An `RRGGBB` hexadecimal value specifying the colour of the help strings. Default is `00aa00`.",
	},
	{
		key: "interface_help_colour_bright",
		label: "Help colour bright",
		type: "color",
		group: "interface",
		description:
			"An `RRGGBB` hexadecimal value specifying the brighter accent colour used for the auto-boot countdown digit. If unspecified, it is derived from `interface_help_colour` by adding `0x55` to each channel (saturating at `0xff`).",
	},
	{
		key: "term_background",
		label: "Background",
		type: "color_alpha",
		group: "terminal_colors",
		description:
			"Terminal text background colour (TTRRGGBB). TT stands for transparency.",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_foreground",
		label: "Foreground",
		type: "color",
		group: "terminal_colors",
		description: "Terminal text foreground colour (RRGGBB).",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_background_bright",
		label: "Background bright",
		type: "color",
		group: "terminal_colors",
		description: "Terminal text background bright colour (RRGGBB).",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_foreground_bright",
		label: "Foreground bright",
		type: "color",
		group: "terminal_colors",
		description: "Terminal text foreground bright colour (RRGGBB).",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_palette",
		label: "Palette",
		type: "palette",
		group: "terminal_colors",
		description:
			"Specifies the colour palette used by the terminal (RRGGBB). It is a `;` separated array of 8 colours: black, red, green, brown, blue, magenta, cyan, and gray. Ignored if not using a graphical terminal.",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_palette_bright",
		label: "Palette bright",
		type: "palette",
		group: "terminal_colors",
		description:
			"Specifies the bright colour palette used by the terminal (RRGGBB). It is a `;` separated array of 8 bright colours: dark gray, bright red, bright green, yellow, bright blue, bright magenta, bright cyan, and white. Ignored if not using a graphical terminal.",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_font",
		label: "Font path",
		type: "text",
		group: "terminal_font",
		description:
			"Path to a font file to be used instead of the default one for the menu and terminal. The font file must be a code page 437 character set comprised of 256 consecutive glyph bitmaps. Each glyph's bitmap must be expressed left to right (1 byte per row), and top to bottom (16 bytes per whole glyph by default; see `term_font_size`). See e.g. the [VGA text mode font](https://github.com/viler-int10h/vga-text-mode-fonts) collection for fonts.",
		placeholder: "boot():/boot/font.bin",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_font_size",
		label: "Font size",
		type: "text",
		group: "terminal_font",
		description:
			"The size of each glyph of the font in dots, which must correspond to the font file, or display will be garbled or loading issues will occur. Since it is assumed that all fonts are of width 8, the first value of the pair (AKA the `8` in `8x16`) is effectively ignored. To set horizontal spacing between glyphs on screen, see `term_font_spacing`. Defaults to `8x16`. Ignored if `term_font` not set or if the font fails to load.",
		placeholder: "8x16",
		enabledWhen: (c) => graphicsOn(c) && c.term_font.trim() !== "",
	},
	{
		key: "term_font_scale",
		label: "Font scale",
		type: "text",
		group: "terminal_font",
		description:
			"Scaling for the font in the x and y directions. `2x2` would display the font in double size, which is useful on high-DPI displays at native resolution. `2x1` only makes the font twice as wide, similar to the VGA 40 column mode. `4x2` might be good for a narrow font on a high resolution display. Values over 8 are disallowed. Default is no scaling, i.e. `1x1`.",
		placeholder: "1x1",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_font_spacing",
		label: "Font spacing",
		type: "number",
		group: "terminal_font",
		description:
			"Horizontal spacing, in pixels, between glyphs on screen. Also applies to the built-in Limine font. Defaults to 1. 0 is allowed.",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_margin",
		label: "Margin",
		type: "number",
		group: "terminal_font",
		description: "Set the amount of margin around the terminal.",
		enabledWhen: graphicsOn,
	},
	{
		key: "term_margin_gradient",
		label: "Margin gradient",
		type: "number",
		group: "terminal_font",
		description: "Set the thickness in pixel for the gradient around the terminal.",
		enabledWhen: graphicsOn,
	},
	{
		key: "timeout",
		label: "Timeout",
		type: "text",
		group: "behavior",
		description:
			"Specifies the timeout in seconds before the first *entry* is automatically booted. Decimal values such as `0.25` are accepted. If set to `no`, disable automatic boot. If set to `0`, boots default entry instantly (see `default_entry` option).",
		placeholder: "5",
	},
	{
		key: "quiet",
		label: "Quiet",
		type: "yesno",
		group: "behavior",
		description:
			"If set to `yes`, enable quiet mode, where all screen output except panics and important warnings is suppressed. If `timeout` is not 0, the `timeout` still occurs, and pressing any key during the timeout will reveal the menu and disable quiet mode.",
	},
	{
		key: "verbose",
		label: "Verbose",
		type: "yesno",
		group: "behavior",
		description:
			"If set to `yes`, print additional information during boot. Defaults to not verbose.",
	},
	{
		key: "serial",
		label: "Serial",
		type: "yesno",
		group: "behavior",
		description: "If set to `yes`, enable serial I/O for the bootloader.",
	},
	{
		key: "serial_baudrate",
		label: "Serial baudrate",
		type: "number",
		group: "behavior",
		description:
			"If `serial` is set to `yes`, this specifies the baudrate to use for serial I/O. Defaults to `115200`. BIOS only, ignored with Limine UEFI.",
		enabledWhen: serialOn,
	},
	{
		key: "default_entry",
		label: "Default entry",
		type: "text",
		group: "behavior",
		description:
			"Entry which will be automatically selected at startup. Can be a 1-based entry index (e.g. `1`), or an entry path (e.g. `OSes/Arch Linux`). Entry paths use `/` as a directory separator; literal `/`, `\\`, and `#` characters in entry names must be escaped as `\\/`, `\\\\`, and `\\#` respectively. If multiple sibling entries share the same name, append `#N` to select the Nth duplicate (e.g. `Arch Linux#1` for the second entry named `Arch Linux`). If unspecified, it is `1`.",
		placeholder: "1",
	},
	{
		key: "remember_last_entry",
		label: "Remember last entry",
		type: "yesno",
		group: "behavior",
		description: "If set to `yes`, remember last booted entry. (UEFI only).",
	},
	{
		key: "randomise_memory",
		label: "Randomise memory",
		type: "yesno",
		group: "behavior",
		description:
			"If set to `yes`, randomise the contents of RAM at bootup in order to find bugs related to non zeroed memory or for security reasons. This option will slow down boot time significantly. For the BIOS port of Limine, this will only randomise memory below 4GiB.",
	},
	{
		key: "hash_mismatch_panic",
		label: "Hash mismatch panic",
		type: "yesno",
		group: "behavior",
		description:
			"If set to `no`, do not panic if there is a hash mismatch for a file, but print a warning instead. Forced to `yes` when Secure Boot is active.",
	},
	{
		key: "measured_boot",
		label: "Measured boot",
		type: "yesno",
		group: "behavior",
		description:
			"If set to `yes`, opt in to measured boot. Forced to `yes` when Secure Boot is active, and forced back to `no` if the firmware does not expose a TPM 2.0/CC measurement interface. See [USAGE.md](USAGE.md#measured-boot).",
	},
	{
		key: "firmware_logo",
		label: "Firmware logo",
		type: "yesno",
		group: "behavior",
		description:
			'If set to `yes`, restore the OEM firmware boot logo upon handoff to the OS, instead of leaving a blank screen, by clearing the "displayed" status bit in the ACPI BGRT table so the OS redraws the logo itself. The image is re-centred for the active resolution. UEFI only; defaults to `no`.',
	},
	{
		key: "keyboard_layout",
		label: "Keyboard layout",
		type: "text",
		group: "behavior",
		description:
			"Specifies a keyboard layout to remap printable keystrokes to before they reach the menu and editor. Currently only `dvorak` and `azerty` are supported. If unset, no remapping is applied and keystrokes are used as-is. This assumes the underlying firmware resolves keystrokes as US-QWERTY; on firmware/keyboard combinations that already resolve a different layout natively, this option may produce incorrect output.",
		placeholder: "dvorak",
	},
	{
		key: "mouse",
		label: "Mouse",
		type: "yesno",
		group: "behavior",
		description:
			"If set to `no`, disable mouse support in the boot menu. Defaults to `yes`, in which case, if a mouse is present, the menu selection follows the pointer, left clicking an entry boots it (or expands a directory), and the scroll wheel moves the selection. On BIOS this uses the PS/2 (or emulated PS/2) mouse; on UEFI any pointer device the firmware exposes.",
	},
	{
		key: "global_dtb",
		label: "Global DTB",
		type: "text",
		group: "behavior",
		description:
			"If set, use this DTB instead of the firmware-provided DTB for Limine itself, as well as for any booted entry whose protocol supports DTBs and the DTB is not locally overridden with `dtb_path`.",
		placeholder: "boot():/boot/device.dtb",
	},
	{
		key: "editor_enabled",
		label: "Editor enabled",
		type: "yesno",
		group: "editor",
		description:
			"If set to `no`, the editor will not be accessible. Defaults to `yes` unless a config hash is enrolled. Unconditionally disabled when Secure Boot is active.",
	},
	{
		key: "editor_highlighting",
		label: "Syntax highlighting",
		type: "yesno",
		group: "editor",
		description:
			"If set to `no`, syntax highlighting in the editor will be disabled. Defaults to `yes`.",
		enabledWhen: editorOn,
	},
	{
		key: "editor_validation",
		label: "Validation",
		type: "yesno",
		group: "editor",
		description:
			"If set to `no`, the editor will not alert you about invalid options or syntax errors. Defaults to `yes`.",
		enabledWhen: editorOn,
	},
];

export function fieldsForGroup(groupId: DesignGroupId): DesignField[] {
	return DESIGN_FIELDS.filter((field) => field.group === groupId);
}
