import { logger } from "../logger.js";

const DUCKDNS_API_ENDPOINT = "https://www.duckdns.org/update";

export const getDuckDnsSubdomain = (domain: string) => {
	return domain.toLowerCase().replace(/\.duckdns\.org$/, "");
};

export const getDuckDnsDomain = (domain: string) => {
	const lower = domain.toLowerCase();
	return lower.endsWith(".duckdns.org") ? lower : `${lower}.duckdns.org`;
};

export const updateDuckDnsIp = async (
	domain: string,
	token: string,
	ip?: string,
) => {
	const url = new URL(DUCKDNS_API_ENDPOINT);
	url.searchParams.append("domains", getDuckDnsSubdomain(domain));
	url.searchParams.append("token", token);
	if (ip) url.searchParams.append("ip", ip);

	const response = await fetch(url);
	if (!response.ok || (await response.text()) !== "OK") {
		throw new Error("Failed to update IP address for DuckDNS entry");
	}

	logger.info("Updated IP address for DuckDNS entry");
};

export const setTxtRecord = async (
	domain: string,
	token: string,
	txt: string,
) => {
	const url = new URL(DUCKDNS_API_ENDPOINT);
	url.searchParams.append("domains", getDuckDnsSubdomain(domain));
	url.searchParams.append("token", token);
	url.searchParams.append("txt", txt);

	const response = await fetch(url);
	if (!response.ok || (await response.text()) !== "OK") {
		throw new Error("Failed to update TXT record for DuckDNS entry");
	}

	logger.info("Updated TXT record for DuckDNS entry");
};

export const clearTxtRecord = async (domain: string, token: string) => {
	const url = new URL(DUCKDNS_API_ENDPOINT);
	url.searchParams.append("domains", getDuckDnsSubdomain(domain));
	url.searchParams.append("token", token);
	url.searchParams.append("txt", "");
	url.searchParams.append("clear", "true");

	const response = await fetch(url);
	if (!response.ok || (await response.text()) !== "OK") {
		throw new Error("Failed to update TXT record for DuckDNS entry");
	}

	logger.info("Cleared TXT record for DuckDNS entry");
};
