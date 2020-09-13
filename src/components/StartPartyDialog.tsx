import React from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { Dialog } from '@material-ui/core';
import { GetDevicesDialogBody } from './GetDevicesDialogBody';
import { Loading } from './Loading';
import { SongInfo, Device } from '../common/interfaces';
import { AddingSongs } from './AddingSongs';
import { queueTrack, removeTrackFromParty } from '../scripts';
import { silentTrackUri } from '../common/constants';

// component which displays a start party dialog which will ask the user to select a device
// then clear anything remaining on their playback queue until we get to the desired song.


interface Props {
    // the spotify instance for the host, properly authenticated
    spotify: SpotifyWebApi.SpotifyWebApiJs;
    // whether the dialog is open
    open: boolean;
    // when the dialog is queued
    handleClose: () => void;
    // most upvoted song
    topSong: SongInfo;
    // second most upvoted song
    secondTopSong: SongInfo;
    // the partyid of the party
    partyId: string;
    // a function which allows us to set the first song in the parent
    setFirstSong: (firstSong: SongInfo) => void;
    // a function which allows us to set the song queued after the first in the parent
    setNextQueuedSong: (nextQueuedSong: SongInfo) => void;
    // indicates that the party has been started.
    setPartyStarted: () => void;
}

async function queueSongs(spotify: SpotifyWebApi.SpotifyWebApiJs, songs: ReadonlyArray<SongInfo>, device: Device) {
    for (let i = 0; i < songs.length; i++) {
        const track = songs[i];
        await queueTrack(track.uri, spotify.getAccessToken() as string, device.id);
    }
}

interface SongUri {
    uri: string;
}

// ckears what is on our current playback, up until the first song
async function clearCurrentPlayback(device: Device, spotify: SpotifyWebApi.SpotifyWebApiJs, firstSong: SongInfo) {
    let currentSong;
    do {
        await spotify.skipToNext();
        const currentSongPromise = new Promise<SongUri | null> ( (resolve, reject) => {
            setTimeout(async () => {
                const currentSong = (await spotify.getMyCurrentPlayingTrack()).item;
                resolve(currentSong);
            }, 500);
        });
        currentSong = await currentSongPromise;
        console.log('Current song:', currentSong, 'First uri:', firstSong.uri);
    } while (currentSong && currentSong.uri !== firstSong.uri);
    // TODO: handle no current song.
    console.log('Found current song.');
}

// removes all the queued tracks from the party so they won't be queued multiple times.
async function removeQueuedTracks(partyId: string, songs: SongInfo[]) {
    for (const songToRemove of songs) {
        await removeTrackFromParty(songToRemove.uri, partyId);
    }
}

export const StartPartyDialog = (props: Props) => {
    const { spotify, open, handleClose, topSong, secondTopSong, partyId, setFirstSong, setNextQueuedSong, setPartyStarted } = props;

    const initialPartyState = React.useCallback(() => {
        return open ? 'select_device' : undefined;
    }, [open]);

    const [startPartyState, setStartPartyState] = React.useState(initialPartyState()  as 'select_device' | 'adding_songs' | 'clearing_queue' | 'updating_server' | undefined);

    React.useEffect(() => {
        setStartPartyState(initialPartyState);
    }, [open, initialPartyState])

    let body: JSX.Element | undefined;

    const handleDeviceSelected = React.useCallback(async (device: Device) => {
        setStartPartyState('clearing_queue');
        try {
            // starts playback on the specified device
            await spotify.play({
                device_id: device.id,
                uris: [silentTrackUri]
            });
            // add the top and second top songs
            setStartPartyState('adding_songs');
            const songsToQueue = [topSong, secondTopSong]
            await queueSongs(spotify, songsToQueue, device);
            setStartPartyState('clearing_queue');
            // clears the current playback queue up until the first queued song
            // TODO: does not take into account if already have that song in queue
            await clearCurrentPlayback(device, spotify, topSong);
            setFirstSong(topSong);
            setNextQueuedSong(secondTopSong);
            setStartPartyState('updating_server');
            // remove the songs we have added from the party
            await removeQueuedTracks(partyId, songsToQueue);
            setPartyStarted();
            handleClose();
        } catch (e) {
            console.error('Failed to queue');
            console.error(e);
            setStartPartyState('select_device')
        }
    }, [partyId, handleClose, spotify, topSong, secondTopSong, setFirstSong, setNextQueuedSong, setPartyStarted]);

    switch (startPartyState) {
        case 'select_device':
            body = <GetDevicesDialogBody 
                        spotify={spotify} 
                        open={startPartyState === 'select_device'} 
                        handleClose={handleClose}
                        handleDeviceSelected={handleDeviceSelected}/>;
            break;

        case 'clearing_queue':
            body = <Loading text={'Clearing the Playback Queue ...'}/>
            break;
        case 'adding_songs':
            body = <AddingSongs/>;
            break;
        case 'updating_server':
            body = <Loading text={'Syncing with Server ...'}/>;
            break;
        default:
            body = undefined;
            break;
    }

    function doNotClose() {
        // do nothing
    }

    return (
        <Dialog onClose={startPartyState === 'select_device' ? handleClose : doNotClose} open={open}>
            {body}
        </Dialog>   
    );
}