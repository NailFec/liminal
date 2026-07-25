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
	| "behavior";

export type DesignField = {
	key: keyof DesignConfig;
	label: string;
	type: FieldType;
	group: DesignGroupId;
	help?: string;
	options?: { value: string; label: string }[];
	placeholder?: string;
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
];

export const DESIGN_FIELDS: DesignField[] = [
	{
		key: "graphics",
		label: "Graphics",
		type: "yesno",
		group: "wallpaper",
		help: "Force text mode when set to no.",
	},
	{
		key: "wallpaper",
		label: "Wallpaper",
		type: "path_list",
		group: "wallpaper",
		help: "BMP, PNG, JPEG, or QOI paths. Multiple values pick randomly.",
		placeholder: "boot():/boot/wallpaper.png",
	},
	{
		key: "wallpaper_style",
		label: "Wallpaper style",
		type: "enum",
		group: "wallpaper",
		options: [
			{ value: "stretched", label: "Stretched" },
			{ value: "centered", label: "Centered" },
			{ value: "tiled", label: "Tiled" },
		],
	},
	{
		key: "backdrop",
		label: "Backdrop",
		type: "color",
		group: "wallpaper",
		help: "RRGGBB colour for uncovered areas when style is centered.",
	},
	{
		key: "interface_resolution",
		label: "Resolution",
		type: "resolution",
		group: "interface",
		help: "Width×height for the Limine interface only.",
		placeholder: "1920x1080",
	},
	{
		key: "interface_rotation",
		label: "Rotation",
		type: "enum",
		group: "interface",
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
		placeholder: "liminal",
	},
	{
		key: "interface_branding_colour",
		label: "Branding colour",
		type: "color",
		group: "interface",
	},
	{
		key: "interface_help_hidden",
		label: "Hide help",
		type: "yesno",
		group: "interface",
	},
	{
		key: "interface_help_colour",
		label: "Help colour",
		type: "color",
		group: "interface",
	},
	{
		key: "interface_help_colour_bright",
		label: "Help colour bright",
		type: "color",
		group: "interface",
		help: "Countdown digit accent. Empty derives from help colour.",
	},
	{
		key: "term_background",
		label: "Background",
		type: "color_alpha",
		group: "terminal_colors",
		help: "TTRRGGBB — TT is transparency.",
	},
	{
		key: "term_foreground",
		label: "Foreground",
		type: "color",
		group: "terminal_colors",
	},
	{
		key: "term_background_bright",
		label: "Background bright",
		type: "color",
		group: "terminal_colors",
	},
	{
		key: "term_foreground_bright",
		label: "Foreground bright",
		type: "color",
		group: "terminal_colors",
	},
	{
		key: "term_palette",
		label: "Palette",
		type: "palette",
		group: "terminal_colors",
		help: "8 colours: black;red;green;brown;blue;magenta;cyan;gray",
	},
	{
		key: "term_palette_bright",
		label: "Palette bright",
		type: "palette",
		group: "terminal_colors",
		help: "8 bright colours separated by semicolons.",
	},
	{
		key: "term_font",
		label: "Font path",
		type: "text",
		group: "terminal_font",
		placeholder: "boot():/boot/font.bin",
	},
	{
		key: "term_font_size",
		label: "Font size",
		type: "text",
		group: "terminal_font",
		placeholder: "8x16",
	},
	{
		key: "term_font_scale",
		label: "Font scale",
		type: "text",
		group: "terminal_font",
		placeholder: "1x1",
	},
	{
		key: "term_font_spacing",
		label: "Font spacing",
		type: "number",
		group: "terminal_font",
	},
	{
		key: "term_margin",
		label: "Margin",
		type: "number",
		group: "terminal_font",
	},
	{
		key: "term_margin_gradient",
		label: "Margin gradient",
		type: "number",
		group: "terminal_font",
	},
	{
		key: "timeout",
		label: "Timeout",
		type: "text",
		group: "behavior",
		help: "Seconds, or no to disable. 0 boots instantly.",
		placeholder: "5",
	},
	{
		key: "quiet",
		label: "Quiet",
		type: "yesno",
		group: "behavior",
		help: "Suppress menu output until a key is pressed.",
	},
];

export function fieldsForGroup(groupId: DesignGroupId): DesignField[] {
	return DESIGN_FIELDS.filter((field) => field.group === groupId);
}
