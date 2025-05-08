import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { rateLimiter } from 'hono-rate-limiter';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { getConnInfo } from 'hono/bun';
import type { Artist } from './types';
import { fontMono, fontSans, fonts, noCoverBase64, spotifyIconBase64 } from './contants';
import { generateSpotifyAuthUrl, getAccessToken } from './utils/spotify';
import { formatTime, getTimer } from './utils/utils';
import { escape } from 'html-escaper';

const app = new Hono();

console.log(await generateSpotifyAuthUrl());

let api: SpotifyApi;

app.get('/callback', async (c) => {
  if (api && (await api.getAccessToken()) != null) return c.text('Already authenticated');

  const code = c.req.query().code;

  if (!code) return c.text('Missing code');

  const tokens = await getAccessToken(code);

  if (tokens.error) return c.text(tokens.error);

  api = SpotifyApi.withAccessToken(Bun.env.CLIENT_ID || '', tokens);

  return c.text('Success');
});

app.get(
  '/widget',
  cors({ origin: '*' }),
  rateLimiter({
    windowMs: 1 * 60 * 1000,
    limit: 30,
    keyGenerator: (c) => getConnInfo(c).remote.address || '',
  }),
  async (c) => {
    if (!api || (await api.getAccessToken()) == null) return c.text('Authenticate first');

    const paused = c.req.query().paused;
    const lastPlayed = c.req.query().lastPlayed;
    const progressBar = c.req.query().progressBar;

    let track: any = await api.player.getCurrentlyPlayingTrack();

    if (track && (track.is_playing || paused == 'true')) {
      let imageBase64;

      if (track.item.album.images.length != 0) {
        imageBase64 = await fetch(track.item.album.images[0].url).then(async (res) => {
          return Buffer.from(new Uint8Array(await res.arrayBuffer())).toString('base64');
        });
      } else {
        imageBase64 = noCoverBase64;
      }

      return c.text(
        `<svg width="429px" height="160px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
          ${fonts}

          .hover-image {
            transition: filter 0.1s ease;
          }

          .hover-image:hover {
            filter: brightness(0.8);
          }
        </style>

        <foreignObject width="429" height="160">
          <div xmlns="http://www.w3.org/1999/xhtml"
            style="
              display: flex;
              flex-direction: column;
              gap: 8px;
              padding: 10px;
              border-radius: 8px;
              box-sizing: border-box;
              background: #2e2f34;
              width: 100%;
              height: 100%;
              overflow: visible;
              position: relative;
              border: none;
            "
          >
            <div
              style="
                display: flex;
                gap: 4px;
                color: color-mix(in oklab, hsl(0 calc(1*0%) 98.431% /1) 100%, #000 0%);
                align-items: center;
              "
            >
              <div
                style="
                  font-family: ${fontSans};
                  font-size: 16px;
                  line-height: 1.3333333333333333;
                  font-weight: 400;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  position: relative;
                  color: color-mix(in oklab, hsl(0 calc(1*0%) 98.431% /1) 100%, #000 0%);
                "
              >Listening to Spotify</div>
              <div
                style="
                  -webkit-mask-size: cover;
                  mask-size: cover;
                  background-color: color-mix(in oklab, hsl(240 calc(1*3.883%) 59.608% /1) 100%, #000 0%);
                  width: 16px;
                  height: 16px;
                  mask-image: url(data:image/svg+xml;base64,${spotifyIconBase64});
                "
              ></div>
            </div>
            <div
              style="
                display: flex;
                flex: 1 1 auto;
                flex-direction: row;
                gap: 10px;
              "
            >
              <a
                style="
                  position: relative;
                  overflow: visible;
                  display: flex;
                  height: -moz-max-content;
                  height: max-content;
                  align-items: center;
                  border-radius: 8px;
                "
                href="${track.item.album.external_urls.spotify}"
              >
                <img class="hover-image" style="max-width: 111px; min-height: 111px; border-radius: inherit;" src="data:image/jpg;base64,${imageBase64}" />
              </a>
              <div
                style="
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  align-self: center;
                  gap: 4px;
                  width: 100%;
                "
              >
                <div>
                  <div
                    style="
                      font-family: ${fontSans};
                      font-size: 24px;
                      font-weight: 600;
                      line-height: 1.1;
                      color: color-mix(in oklab, hsl(240 calc(1*3.226%) 93.922% /1) 100%, #000 0%);
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      overflow: hidden;
                    "
                  >
                    <a href="${track.item.external_urls.spotify}"
                      style="color: inherit; text-decoration: none;"
                      onmouseover="this.style.textDecoration='underline';" 
                      onmouseout="this.style.textDecoration='none';"
                    >${escape(track.item.name)}</a>
                  </div>
                </div>
                <div>
                  <div
                    style="
                      font-family: ${fontSans};
                      font-size: 16px;
                      font-weight: 400;
                      line-height: 1.3333333333333333;
                      color: color-mix(in oklab, hsl(240 calc(1*3.226%) 93.922% /1) 100%, #000 0%);
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      overflow: hidden;
                    "
                  >
                    ${(track.item.artists as Artist[])
                      .map(
                        (artist, index, arr) =>
                          `<a href="${artist.external_urls.spotify}"
                            style="color: inherit; text-decoration: none;"
                            onmouseover="this.style.textDecoration='underline';" 
                            onmouseout="this.style.textDecoration='none';"
                          >${escape(artist.name)}</a>${index < arr.length - 1 ? ', ' : ''}`
                      )
                      .join('')}
                  </div>
                </div>
                ${
                  progressBar == 'true'
                    ? `
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      gap: 8px;
                    "
                  >
                    <div
                      style="
                        font-family: ${fontMono};
                        font-size: ${track.is_playing ? '0px' : '16px'};
                        font-weight: 400;
                        line-height: 1.3333333333333333;
                        color: color-mix(in oklab, hsl(240 calc(1*3.226%) 93.922% /1) 100%, #000 0%);
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        display: flex;
                        flex-direction: row;
                      "
                    >${track.is_playing ? getTimer(track.progress_ms) : formatTime(track.progress_ms)}</div>
                    <div
                      style="
                        flex: 1;
                        height: 4px;
                        border-radius: 4px;
                        background-color: color-mix(in oklab, hsl(240 calc(1*5.882%) 33.333% /1) 100%, #000 0%);
                      "
                    >
                      ${
                        track.is_playing
                          ? `<style>
                          @keyframes progressAnimation {
                            from {
                              width: ${(track.progress_ms / track.item.duration_ms) * 100}%;
                            }
                            to {
                              width: 100%;
                            }
                          }
                        </style>`
                          : ''
                      }
                      <div
                        style="
                          height: inherit;
                          border-radius: inherit;
                          min-width: 4px;
                          background-color: color-mix(in oklab, hsl(0 calc(1*0%) 98.431% /1) 100%, #000 0%);
                          width: ${(track.progress_ms / track.item.duration_ms) * 100}%;
                          animation: progressAnimation ${track.item.duration_ms - track.progress_ms}ms linear forwards;
                        "
                      />
                    </div>
                    <div
                      style="
                        font-family: ${fontMono};
                        font-size: 16px;
                        font-weight: 400;
                        line-height: 1.3333333333333333;
                        color: color-mix(in oklab, hsl(240 calc(1*3.226%) 93.922% /1) 100%, #000 0%);
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                      "
                    >${formatTime(track.item.duration_ms)}</div>
                  </div>
                  `
                    : ''
                }
              </div>
            </div>
          </div>
        </foreignObject>
      </svg>`,
        200,
        { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' }
      );
    }

    if (lastPlayed == 'true') track = (await api.player.getRecentlyPlayedTracks()).items[0].track;

    if (track && lastPlayed == 'true') {
      let imageBase64;

      if (track.album.images.length != 0) {
        imageBase64 = await fetch(track.album.images[0].url).then(async (res) => {
          return Buffer.from(new Uint8Array(await res.arrayBuffer())).toString('base64');
        });
      } else {
        imageBase64 = noCoverBase64;
      }

      return c.text(
        `<svg width="429px" height="160px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
          ${fonts}

          .hover-image {
            transition: filter 0.1s ease;
          }

          .hover-image:hover {
            filter: brightness(0.8);
          }
        </style>

        <foreignObject width="429" height="160">
          <div xmlns="http://www.w3.org/1999/xhtml"
            style="
              display: flex;
              flex-direction: column;
              gap: 8px;
              padding: 10px;
              border-radius: 8px;
              box-sizing: border-box;
              background: #2e2f34;
              width: 100%;
              height: 100%;
              overflow: visible;
              position: relative;
              border: none;
            "
          >
            <div
              style="
                display: flex;
                gap: 4px;
                color: color-mix(in oklab, hsl(0 calc(1*0%) 98.431% /1) 100%, #000 0%);
                align-items: center;
              "
            >
              <div
                style="
                  font-family: ${fontSans};
                  font-size: 16px;
                  line-height: 1.3333333333333333;
                  font-weight: 400;
                  white-space: nowrap;
                  text-overflow: ellipsis;
                  overflow: hidden;
                  position: relative;
                  color: color-mix(in oklab, hsl(0 calc(1*0%) 98.431% /1) 100%, #000 0%);
                "
              >Last listened to Spotify</div>
              <div
                style="
                  -webkit-mask-size: cover;
                  mask-size: cover;
                  background-color: color-mix(in oklab, hsl(240 calc(1*3.883%) 59.608% /1) 100%, #000 0%);
                  width: 16px;
                  height: 16px;
                  mask-image: url(data:image/svg+xml;base64,${spotifyIconBase64});
                "
              ></div>
            </div>
            <div
              style="
                display: flex;
                flex: 1 1 auto;
                flex-direction: row;
                gap: 10px;
              "
            >
              <a
                style="
                  position: relative;
                  overflow: visible;
                  display: flex;
                  height: -moz-max-content;
                  height: max-content;
                  align-items: center;
                  border-radius: 8px;
                "
                href="${track.album.external_urls.spotify}"
              >
                <img class="hover-image" style="max-width: 111px; min-height: 111px; border-radius: inherit;" src="data:image/jpg;base64,${imageBase64}" />
              </a>
              <div
                style="
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  align-self: center;
                  gap: 4px;
                  width: 100%;
                "
              >
                <div>
                  <div
                    style="
                      font-family: ${fontSans};
                      font-size: 24px;
                      font-weight: 600;
                      line-height: 1.1;
                      color: color-mix(in oklab, hsl(240 calc(1*3.226%) 93.922% /1) 100%, #000 0%);
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      overflow: hidden;
                    "
                  >
                    <a href="${track.external_urls.spotify}"
                      style="color: inherit; text-decoration: none;"
                      onmouseover="this.style.textDecoration='underline';" 
                      onmouseout="this.style.textDecoration='none';"
                    >${escape(track.name)}</a>
                  </div>
                </div>
                <div>
                  <div
                    style="
                      font-family: ${fontSans};
                      font-size: 16px;
                      font-weight: 400;
                      line-height: 1.3333333333333333;
                      color: color-mix(in oklab, hsl(240 calc(1*3.226%) 93.922% /1) 100%, #000 0%);
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      overflow: hidden;
                    "
                  >
                    ${(track.artists as Artist[])
                      .map(
                        (artist, index, arr) =>
                          `<a href="${artist.external_urls.spotify}"
                            style="color: inherit; text-decoration: none;"
                            onmouseover="this.style.textDecoration='underline';" 
                            onmouseout="this.style.textDecoration='none';"
                          >${escape(artist.name)}</a>${index < arr.length - 1 ? ', ' : ''}`
                      )
                      .join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </foreignObject>
      </svg>`,
        200,
        { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' }
      );
    }

    return c.text(
      `<svg width="429px" height="160px" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
          ${fonts}
        </style>

        <foreignObject width="429" height="160">
          <div xmlns="http://www.w3.org/1999/xhtml"
            style="
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              text-align: center;
              gap: 10px;
              padding: 10px;
              border-radius: 8px;
              box-sizing: border-box;
              background: #36363c;
              width: 100%;
              height: 100%;
            "
          >
            <div
              style="
                font-family: 'gg sans';
                font-weight: 600;
                font-size: 24px;
                color: color-mix(in oklab, hsl(240 calc(1*3.226%) 93.922% /1) 100%, #000 0%);
              "
            >Nothing playing currently</div>
          </div>
        </foreignObject>
      </svg>`,
      200,
      { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'no-store' }
    );
  }
);

app.get(
  '/redirect',
  rateLimiter({
    windowMs: 1 * 60 * 1000,
    limit: 30,
    keyGenerator: (c) => getConnInfo(c).remote.address || '',
  }),
  async (c) => {
    if (!api || (await api.getAccessToken()) == null) return c.text('Authenticate first');

    const paused = c.req.query().paused;
    const lastPlayed = c.req.query().lastPlayed;
    const mode = c.req.query().mode;

    let track: any = await api.player.getCurrentlyPlayingTrack();

    if (track && (track.is_playing || paused == 'true')) {
      switch (mode) {
        case 'track':
          return c.redirect(track.item.external_urls.spotify);
        case 'artist':
          return c.redirect(track.item.artists[0].external_urls.spotify);
        case 'album':
          return c.redirect(track.item.album.external_urls.spotify);
      }
    }

    if (lastPlayed == 'true') track = (await api.player.getRecentlyPlayedTracks()).items[0].track;

    if (track && lastPlayed == 'true') {
      switch (mode) {
        case 'track':
          return c.redirect(track.external_urls.spotify);
        case 'artist':
          return c.redirect(track.artists[0].external_urls.spotify);
        case 'album':
          return c.redirect(track.album.external_urls.spotify);
      }
    }

    const query = c.req.query();
    delete query.mode;
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      params.append(key, value);
    });
    return c.redirect(`/widget?${params}`);
  }
);

app.get('*', (c) => {
  return c.redirect('https://github.com/Trimpsuz/spotify-widget');
});

export default {
  port: Bun.env.PORT || 3000,
  fetch: app.fetch,
};
