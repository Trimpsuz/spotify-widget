# Spotify widget

[![Stars](https://img.shields.io/github/stars/Trimpsuz/spotify-widget?style=flat)](https://github.com/Trimpsuz/spotify-widget/stargazers)
[![License](https://img.shields.io/badge/License-AGPLv3-purple.svg?label=license)](LICENSE)

Discord-style widget for Spotify

#

[![](https://spotify.trimpsuz.dev/widget?paused=true&progressBar=true&lastPlayed=true)](https://spotify.trimpsuz.dev/redirect?paused=true&lastPlayed=true&mode=track)

## Usage

1. Clone the repository
   ```sh
   git clone https://github.com/Trimpsuz/spotify-widget
   ```
2. Install the dependencies
   ```sh
   bun install
   ```
3. Visit the **[Spotify developer dashboard](https://developer.spotify.com/dashboard)** and **create a new app**
4. Set the **redirect URI** to `https://your.domain/callback` and enable the **Web API**
5. Go to the settings of the app and copy the **Client ID**
6. Create a file `.env`, and enter the **Client ID**, **Redirect URL** and the port you wish to use as in **[.env.example](.env.example)**
7. Start the server
   ```sh
   bun start
   ```
8. Visit the **Spotify OAuth URL** printed to the console and authrozie the app
9. The `/widget` and `/redirect` routes are now accessible

## Query parameters

| Route    | Name        | Possible values              | Description                                                                                                                                                |
| -------- | ----------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| widget   | paused      | `true`, `false` or missing   | If not true, ignores the current track if it is paused                                                                                                     |
| widget   | progressBar | `true`, `false` or missing   | If true, the progress bar will be shown on the currently playing track. If paused, the progress bar will be static                                         |
| widget   | lastPlayed  | `true`, `false` or missing   | If true, the last played track will be used when a currenly playing track is not found                                                                     |
| redirect | paused      | `true`, `false` or missing   | If not true, ignores the current song if it is paused. Should be set to the same value as `widget` for expected behaviour                                  |
| redirect | lastPlayed  | `true`, `false` or missing   | If true, the last played track will be used when a currenly playing track is not found. Should be set to the same value as `widget` for expected behaviour |
| redirect | mode        | `track`, `artist` or `album` | Defines where the redirect should lead to                                                                                                                  |

## License

- The project is licensed under AGPL 3.0. See the [LICENSE](LICENSE) file for more details.
