export type YesNo = "yes" | "no";
export type WallpaperStyle = "tiled" | "centered" | "stretched";
export type InterfaceRotation = "0" | "90" | "180" | "270";

/** Design-relevant Limine global options (canonical British spellings). */
export type DesignConfig = {
	timeout: string;
	quiet: YesNo;
	serial: YesNo;
	serial_baudrate: string;
	global_dtb: string;
	default_entry: string;
	remember_last_entry: YesNo;
	graphics: YesNo;
	wallpaper: string[];
	wallpaper_style: WallpaperStyle;
	backdrop: string;
	verbose: YesNo;
	randomise_memory: YesNo;
	hash_mismatch_panic: YesNo;
	measured_boot: YesNo;
	firmware_logo: YesNo;
	keyboard_layout: string;
	mouse: YesNo;
	interface_resolution: string;
	interface_rotation: InterfaceRotation;
	interface_branding: string;
	interface_branding_colour: string;
	interface_help_hidden: YesNo;
	interface_help_colour: string;
	interface_help_colour_bright: string;
	term_font: string;
	term_font_size: string;
	term_font_scale: string;
	term_font_spacing: string;
	term_palette: string;
	term_palette_bright: string;
	term_background: string;
	term_foreground: string;
	term_background_bright: string;
	term_foreground_bright: string;
	term_margin: string;
	term_margin_gradient: string;
	editor_enabled: YesNo;
	editor_highlighting: YesNo;
	editor_validation: YesNo;
};

export const DEFAULT_DESIGN_CONFIG: DesignConfig = {
	timeout: "5",
	quiet: "no",
	serial: "no",
	serial_baudrate: "115200",
	global_dtb: "",
	default_entry: "1",
	remember_last_entry: "no",
	graphics: "yes",
	wallpaper: [],
	wallpaper_style: "stretched",
	backdrop: "000000",
	verbose: "no",
	randomise_memory: "no",
	hash_mismatch_panic: "yes",
	measured_boot: "no",
	firmware_logo: "no",
	keyboard_layout: "",
	mouse: "yes",
	interface_resolution: "",
	interface_rotation: "0",
	interface_branding: "",
	interface_branding_colour: "00aaaa",
	interface_help_hidden: "no",
	interface_help_colour: "00aa00",
	interface_help_colour_bright: "",
	term_font: "",
	term_font_size: "8x16",
	term_font_scale: "1x1",
	term_font_spacing: "1",
	term_palette: "000000;aa0000;00aa00;aa5500;0000aa;aa00aa;00aaaa;aaaaaa",
	term_palette_bright: "555555;ff5555;55ff55;ffff55;5555ff;ff55ff;55ffff;ffffff",
	term_background: "80000000",
	term_foreground: "aaaaaa",
	term_background_bright: "555555",
	term_foreground_bright: "ffffff",
	term_margin: "64",
	term_margin_gradient: "32",
	editor_enabled: "yes",
	editor_highlighting: "yes",
	editor_validation: "yes",
};

export function createDefaultDesignConfig(): DesignConfig {
	return {
		...DEFAULT_DESIGN_CONFIG,
		wallpaper: [...DEFAULT_DESIGN_CONFIG.wallpaper],
	};
}
