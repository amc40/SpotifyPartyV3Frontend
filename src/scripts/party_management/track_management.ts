import { expressWSAddr } from "../../constants";
import { SongInfo } from "../../components";

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

export async function addTrackToParty(songInfo: SongInfo, partyId: string, callbacks: AddTrackToPartyCallbacks) {
    try {
        const addTrackResponse = await fetch(`${expressWSAddr}/api/party_playback/${partyId}`, {
            method: 'PUT',
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
    } catch (e) {
        console.log(e);
        callbacks.handleTrackFailedToAdd(songInfo);
    }
}