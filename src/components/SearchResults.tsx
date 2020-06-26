import * as React from 'react';

import { addTrackToParty } from '../scripts';
import { SongInfo } from '../common/interfaces';
import { PartyVotesContext } from '../common/partyVotesContext';

interface Props {
    songs: SongInfo[],
    partyId: string;
}

export const SearchResults = (props: Props) => {
    const partyVotesContext = React.useContext(PartyVotesContext);
    function trackAdded(track: SongInfo) {
        // TODO: change display icon
        // upvote the song
        partyVotesContext.updateVote(props.partyId, track, 'upvote');
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