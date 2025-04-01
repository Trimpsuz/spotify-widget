let verify: { verifier: string; challenge: string };

export const generateSpotifyAuthUrl = async () => {
  const generateVerifier = (size: number) => {
    let value = '';
    const dictionnary = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let idx = 0; idx < size; idx++) {
      value += dictionnary.charAt(Math.floor(Math.random() * dictionnary.length));
    }
    return value;
  };

  const generateChallenge = async (verifier: string) => {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };

  const verifier = generateVerifier(64);
  const challenge = await generateChallenge(verifier);
  verify = { verifier, challenge };

  const params = new URLSearchParams();
  params.append('client_id', Bun.env.CLIENT_ID || '');
  params.append('response_type', 'code');
  params.append('redirect_uri', Bun.env.REDIRECT_URL || '');
  params.append('scope', 'user-read-playback-state user-read-recently-played');
  params.append('code_challenge_method', 'S256');
  params.append('code_challenge', challenge);

  return 'https://accounts.spotify.com/authorize?' + params.toString();
};

export const getAccessToken = async (code: string) => {
  const params = new URLSearchParams();
  params.append('client_id', Bun.env.CLIENT_ID || '');
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', Bun.env.REDIRECT_URL || '');
  params.append('code_verifier', verify.verifier);

  const request = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  return await request.json();
};
