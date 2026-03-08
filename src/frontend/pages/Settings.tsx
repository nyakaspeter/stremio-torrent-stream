import { css } from "hono/css";
import type { FC } from "hono/jsx";
import { TorrentFormat, TorrentProvider } from "../../types/search.js";
import type { Settings } from "../../types/settings.js";

export const SettingsPage: FC<{
	settings: Settings;
	https: boolean;
	lanIp?: string;
}> = ({ settings, https, lanIp }) => {
	const styles = css`
		&:has(#enabled_providers_checkbox_insane:not(:checked)) #enabled_providers_config_insane {
            display: none;
        }
        &:has(#enabled_providers_checkbox_ncore:not(:checked)) #enabled_providers_config_ncore {
            display: none;
        }
		&:has(#enabled_providers_checkbox_jackett:not(:checked)) #enabled_providers_config_jackett {
            display: none;
        }
		&:has(#seed_torrents_checkbox:not(:checked)) #seed_torrents_config {
            display: none;
        }
		.success-text {
		    color: green;
		}
		.warning-text {
		    color: orange;
		}
		.error-text {
            color: red;
        }
    `;

	return (
		<form class={styles} method="post" action="/settings">
			<fieldset>
				<legend
					data-tooltip="Set up and install the Torrent Stream Stremio addon in this section"
					data-placement="right"
				>
					<strong>Stremio addon:</strong>
				</legend>
				{https ? (
					<div class="success-text">
						The webserver's SSL certificate is valid. Click the button below to
						install the addon to your Stremio account.
					</div>
				) : (
					<div class="error-text">
						No valid SSL certificate is found so the Stremio addon will only
						work on your local machine. Please fill the form below and issue an
						SSL certificate or put the webserver behind a reverse proxy with SSL
						to make it available on LAN or WAN.
					</div>
				)}
			</fieldset>
			{settings.hostIp && settings.hostIp !== lanIp && (
				<fieldset>
					<div class="warning-text">
						The entered host IP seems to be different than your LAN IP. Please
						make sure you enter the correct LAN IP.
					</div>
				</fieldset>
			)}
			<fieldset class="grid">
				<label>
					Host IP
					<input
						name="hostIp"
						value={settings.hostIp || lanIp}
						disabled={https}
						placeholder="Enter the LAN IP of your server"
					/>
				</label>
				<label>
					Email address
					<input
						type="email"
						name="emailAddress"
						value={settings.emailAddress}
						disabled={https}
						placeholder="Enter the email address used for requesting SSL certificate"
					/>
				</label>
			</fieldset>
			<fieldset class="grid">
				<label>
					DuckDNS Domain
					<input
						name="duckDnsDomain"
						value={settings.duckDnsDomain}
						disabled={https}
						placeholder="Enter your DuckDNS domain"
					/>
				</label>
				<label>
					DuckDNS API key
					<input
						type="password"
						name="duckDnsToken"
						value={settings.duckDnsToken}
						disabled={https}
						placeholder="Enter your DuckDNS token"
					/>
				</label>
			</fieldset>
			<fieldset class="grid">
				{https ? (
					<button type="submit" name="clearSslCertificate" value="true">
						Clear SSL certificate
					</button>
				) : (
					<button type="submit" name="issueSslCertificate" value="true">
						Issue SSL certificate
					</button>
				)}
				<button type="button">Install Stremio addon</button>
			</fieldset>
			<fieldset class="grid">
				<legend
					data-tooltip="Select which providers you want to use for searching torrents"
					data-placement="right"
				>
					<strong>Enabled providers:</strong>
				</legend>
				{Object.entries(TorrentProvider).map(([label, value]) => (
					<label>
						<input
							type="checkbox"
							name="enabledProviders"
							value={value}
							checked={settings.enabledProviders.includes(value)}
							id={`enabled_providers_checkbox_${value}`}
						/>
						{label}
					</label>
				))}
			</fieldset>
			<fieldset id="enabled_providers_config_insane" class="grid">
				<label>
					iNSANE username
					<input
						name="insaneUsername"
						value={settings.insaneUsername}
						placeholder="Enter your iNSANE username"
					/>
				</label>
				<label>
					iNSANE password
					<input
						type="password"
						name="insanePassword"
						value={settings.insanePassword}
						placeholder="Enter your iNSANE password"
					/>
				</label>
			</fieldset>
			<fieldset id="enabled_providers_config_ncore" class="grid">
				<label>
					nCore username
					<input
						name="ncoreUsername"
						value={settings.ncoreUsername}
						placeholder="Enter your nCore username"
					/>
				</label>
				<label>
					nCore password
					<input
						type="password"
						name="ncorePassword"
						value={settings.ncorePassword}
						placeholder="Enter your nCore password"
					/>
				</label>
			</fieldset>
			<fieldset id="enabled_providers_config_jackett" class="grid">
				<label>
					Jackett API address
					<input
						name="jackettApiAddress"
						value={settings.jackettApiAddress}
						placeholder="Enter your Jackett API address"
					/>
				</label>
				<label>
					Jackett API key
					<input
						type="password"
						name="jackettApiKey"
						value={settings.jackettApiKey}
						placeholder="Enter Jackett API key"
					/>
				</label>
			</fieldset>
			<fieldset class="grid">
				<legend
					data-tooltip="Torrents with the selected formats will be hidden from the search results"
					data-placement="right"
				>
					<strong>Disabled formats:</strong>
				</legend>
				{Object.entries(TorrentFormat).map(([label, value]) => (
					<label>
						<input
							type="checkbox"
							name="disabledFormats"
							value={value}
							checked={settings.disabledFormats.includes(value)}
						/>
						{label}
					</label>
				))}
			</fieldset>
			<fieldset class="grid">
				<legend>
					<strong>Torrent settings:</strong>
				</legend>
				<label>
					<input
						type="checkbox"
						name="keepDownloadedFiles"
						checked={settings.keepDownloadedFiles}
					/>
					Keep downloaded files after removing torrent
				</label>
				<label>
					<input
						type="checkbox"
						name="seedTorrents"
						checked={settings.seedTorrents}
						id="seed_torrents_checkbox"
					/>
					Seed torrents after completion
				</label>
			</fieldset>
			<fieldset id="seed_torrents_config" class="grid">
				<label>
					Seed for (minutes)
					<input
						type="number"
						name="seedMinutes"
						value={settings.seedMinutes}
						placeholder="Enter the desired seeding time"
					/>
				</label>
				<label>
					Seed until (ratio)
					<input
						type="number"
						min="0"
						step="0.1"
						name="seedRatio"
						value={settings.seedRatio}
						placeholder="Enter the desired ratio"
					/>
				</label>
			</fieldset>
			<fieldset>
				<legend>
					<strong>Miscellaneous:</strong>
				</legend>
				<label>
					<input
						type="checkbox"
						name="titleSearch"
						checked={settings.titleSearch}
					/>
					Search by title on trackers instead of IMDB id
				</label>
			</fieldset>
			<input type="submit" value="Save" />
		</form>
	);
};
