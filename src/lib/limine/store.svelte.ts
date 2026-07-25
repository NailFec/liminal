import { createDefaultDesignConfig, type DesignConfig } from "./types";

class DesignStore {
	config = $state<DesignConfig>(createDefaultDesignConfig());

	setField<K extends keyof DesignConfig>(key: K, value: DesignConfig[K]) {
		this.config[key] = value;
	}

	reset() {
		this.config = createDefaultDesignConfig();
	}
}

export const designStore = new DesignStore();
