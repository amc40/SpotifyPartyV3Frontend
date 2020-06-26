import React from 'react';
import { PartySongInfo } from './PartySongInfo';
import { QueuedSongInfo } from '../common/interfaces';

interface Props {
    partyId: string;
    partySongs: QueuedSongInfo[];
}

function compareSongs(songA: QueuedSongInfo, songB: QueuedSongInfo) {
    if (songA.votes > songB.votes) {
        // A > B
        return 1;
    } else if (songA.votes < songB.votes) {
        // A < B
        return -1;
    } else {
        // if n votes equal then order by uri to remain consistent across all clients
        if (songA.uri > songB.uri) {
            return 1;
        } else {
            return -1;
        }
    }
}

export const PartySongs = (props: Props) => {
    const { partySongs, partyId } = props;
    return (
        <div>
            {
                // sort the songs and then map them to a song info component
                partySongs.sort(compareSongs).reverse().map((partySong) => 
                    <PartySongInfo songInfo={partySong} partyId={partyId}/>
                )
            }
        </div> 
    );
}