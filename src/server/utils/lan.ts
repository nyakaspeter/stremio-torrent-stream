import os from "node:os";

export const guessLanIp = async () => {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		for (const iface of interfaces[name] || []) {
			if (iface.family === "IPv4" && !iface.internal) {
				// filter out docker bridge (usually 172.x.x.x)
				if (!iface.address.startsWith("172.")) {
					return iface.address;
				}
			}
		}
	}

	return undefined;
};
