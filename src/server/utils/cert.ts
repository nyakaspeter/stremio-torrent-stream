import { X509Certificate } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../database/index.js";
import { certificates } from "../../database/schema.js";

export const getSslCertificate = async (domain?: string) => {
	return await db.query.certificates.findFirst(
		domain
			? {
					where: eq(certificates.domain, domain),
				}
			: undefined,
	);
};

export const saveSslCertificate = async (sslCert: {
	domain: string;
	key: string;
	cert: string;
}) => {
	await db
		.insert(certificates)
		.values({ ...sslCert, expiry: extractCertificateExpiryDate(sslCert.cert) })
		.onConflictDoUpdate({
			target: certificates.domain,
			set: { key: sslCert.key, cert: sslCert.cert },
		});
};

export const clearSslCertificate = async (domain: string) => {
	await db.delete(certificates).where(eq(certificates.domain, domain));
};

export const extractCertificateExpiryDate = (certPem: string): Date => {
	const cert = new X509Certificate(certPem);
	return new Date(cert.validTo);
};
