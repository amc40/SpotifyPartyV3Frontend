import React from "react";
import { Redirect } from 'react-router-dom'
import { ThemeProvider, CSSProperties } from "@material-ui/styles";
import { createMuiTheme, Button } from "@material-ui/core";
import { ChevronLeft, MenuRounded, ChevronRight } from "@material-ui/icons";
import { Root, Header, Nav } from "mui-layout";
import { makeStyles } from '@material-ui/styles';
import SpotifyWebApi from 'spotify-web-api-js';
import lodash from "lodash";

import "../styles.css";
import { spotifyAccessTokenCookie, spotifyAccessTokenRefreshTimeCookie, spotifyRefreshTokenCookie, spotifyWhite, spotifyDark } from '../common/constants';
import { getCookie, refreshAccessToken, secondsBeforeActuallyRefreshAccessToken, getNewPartyId, getQueuedTracksForParty } from '../scripts';
import { StickyFooter, SongSearch, SearchResults } from "./";
// TODO: move to more appropriate location
import mui_config from '../mui_config';
import { SongInfo, QueuedSongInfo, Device, compareSongs } from "../common/interfaces";
import { PartySongs } from "./PartySongs";
import { PartyVotesProvider } from "../common/partyVotesContext";
import { StartPartyDialog } from "./StartPartyDialog";
import { buttonTheme } from "../common/themes";
import { PartyPageFooter } from "./PartyPageFooter";

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
      const res = await spotify.searchTracks(searchText, {limit: 15});
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

const useStyles = makeStyles({
    paper: {
        backgroundColor: '#030303',
        color: 'white',
        border: 'none',
    },

});

const useButtonStyles = makeStyles(() => {
    return {
        button: {
            fontSize: 16,
            height: 50,
        }
    };
});

export function PartyPage() {
    // if set to true will navigate the user to the homepage
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
        setTimeout(refreshAccessToken, secondsBeforeActuallyRefreshAccessToken(refreshSeconds) * 1000, refreshToken, {
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
        // get the access token, refresh token and refresh time from the cookies stored in the auth stage
        const accessToken = getCookie(spotifyAccessTokenCookie);
        const refreshTime = getCookie(spotifyAccessTokenRefreshTimeCookie);
        const refreshToken = getCookie(spotifyRefreshTokenCookie);
        console.log(`accessToken: ${accessToken}, refreshTime: ${refreshTime}, refreshToken: ${refreshToken}`);
        if (accessToken !== undefined && refreshTime !== undefined && refreshToken !== undefined) {
            // if all are set then set the access token
            console.log('got access token, refresh time, and refresh token');
            spotify.setAccessToken(accessToken);
            const currentTime = new Date().getTime();
            const msToRefresh = parseInt(refreshTime) - currentTime;
            // if the time to refresh is in the future then set up a task to refresh the access token then
            if (msToRefresh > 0) {
                setTimeout(refreshAccessToken, msToRefresh, refreshToken, {
                    handleRefreshedToken,
                    handleFailedTokenRefresh
                });
            } else {
                // if token has already expired then refresh it now.
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
    // the party id of the party the user is viewing
    const [partyId, setPartyId] = React.useState(undefined as undefined | string);
    // TODO: move into when we create a party.
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

    
    const drawerStyles =  useStyles();

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

    const [selectDeviceDialogOpen, setSelectDeviceDialogOpen] = React.useState(false);

    function handleSelectDeviceDialogClose() {
        setSelectDeviceDialogOpen(false);
    }

    // TODO: check spotify has auth token
    const sortedTopSongs = partySongs.sort(compareSongs).reverse().slice();
    const dialog = partyId ? <StartPartyDialog spotify={spotify} open={selectDeviceDialogOpen} handleClose={handleSelectDeviceDialogClose} topSong={sortedTopSongs[0]} secondTopSong={sortedTopSongs[1]} partyId={partyId}/> : undefined;

    function getMainScreenContent() {
        if (!partyId) {
            // party has not yet been initialised
            return undefined;
        }
        if (searching) {
            // if we are searching display the search results
            return (
            <>
                <SearchResults songs={searchTracks} partyId={partyId} partySongs={partySongs}/>
                {dialog}
            </>);
        } else {
            // otherwise we just view the songs in the party
            return (
            <>
                <PartySongs partyId={partyId} partySongs={partySongs}/>
                {dialog}
            </>);
        }
    }

    const mainScreenContent = getMainScreenContent();

    function handleSearchCancelled() {
        setSearching(false);
    }

    const headerContent = (
        <>
            <SongSearch 
                        placeholder={'Add Song'} 
                        onSearchTextUpdated={lodash.debounce(handleSearch, 500)}
                        onStartSearch={handleStartSearch}
                        handleCancel={handleSearchCancelled}/>
        </>
    );

    //TODO: get initial state from server
    const [partyStarted, setPartyStarted] = React.useState(false);

    const footerContent = <PartyPageFooter partyStarted={partyStarted} partySongs={partySongs} onStartParty={() => {setSelectDeviceDialogOpen(true);}} />;


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
