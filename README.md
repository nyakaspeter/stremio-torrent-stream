# Stremio Torrent Stream addon

This self-hostable addon enables Stremio to stream movies and shows from a [Torrent Stream Server](https://github.com/nyakaspeter/torrent-stream-server). It works great with both public and private trackers through [Jackett](https://github.com/Jackett/Jackett) and built-in scrapers.

## How to run

First you'll have to ensure that an instance of Torrent Stream Server is running on your local network (recommended) or that it is remotely accessible over the internet (not recommended). Then just start up the addon...

...with Node.js
```
git clone https://github.com/nyakaspeter/stremio-torrent-stream.git
cd stremio-torrent-stream
npm i
npm run build
npm start
```

...with Docker
```
docker run -p 58827:58827 nyakaspeter/stremio-torrent-stream
```

...or you can use Docker Compose with the included compose.yml to run the addon, Torrent Stream Server and Jackett simultaneously
```
git clone https://github.com/nyakaspeter/stremio-torrent-stream.git
cd stremio-torrent-stream
docker compose up
```

Once the addon server is up, you'll see a console output like this:
```
HTTP addon accessible at: http://127.0.0.1:58827/manifest.json
HTTPS addon accessible at: https://some-random-domain.loca.lt
Tunnel password: x.xxx.xxx.xx
```

On your local computer you can install the addon using the HTTP URL but if you want to use it with other devices too open the HTTPS URL provided by [localtunnel](https://theboroer.github.io/localtunnel-www/). When you first open it localtunnel will ask for a password, you can copy it from the console output. After submitting the password the browser will show the configuration screen for the addon. 

![image](https://github.com/nyakaspeter/stremio-torrent-stream/assets/43880678/f25f8d62-ec3a-425c-b62e-0928d000b893)

On this screen you can set up where the the Torrent Stream Server and Jackett are reachable, enter your torrent site credentials and configure torrent search settings. **It is important that for the Stream server URL you enter an address that is reachable by the addon server and the devices you want to watch content from. If you want to use Jackett it's address will have to be reachable by the stream server. If everything is running on your local network (recommended) and your client devices are also connected there, LAN IPs of the host machines will work fine.**

When you're done with the configuration hit the install button at the bottom, that will redirect you to Stremio where you can finally install the addon. If you've configured everything properly you'll see torrent results populating the stream list for movies and shows.

![image](https://github.com/nyakaspeter/torrent-stream-server/assets/43880678/87fbf602-d2c5-4d4f-9e4e-eda21ed58c51)
