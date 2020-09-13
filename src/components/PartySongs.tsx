import React from 'react';
import { PartySongInfo } from './PartySongInfo';
import { QueuedSongInfo, compareSongs } from '../common/interfaces';

// displays all the party songs.

interface Props {
    partyId: string;
    partySongs: QueuedSongInfo[];
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