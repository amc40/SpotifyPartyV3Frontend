import * as React from 'react';

import  {SongInfo} from './index';
import { addTrackToParty } from '../scripts';

interface Props {
    songs: SongInfo[],
    partyId: string;
}

export const SearchResults = (props: Props) => {

    function trackAdded(track: SongInfo) {
        // TODO: change display icon
    }

    function handleTrackFailedToAdd(track: SongInfo) {
        // TODO: change display icon, or display toast
    }

    return (
        <div>
            {props.songs.map((song) => {
                return (
                <div>
                    <div>{song.name}</div>
                    <button onClick={ () => {
                        addTrackToParty(song, props.partyId, {
                            handleTrackAddedSuccessfully: trackAdded,
                            handleTrackFailedToAdd
                        })   
                    }}> 
                        add
                    </button>
                </div>
                );
            })}
        </div>
    );
}