import { spotifyClientId, spotifyScopes, spotifyRedirectUri } from '../../constants';

function getSpotifyAuthUrl(): string {
   return 'https://accounts.spotify.com/authorize' +
  '?response_type=code' +
  '&client_id=' + spotifyClientId +
  (spotifyScopes ? '&scope=' + encodeURIComponent(spotifyScopes) : '') +
  '&redirect_uri=' + encodeURIComponent(spotifyRedirectUri);
}

export function redirectToSpotifyAuth(): void {
    window.location.href = getSpotifyAuthUrl();
}