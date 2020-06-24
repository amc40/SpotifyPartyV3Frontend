import React from "react";
import { Redirect } from 'react-router-dom'
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import { ChevronLeft, MenuRounded, ChevronRight } from "@material-ui/icons";
import { Root, Header, Nav } from "mui-layout";
import { makeStyles } from '@material-ui/styles';
import SpotifyWebApi from 'spotify-web-api-js';
import lodash from "lodash";

import "../styles.css";
import { spotifyAccessTokenCookie, spotifyAccessTokenRefreshTimeCookie, spotifyRefreshTokenCookie } from '../common/constants';
import { getCookie, refreshAccessToken, secondsBeforeActuallyRefreshAccessToken, getNewPartyId } from '../scripts';
import { StickyFooter, SongSearch, SearchResults } from "./";
// TODO: move to more appropriate location
import mui_config from '../mui_config';
import { ActiveDevices } from "./ActiveDevices";
import { SongInfo } from "../common/interfaces";


const spotify = new SpotifyWebApi();


const theme = createMuiTheme();

async function updateSongs(searchText: string): Promise<SongInfo[]>{
  if (spotify.getAccessToken()) {
    if (searchText === '') {
      console.log('Empty search text.');
      return [];
    } else {
      // if access token has been set 
      const res = await spotify.searchTracks(searchText, {limit: 10});
      const tracks = res.tracks.items.map((trackInfo) => { 
        return {
            name: trackInfo.name, 
            uri: trackInfo.uri, 
            album: trackInfo.album.name, 
            artists: trackInfo.artists.map(artist => artist.name)
        };
      });
      console.log(tracks);
      return tracks;
    }
    
  } else {
    console.log('Not sending as access token has not yet');
    return [];
  }
} 

export function PartyPage() {

    const [navigateToHomepage, setNavigateToHomepage] = React.useState(false); 

    const renderRedirectToHomepage = () => {
        if (navigateToHomepage) {
            return <Redirect to='/' />;
        }
    }

    function handleMissingCookies() {
        //navigate home if don't have necessary cookies
        setNavigateToHomepage(true);
    }

    function handleRefreshedToken(refreshToken: string, accessToken: string, refreshSeconds: number) {
        spotify.setAccessToken(accessToken);
        setTimeout(refreshAccessToken, secondsBeforeActuallyRefreshAccessToken(refreshSeconds), refreshToken, {
            handleRefreshedToken,
            handleFailedTokenRefresh
        });
    }

    function handleFailedTokenRefresh(refreshToken: string) {
        // TODO: limit number of times to prevent infinite recursion
        refreshAccessToken(refreshToken, {
            handleRefreshedToken,
            handleFailedTokenRefresh
        });
    }

    function onPartyPageLoad() {
        const accessToken = getCookie(spotifyAccessTokenCookie);
        const refreshTime = getCookie(spotifyAccessTokenRefreshTimeCookie);
        const refreshToken = getCookie(spotifyRefreshTokenCookie);
        console.log(`accessToken: ${accessToken}, refreshTime: ${refreshTime}, refreshToken: ${refreshToken}`);
        if (accessToken !== undefined && refreshTime !== undefined && refreshToken !== undefined) {
            console.log('got access token, refresh time, and refresh token');
            spotify.setAccessToken(accessToken);
            const currentTime = new Date().getTime();
            const msToRefresh = parseInt(refreshTime) - currentTime;
            if (msToRefresh > 0) {
                setTimeout(refreshAccessToken, msToRefresh, refreshToken, {
                    handleRefreshedToken,
                    handleFailedTokenRefresh
                });
            } else {
                refreshAccessToken(refreshToken, {
                    handleRefreshedToken,
                    handleFailedTokenRefresh
                });
            }
        } else {
            console.log('missing cookies');
            handleMissingCookies();
        }
    }

    React.useEffect(onPartyPageLoad, []);

    function handleCouldNotSetPartyId() {
        // TODO: display message
        setNavigateToHomepage(true);
    }

    const [partyId, setPartyId] = React.useState(undefined as undefined | string);

    async function fetchPartyId() {
        const newPartyId = await getNewPartyId();
        if (newPartyId) {
            setPartyId(newPartyId);
            console.log('got new party id:', newPartyId);
        } else {
            handleCouldNotSetPartyId();
        }
    }

    React.useEffect(() => {fetchPartyId();}, []);
  
    const footerContent = <h2>Footer</h2>;

    const useDrawerStyles = makeStyles({
        paper: {
        backgroundColor: '#030303',
        color: 'white',
        border: 'none',
        },
    });


    const drawerStyles =  useDrawerStyles();

    const initialSearchText = 'Search...';

    const [tracks, setTracks] = React.useState([] as SongInfo[]);

    function handleSearch(newSearchText: string) {
        console.log(`New Search Text: ${newSearchText}`);
        updateSongs(newSearchText).then(newSongs => {
            console.log("calling result for", newSearchText);
            setTracks(newSongs);
        });
    }

    const content = partyId? <SearchResults songs={tracks} partyId={partyId}/>: undefined;
    return (
    <ThemeProvider theme={theme}>
        {renderRedirectToHomepage()}
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Root config={mui_config}>
            <Header
            renderMenuIcon={(open: boolean) => (open ? <ChevronLeft /> : <MenuRounded />)}
            >
                <SongSearch initialSearchText={initialSearchText} onSearchTextUpdated={lodash.debounce(handleSearch, 500)}/>
            </Header>
            <Nav
            renderIcon={(collapsed: boolean)=>
            collapsed ? <ChevronRight /> : <ChevronLeft />
            }
            classes={drawerStyles}
            >
                Nav
            </Nav>
            <StickyFooter contentBody={content} footerHeight={100} footer={footerContent}/>
        </Root>
        </div>
    </ThemeProvider>
    );
}
