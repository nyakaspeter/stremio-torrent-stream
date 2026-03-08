export const guessLanguage = (name: string, category?: string) => {
	const split = name
		.toLowerCase()
		.replace(/\W/g, " ")
		.replace("x", " ")
		.split(" ");

	if (
		split.includes("hun") ||
		split.includes("hungarian") ||
		category?.includes("HU")
	)
		return { flag: "🇭🇺", name: "Hungarian" };
	if (
		split.includes("ger") ||
		split.includes("german") ||
		split.includes("deutsch")
	)
		return { flag: "🇩🇪", name: "German" };
	if (
		split.includes("fre") ||
		split.includes("french") ||
		split.includes("francais")
	)
		return { flag: "🇫🇷", name: "French" };
	if (
		split.includes("ita") ||
		split.includes("italian") ||
		split.includes("italiano")
	)
		return { flag: "🇮🇹", name: "Italian" };
	if (
		split.includes("spa") ||
		split.includes("spanish") ||
		split.includes("espanol") ||
		split.includes("castellano")
	)
		return { flag: "🇪🇸", name: "Spanish" };
	if (
		split.includes("por") ||
		split.includes("portuguese") ||
		split.includes("portugues")
	)
		return { flag: "🇵🇹", name: "Portuguese" };
	if (
		split.includes("rus") ||
		split.includes("russian") ||
		split.includes("russkiy")
	)
		return { flag: "🇷🇺", name: "Russian" };
	if (
		split.includes("pol") ||
		split.includes("polish") ||
		split.includes("polski")
	)
		return { flag: "🇵🇱", name: "Polish" };
	if (
		split.includes("dut") ||
		split.includes("dutch") ||
		split.includes("nederlands")
	)
		return { flag: "🇳🇱", name: "Dutch" };
	if (
		split.includes("swe") ||
		split.includes("swedish") ||
		split.includes("svenska")
	)
		return { flag: "🇸🇪", name: "Swedish" };
	if (
		split.includes("nor") ||
		split.includes("norwegian") ||
		split.includes("norsk")
	)
		return { flag: "🇳🇴", name: "Norwegian" };
	if (
		split.includes("dan") ||
		split.includes("danish") ||
		split.includes("dansk")
	)
		return { flag: "🇩🇰", name: "Danish" };
	if (
		split.includes("fin") ||
		split.includes("finnish") ||
		split.includes("suomi")
	)
		return { flag: "🇫🇮", name: "Finnish" };
	if (
		split.includes("cze") ||
		split.includes("czech") ||
		split.includes("cesky")
	)
		return { flag: "🇨🇿", name: "Czech" };
	if (
		split.includes("slo") ||
		split.includes("slovak") ||
		split.includes("slovensky")
	)
		return { flag: "🇸🇰", name: "Slovak" };
	if (
		split.includes("tur") ||
		split.includes("turkish") ||
		split.includes("turkce")
	)
		return { flag: "🇹🇷", name: "Turkish" };
	if (
		split.includes("gre") ||
		split.includes("greek") ||
		split.includes("ellinika")
	)
		return { flag: "🇬🇷", name: "Greek" };
	if (
		split.includes("ara") ||
		split.includes("arabic") ||
		split.includes("arabi")
	)
		return { flag: "🇸🇦", name: "Arabic" };
	if (
		split.includes("heb") ||
		split.includes("hebrew") ||
		split.includes("ivrit")
	)
		return { flag: "🇮🇱", name: "Hebrew" };
	if (
		split.includes("jpn") ||
		split.includes("japanese") ||
		split.includes("nihongo")
	)
		return { flag: "🇯🇵", name: "Japanese" };
	if (
		split.includes("kor") ||
		split.includes("korean") ||
		split.includes("hangul")
	)
		return { flag: "🇰🇷", name: "Korean" };
	if (
		split.includes("chi") ||
		split.includes("chinese") ||
		split.includes("mandarin") ||
		split.includes("cantonese")
	)
		return { flag: "🇨🇳", name: "Chinese" };
	if (split.includes("hin") || split.includes("hindi"))
		return { flag: "🇮🇳", name: "Hindi" };
	if (split.includes("tha") || split.includes("thai"))
		return { flag: "🇹🇭", name: "Thai" };
	if (split.includes("vie") || split.includes("vietnamese"))
		return { flag: "🇻🇳", name: "Vietnamese" };
	if (
		split.includes("ind") ||
		split.includes("indonesian") ||
		split.includes("bahasa")
	)
		return { flag: "🇮🇩", name: "Indonesian" };
	if (
		split.includes("msa") ||
		split.includes("malay") ||
		split.includes("melayu")
	)
		return { flag: "🇲🇾", name: "Malay" };
	if (split.includes("ukr") || split.includes("ukrainian"))
		return { flag: "🇺🇦", name: "Ukrainian" };
	if (split.includes("bul") || split.includes("bulgarian"))
		return { flag: "🇧🇬", name: "Bulgarian" };
	if (
		split.includes("rom") ||
		split.includes("romanian") ||
		split.includes("romana")
	)
		return { flag: "🇷🇴", name: "Romanian" };
	if (
		split.includes("hrv") ||
		split.includes("croatian") ||
		split.includes("hrvatski")
	)
		return { flag: "🇭🇷", name: "Croatian" };
	if (
		split.includes("srp") ||
		split.includes("serbian") ||
		split.includes("srpski")
	)
		return { flag: "🇷🇸", name: "Serbian" };
	if (
		split.includes("slv") ||
		split.includes("slovenian") ||
		split.includes("slovenski")
	)
		return { flag: "🇸🇮", name: "Slovenian" };
	if (
		split.includes("est") ||
		split.includes("estonian") ||
		split.includes("eesti")
	)
		return { flag: "🇪🇪", name: "Estonian" };
	if (
		split.includes("lav") ||
		split.includes("latvian") ||
		split.includes("latviesu")
	)
		return { flag: "🇱🇻", name: "Latvian" };
	if (
		split.includes("lit") ||
		split.includes("lithuanian") ||
		split.includes("lietuviu")
	)
		return { flag: "🇱🇹", name: "Lithuanian" };

	return { flag: "🇺🇸", name: "English" };
};
