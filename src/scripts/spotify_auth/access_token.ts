import { expressWSAddr } from '../../common/constants';

interface NewAccessTokenCallbacks {
    handleNewAccessToken(accessToken: string, refreshSeconds: number, refreshToken: string) : void;
    handleAccessTokenFetchFailure(): void;
}

export async function getNewAccessToken(authorizationCode: string, callbacks: NewAccessTokenCallbacks) {
    console.log('getting access token');
    const spotifyTokenData = new URLSearchParams();
    spotifyTokenData.append('authorization_code', authorizationCode);
    try {
        const rawSpotifyTokenResponse = await fetch(expressWSAddr + '/api/spotify_tokens/new?' + spotifyTokenData.toString(), {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          if (!rawSpotifyTokenResponse.ok) {
              throw new Error("Response code was not ok: " + rawSpotifyTokenResponse.status);
          }
          const tokenResponseContent = await rawSpotifyTokenResponse.json();
          const accessToken = tokenResponseContent.access_token;
          const refreshSeconds = tokenResponseContent.refresh_seconds;
          const refreshToken = tokenResponseContent.refresh_token;
          callbacks.handleNewAccessToken(accessToken, refreshSeconds, refreshToken);
    } catch (e) {
        console.log(e);
        callbacks.handleAccessTokenFetchFailure();
    }
    
};

interface refreshTokenCallback {
    handleRefreshedToken(refreshToken: string, accessToken: string, refreshSeconds: number): void;
    handleFailedTokenRefresh(refreshToken: string): void;
}

export async function refreshAccessToken(refreshToken: string, callbacks: refreshTokenCallback) {
    console.log('refreshing access token with refresh token ' + refreshToken);
    const spotifyTokenData = new URLSearchParams();
    spotifyTokenData.append('refresh_token', refreshToken);
    try {
        const rawSpotifyTokenResponse = await fetch(expressWSAddr + '/api/spotify_tokens/refresh?' + spotifyTokenData.toString(), {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        });
        if (!rawSpotifyTokenResponse.ok) {
            throw new Error("Response code was not ok: " + rawSpotifyTokenResponse.status);
        }
        const tokenResponseContent = await rawSpotifyTokenResponse.json();
        const accessToken = tokenResponseContent.access_token;
        const refreshSeconds = tokenResponseContent.refresh_seconds;
        callbacks.handleRefreshedToken(refreshToken, accessToken, refreshSeconds);
    } catch (e) {
        console.log(e);
        callbacks.handleFailedTokenRefresh(refreshToken);
    }
  }

function secondsToMs(seconds: number) {
    return seconds * 1000;
}

export function secondsBeforeActuallyRefreshAccessToken(refreshSeconds: number) {
    // we want to refresh more often than the tokens will expire to ensure 
    //that the time taken to fetch a new one doesn't mean that for some period 
    // we will have no valid token
    return refreshSeconds / 2;
}

export function timeToRefresh(refreshSeconds: number) {
    const curDate = new Date();
    // refresh in half the number of seconds in order that we are sure it will happen on time
    return curDate.getTime() + secondsToMs(secondsBeforeActuallyRefreshAccessToken(refreshSeconds));
}