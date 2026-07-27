import type { DesignConfig } from "./types";

/** Map Limine config-file aliases to canonical DesignConfig keys. */
export const OPTION_ALIASES: Record<string, keyof DesignConfig> = {
	interface_branding_color: "interface_branding_colour",
	interface_help_color: "interface_help_colour",
	interface_help_color_bright: "interface_help_colour_bright",
	randomize_memory: "randomise_memory",
};
