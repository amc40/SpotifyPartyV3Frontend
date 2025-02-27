import { expressWSAddr } from "../../common/constants";
import { SongInfo, QueuedSongInfo } from "../../common/interfaces";

interface AddTrackToPartyCallbacks {
    handleTrackAddedSuccessfully(track: SongInfo) : void;
    handleTrackFailedToAdd(track: SongInfo): void;
}

interface AddTrackPayload {
    uri: string,
    trackName: string;
    albumName: string;
    artistNames: string[],
}

// adds a track to the given party, callbacks are called on success or failure, as appropriate
export async function addTrackToParty(songInfo: SongInfo, partyId: string, callbacks: AddTrackToPartyCallbacks) {
    try {
        const addTrackResponse = await fetch(`${expressWSAddr}/api/party_tracks/${partyId}`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uri: songInfo.uri,
                trackName: songInfo.name,
                albumName: songInfo.album,
                artistNames: songInfo.artists
            } as AddTrackPayload)
          });
          if (!addTrackResponse.ok) {
              throw new Error("Response code was not ok: " + addTrackResponse.status);
          }
          callbacks.handleTrackAddedSuccessfully(songInfo);
    } catch (e) {
        console.log(e);
        callbacks.handleTrackFailedToAdd(songInfo);
    }
}

interface GetQueuedTracksForPartyCallbacks {
    handleSuccessfulGetQueuedTracks(queuedTracks: QueuedSongInfo[]): void;
    handleFailedGetQueuedTracks(): void;
}

interface Track {
    uri: string;
    trackName: string;
    albumName: string;
    artistNames: string[];
    votes: Number;
}

// gets all the queued tracks for the given party, callbacks are called on success or failure, as appropriate
export async function getQueuedTracksForParty(partyId: string, callbacks: GetQueuedTracksForPartyCallbacks) {
    console.log('getting queued tracks');
    try {
        const getTracksResponse = await fetch(`${expressWSAddr}/api/party_tracks/${partyId}`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          if (!getTracksResponse.ok) {
              throw new Error("Response code was not ok: " + getTracksResponse.status);
          }
          const getTracksResponseContent = await getTracksResponse.json();
          const { queuedTracks } = getTracksResponseContent;
          const formattedQueuedTracks: QueuedSongInfo[] = queuedTracks.map((queuedTrack: Track) =>{
              console.log('Unformatted Track:', queuedTrack);
              return {
                name: queuedTrack.trackName,
                album: queuedTrack.albumName,
                uri: queuedTrack.uri,
                artists: queuedTrack.artistNames,
                votes: queuedTrack.votes
              };
        });
        console.log('got queued tracks:',formattedQueuedTracks);
        callbacks.handleSuccessfulGetQueuedTracks(formattedQueuedTracks);
    } catch (e) {
        console.log(e);
        callbacks.handleFailedGetQueuedTracks(); 
    }  
}

export interface VoteTrackCallbacks {
    handleSuccessfulVote() : void;
    handleFailedVote(): void;
}

// registers a vote of the specified type, for the song with the given uri in the party with the specified id,
// on completion calls the success or failure callback, as appropriate
async function vote(voteType : 'upvote' | 'downvote', uri: string, partyId: string, callbacks: VoteTrackCallbacks) {
    try {
        const upvoteTrackResponse = await fetch(`${expressWSAddr}/api/party_tracks/${voteType}/${partyId}`, {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uri: uri
            })
          });
          if (!upvoteTrackResponse.ok) {
              throw new Error("Response code was not ok: " + upvoteTrackResponse.status);
          }
          callbacks.handleSuccessfulVote();
    } catch (e) {
        console.log(e);
        callbacks.handleFailedVote();
    }
}
// a wrapper for vote with voteType as 'downvote'
export async function downvoteTrack(uri: string, partyId: string, callbacks: VoteTrackCallbacks) {
    vote('downvote', uri, partyId, callbacks);
}

// a wrapper for vote with voteType as 'upvote'
export async function upvoteTrack(uri: string, partyId: string, callbacks: VoteTrackCallbacks) {
    vote('upvote', uri, partyId, callbacks);
}
// queues the specified track on the host's playback
export async function queueTrack(uri: string, accessToken: string, deviceId?: string) {
    console.log(`Queuing track ${uri}`);
    let queueSongUrl = `https://api.spotify.com/v1/me/player/queue?uri=${uri}`
    if (deviceId) {
        queueSongUrl += `&device_id=${deviceId}`
    }
    const queueTrackResponse = await fetch(queueSongUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
    console.log('Queue track response:', queueTrackResponse);
    if (!queueTrackResponse.ok) {
        throw new Error("Response code was not ok: " + queueTrackResponse.status);
    }
}
// removes the track with the specified uri from the list of tracks in the party (those that the user can vote on).
export async function removeTrackFromParty(uri: string, partyId: string) {
    const removeTrackResponse = await fetch(`${expressWSAddr}/api/party_tracks/${partyId}/${uri}`, {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    if (!removeTrackResponse.ok) {
        throw new Error("Response code was not ok: " + removeTrackResponse.status);
    }
} 