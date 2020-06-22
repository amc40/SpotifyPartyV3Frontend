import { setCookie } from './cookies'; 
import { spotifyAccessTokenCookie, spotifyAccessTokenRefreshTimeCookie, spotifyRefreshTokenCookie} from '../../constants';
import { timeToRefresh } from '../';

export function setSpotifyAuthCookies(accessToken: string, refreshSeconds: number, refreshToken: string) {
    setCookie(spotifyAccessTokenCookie, accessToken);
    setCookie(spotifyAccessTokenRefreshTimeCookie, timeToRefresh(refreshSeconds).toString());
    setCookie(spotifyRefreshTokenCookie, refreshToken);
}