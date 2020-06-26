import React from "react";
import { Redirect } from 'react-router-dom'
import { ThemeProvider, CSSProperties } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import { ChevronLeft, MenuRounded, ChevronRight } from "@material-ui/icons";
import { Root, Header, Nav } from "mui-layout";
import { makeStyles } from '@material-ui/styles';
import SpotifyWebApi from 'spotify-web-api-js';
import lodash from "lodash";

import "../styles.css";
import { spotifyAccessTokenCookie, spotifyAccessTokenRefreshTimeCookie, spotifyRefreshTokenCookie } from '../common/constants';
import { getCookie, refreshAccessToken, secondsBeforeActuallyRefreshAccessToken, getNewPartyId, getQueuedTracksForParty } from '../scripts';
import { StickyFooter, SongSearch, SearchResults } from "./";
// TODO: move to more appropriate location
import mui_config from '../mui_config';
import { SongInfo, QueuedSongInfo } from "../common/interfaces";
import { PartySongs } from "./PartySongs";
import { PartyVotesProvider } from "../common/partyVotesContext";

const partySongRefreshMs = 500;


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

    React.useEffect(() => {
        getNewPartyId().then((newPartyId) => {
            if (newPartyId) {
                setPartyId(newPartyId);
                console.log('got new party id:', newPartyId);
            } else {
                handleCouldNotSetPartyId();
            }
        })
    }, []);

    const useDrawerStyles = makeStyles({
        paper: {
        backgroundColor: '#030303',
        color: 'white',
        border: 'none',
        },
    });


    const drawerStyles =  useDrawerStyles();

    const initialSearchText = 'Search...';

    const [searching, setSearching] = React.useState(false);

    function handleStartSearch() {
        setSearching(true);
    }

    const [searchTracks, setSearchTracks] = React.useState([] as SongInfo[]);

    function handleSearch(newSearchText: string) {
        console.log(`New Search Text: ${newSearchText}`);
        updateSongs(newSearchText).then(newSongs => {
            console.log("calling result for", newSearchText);
            setSearchTracks(newSongs);
        });
    }


    const [ partySongs, setPartySongs ] = React.useState([] as QueuedSongInfo[]);
    
    const handleFailedTrackRefresh = () => {
        console.log('Could not refresh tracks.');
        // TODO: display toast after repeated failure
    }

    const handleNewTracks = (newTracks: QueuedSongInfo[]) => {
        setPartySongs(newTracks);
    }

    React.useEffect(() => {
        if (partyId) {
            console.log('setting up refresh of tracks.');
            const refreshQueuedTracks = setInterval(() => {
                const callbacks = {
                    handleSuccessfulGetQueuedTracks: handleNewTracks,
                    handleFailedGetQueuedTracks: handleFailedTrackRefresh
                };
                getQueuedTracksForParty(
                    partyId,
                    callbacks
                )
            }, partySongRefreshMs);
            // removes after component is unmounted.
            return () => {
                clearInterval(refreshQueuedTracks);
                console.log('clearing refresh of tracks on unmount');
            };
        }
    }, [partyId]);

    function getMainScreenContent() {
        if (!partyId) {
            // party has not yet been initialised
            return undefined;
        }
        if (searching) {
            // if we are searching display the search results
            return <SearchResults songs={searchTracks} partyId={partyId}/>;
        } else {
            // otherwise we just view the songs in the party
            return <PartySongs partyId={partyId} partySongs={partySongs}/>;
        }
    }

    const mainScreenContent = getMainScreenContent();

    function handleSearchCancelled() {
        setSearching(false);
    }

    const cancelSearchButton = searching ? 
        <button onClick={handleSearchCancelled}>
            Cancel
        </button>
        : undefined;

    const headerContent = (
        <>
            <SongSearch 
                        initialSearchText={initialSearchText} 
                        onSearchTextUpdated={lodash.debounce(handleSearch, 500)}
                        onStartSearch={handleStartSearch}/>
            {cancelSearchButton}
        </>
    );

    //TODO: get initial state from server
    const [partyStarted, setPartyStarted] = React.useState(false);

    const readyToStartParty = React.useCallback(() => {
        return partySongs.length >= 2;
    }, [partySongs])

    const getFooterContent = React.useCallback(() => {
        if (partyStarted) {
            //TODO: fill with currently playing and next up
            return <h2>TODO: fill with currently playing and next up</h2>;
        } else {
            // TODO: hosting as state.
            const centredStyle: CSSProperties = {
                display: 'flex',
                justifyContent: 'center'
            };
            const hosting = true;
            if (hosting) {
                if (readyToStartParty()) {
                    return (
                        <div style={centredStyle}>
                            <button>Start Party</button>
                        </div>
                    );
                } else {
                    return (
                        <div style={centredStyle}>
                            You must add at least 2 songs to start the party!
                        </div>
                    );
                }
            } else {
                return (
                    <div style={centredStyle}>
                        Waiting for Host to Start ...
                    </div>
                );
            }
        }
    }, [partyStarted, readyToStartParty]);

    const footerContent = getFooterContent();

    return (
    <PartyVotesProvider>
        <ThemeProvider theme={theme}>
            {renderRedirectToHomepage()}
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Root config={mui_config}>
                <Header
                renderMenuIcon={(open: boolean) => (open ? <ChevronLeft /> : <MenuRounded />)}
                >
                {headerContent}  
                </Header>
                <Nav
                renderIcon={(collapsed: boolean)=>
                collapsed ? <ChevronRight /> : <ChevronLeft />
                }
                classes={drawerStyles}
                >
                    Nav
                </Nav>
                <StickyFooter contentBody={mainScreenContent} footerHeight={100} footer={footerContent}/>
            </Root>
            </div>
        </ThemeProvider>
    </PartyVotesProvider>
    
    );
}
