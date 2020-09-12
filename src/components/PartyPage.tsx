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
import { getCookie, refreshAccessToken, secondsBeforeActuallyRefreshAccessToken, getNewPartyId, getQueuedTracksForParty, queueTrack, removeTrackFromParty } from '../scripts';
import { StickyFooter, SongSearch, SearchResults } from "./";
// TODO: move to more appropriate location
import mui_config from '../mui_config';
import { SongInfo, QueuedSongInfo, compareSongs } from "../common/interfaces";
import { PartySongs } from "./PartySongs";
import { PartyVotesProvider } from "../common/partyVotesContext";
import { StartPartyDialog } from "./StartPartyDialog";
import { PartyPageFooter } from "./PartyPageFooter";
import { createCustomScrollbars } from "../common/styles";

const partySongRefreshMs = 500;
const currentPlayingTrackRefreshMs = 100;


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


export function PartyPage() {
    // if set to true will navigate the user to the homepage
    const [navigateToHomepage, setNavigateToHomepage] = React.useState(false);

    const renderRedirectToHomepage = () => {
        if (navigateToHomepage) {
            return <Redirect to='/' />;
        }
    }

    //TODO: get initial state from server
    const [partyStarted, setPartyStarted] = React.useState(false);

    // represents whether SpotifyParty is currently dictating the playback.
    // TODO: have resync dialog when desynchronised
    const [playbackSynchronised, setPlaybackSynchronised] = React.useState(true);


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

    // currentTrack contains the currently playing track, undefined if none is currently playing
    const [currentTrack, setCurrentTrack] = React.useState(undefined as undefined | SongInfo);

    // expected next track is used to keep track what the next song we expect to be playing if the queuing has worked correctly.
    // if it hasn't it could be due to loss of connection with the backend or the user manually changing the playback.
    // if this happens we give the user the option to 'resync'
    const [expectedNextTrack, setExpectedNextTrack] = React.useState(undefined as undefined | SongInfo)

    
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

    
    const queueMostPopularTrack =  React.useCallback(async () => {
        if (partyId) {
            const sortedTopSongs = partySongs.sort(compareSongs).reverse().slice();
            const mostPopularSong = sortedTopSongs[0];
            console.log(`Sorted songs:`);
            console.log(partySongs);
            console.log(`Queueing the most popular song: ${mostPopularSong.name}`);
            await queueTrack(mostPopularSong.uri, spotify.getAccessToken() as string);
            setExpectedNextTrack(mostPopularSong);
            await removeTrackFromParty(mostPopularSong.uri, partyId);
        }
        
    }, [partySongs]);

    React.useEffect(() => {
        if (expectedNextTrack === undefined && partySongs.length > 0) {
            // if there is no current next track, and the party songs now contain a song then queue that song.
            console.log(`Added ${partySongs[0].name} when there were no songs in the queue, queuing it.`)
            queueMostPopularTrack();
        }
    }, [partySongs, expectedNextTrack, queueMostPopularTrack]);

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
    const dialog = partyId ? 
        <StartPartyDialog spotify={spotify} 
            open={selectDeviceDialogOpen}
            handleClose={handleSelectDeviceDialogClose}
            topSong={sortedTopSongs[0]}
            secondTopSong={sortedTopSongs[1]}
            partyId={partyId}
            setFirstSong={setCurrentTrack}
            setNextQueuedSong={setExpectedNextTrack}
            setPartyStarted={() => setPartyStarted(true)}
            /> : undefined;

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

    

    React.useEffect(() => {
        if (partyId && partyStarted && currentTrack) {
            const refreshCurrentTrack = setInterval(async () => {
                console.log('refreshing current playing track.');
                try {
                    const currentTrackRes = await spotify.getMyCurrentPlayingTrack();
                    if (currentTrackRes.is_playing) {
                        if (currentTrackRes.item?.uri !== currentTrack.uri ) {
                            console.log('different track is playing.');
                            // different track is playing
                            if (expectedNextTrack) {
                                console.log('there is a queued track.');
                                // there is a queued track
                                if (currentTrackRes.item?.uri === expectedNextTrack?.uri) {
                                    console.log(`the playing track is the one expected: ${expectedNextTrack.name}, updating the .`);
                                    // the song playing is the one we expected
                                    setCurrentTrack(expectedNextTrack);
                                    // update the queue
                                    if (partySongs.length > 0) {
                                        // if there are songs in the party, queue the most popular one
                                        queueMostPopularTrack();
                                    } else {
                                        setExpectedNextTrack(undefined);
                                    }
                                } else {
                                    console.log('the playing track is NOT the one expected.');
                                    // the song playing is not the next one queued, dysynced.
                                    setPlaybackSynchronised(false);
                                }
                            } else {
                                console.log('there is NOT a queued track.');
                                // there was not another song added to the party, will be playing from recommended songs - desynced
                                setPlaybackSynchronised(false);
                            }
                            
                        }
                    }
                } catch (e) {
                    console.error(e);
                }
                
            }, partySongRefreshMs);
            // removes after component is unmounted.
            return () => {
                clearInterval(refreshCurrentTrack);
                console.log('clearing refresh of current track on unmount');
            };
        }
    }, [partyId, partyStarted, currentTrack, expectedNextTrack, partySongs.length, queueMostPopularTrack]);

    const footerContent = <PartyPageFooter partyStarted={partyStarted} partySongs={partySongs} onStartParty={() => {setSelectDeviceDialogOpen(true);}} currentTrack={currentTrack} />;


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
