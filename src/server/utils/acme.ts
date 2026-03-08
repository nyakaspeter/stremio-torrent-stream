import acme from "acme-client";
import { clearTxtRecord, getDuckDnsDomain, setTxtRecord } from "./duckdns.js";

export const issueSslCertificate = async (
	domain: string,
	emailAddress: string,
	duckDnsToken: string,
) => {
	const fullDomain = getDuckDnsDomain(domain);

	const client = new acme.Client({
		directoryUrl: acme.directory.letsencrypt.production,
		accountKey: await acme.crypto.createPrivateKey(),
	});

	const [key, csr] = await acme.crypto.createCsr({ altNames: [fullDomain] });

	const cert = await client.auto({
		csr,
		email: emailAddress,
		termsOfServiceAgreed: true,
		skipChallengeVerification: true,
		challengePriority: ["dns-01"],
		challengeCreateFn: async (_authz, _challenge, keyAuthorization) => {
			await setTxtRecord(domain, duckDnsToken, keyAuthorization);
			await new Promise((resolve) => setTimeout(resolve, 3000));
		},
		challengeRemoveFn: async () => {
			await clearTxtRecord(domain, duckDnsToken);
		},
	});

	return { domain: fullDomain, key: key.toString(), cert };
};
