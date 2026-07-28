/**
 * Resolve Limine resource paths (e.g. `boot():/nf-wallpaper.png`) to URLs
 * from the project `user/` folder (simulated boot volume).
 *
 * Assets are imported via Vite (`?url`) from `user/` — do **not** also place
 * copies under `static/user/`, or `/user/…?url` will be served as raw files
 * and break the module graph (500 on pages that import LiminePreview).
 */

const globbed = import.meta.glob("../../../user/**/*.{png,jpg,jpeg,bmp,qoi,webp,gif}", {
	eager: true,
	query: "?url",
	import: "default",
}) as Record<string, string>;

/** Strip Limine URI prefixes down to a volume-relative path. */
export function stripLimineUri(path: string): string {
	let p = path.trim();
	p = p.replace(/^boot\(\):\/*/i, "");
	p = p.replace(/^uuid\([^)]*\):\/*/i, "");
	p = p.replace(/^guid\([^)]*\):\/*/i, "");
	p = p.replace(/^hdd\([^)]*\):\/*/i, "");
	const hash = p.indexOf("#");
	if (hash >= 0) p = p.slice(0, hash);
	return p.replace(/^\/+/, "");
}

function normalizeKey(fileKey: string): string {
	const normalized = fileKey.replace(/\\/g, "/");
	const marker = "/user/";
	const idx = normalized.lastIndexOf(marker);
	if (idx >= 0) return normalized.slice(idx + marker.length);
	return normalized.split("/").pop() ?? fileKey;
}

const byRelativePath = new Map<string, string>();
for (const [key, url] of Object.entries(globbed)) {
	if (typeof url !== "string" || !url) continue;
	const rel = normalizeKey(key);
	byRelativePath.set(rel.toLowerCase(), url);
	const base = rel.split("/").pop();
	if (base) byRelativePath.set(base.toLowerCase(), url);
}

/**
 * Map a Limine path to an image URL under `user/`, or null if not found
 * in the Vite-bundled glob (dev/build).
 */
export function resolveUserAsset(liminePath: string): string | null {
	const rel = stripLimineUri(liminePath);
	if (!rel) return null;
	return (
		byRelativePath.get(rel.toLowerCase()) ??
		byRelativePath.get(rel.split("/").pop()!.toLowerCase()) ??
		null
	);
}

/** Pick a wallpaper URL from configured paths (first resolvable). */
export function resolveWallpaperUrl(paths: string[]): string | null {
	for (const path of paths) {
		const trimmed = path.trim();
		if (!trimmed) continue;
		const url = resolveUserAsset(trimmed);
		if (url) return url;
	}
	return null;
}
