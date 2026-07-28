/** Vite raw import of the user Limine config (hard-coded import source). */
import userConf from "../../../user/limine.conf?raw";

export const USER_CONF_PATH = "user/limine.conf";

export const USER_CONF_TEXT: string = userConf;
