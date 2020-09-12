import React from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { Dialog } from '@material-ui/core';
import { GetDevicesDialogBody } from './GetDevicesDialogBody';
import { Loading } from './Loading';
import { SongInfo, Device } from '../common/interfaces';
import { AddingSongs } from './AddingSongs';
import { queueTrack, removeTrackFromParty } from '../scripts';
import { silentTrackUri } from '../common/constants';

interface Props {
    spotify: SpotifyWebApi.SpotifyWebApiJs;
    open: boolean;
    handleClose: () => void;
    topSong: SongInfo;
    secondTopSong: SongInfo;
    partyId: string;
    setFirstSong: (firstSong: SongInfo) => void;
    setNextQueuedSong: (nextQueuedSong: SongInfo) => void;
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
            await spotify.play({
                device_id: device.id,
                uris: [silentTrackUri]
            });
            setStartPartyState('adding_songs');
            const songsToQueue = [topSong, secondTopSong]
            await queueSongs(spotify, songsToQueue, device);
            setStartPartyState('clearing_queue');
            await clearCurrentPlayback(device, spotify, topSong);
            setFirstSong(topSong);
            setNextQueuedSong(secondTopSong);
            setStartPartyState('updating_server');
            await removeQueuedTracks(partyId, songsToQueue);
            setPartyStarted();
            handleClose();
        } catch (e) {
            console.error('Failed to queue');
            console.error(e);
            setStartPartyState('select_device')
        }
    }, [partyId, handleClose, spotify, topSong, secondTopSong]);

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