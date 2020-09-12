import React from 'react';
import { PartyVotesContextProps, SongInfo, PartyVotes } from './interfaces';

export const createDefaultPartyVotesContext = (): PartyVotesContextProps => {
    return {
        parties: [],
        updateVote: (partyId: string, song: SongInfo, voteType: 'upvote' | 'downvote') => {
            console.warn('Attempted to update votes, but there was no provider.'); 
        },
        hasUserUpvotedSong: (partyId: string, song: SongInfo) => {
            return false;
        }
    };
}

export const PartyVotesContext = React.createContext(createDefaultPartyVotesContext());

export const PartyVotesProvider: React.StatelessComponent = props => {
    const [partyVotes, setPartyVotes] = React.useState([] as PartyVotes[]);
  
    return (
      <PartyVotesContext.Provider value={
            { 
                parties: partyVotes, 
                updateVote: (partyId: string, song: SongInfo, voteType: 'upvote' | 'downvote') => {
                    const partyIndex = partyVotes.findIndex(partyVotes => partyVotes.partyId === partyId);
                    if (partyIndex === -1) {
                        // the party isn't already present, add it if we are upvoting
                        if (voteType === 'upvote') {
                            const updatedPartyVotes = partyVotes.slice();
                            const newPartyVote: PartyVotes = {
                                partyId,
                                upvotedSongs: [song]
                            }
                            updatedPartyVotes.push(newPartyVote);
                            setPartyVotes(updatedPartyVotes);
                        }
                    } else {
                        // party is already present
                        if (voteType === 'upvote') {
                            // if upvoting add if not already present
                            const upvotedPartySongs = [...partyVotes[partyIndex].upvotedSongs];
                            const alreadyPresent = upvotedPartySongs.some(upvotedTrack => upvotedTrack.uri === song.uri);
                            if (!alreadyPresent) {
                                upvotedPartySongs.push(song);
                                const updatedPartyVotes = partyVotes.slice();
                                updatedPartyVotes[partyIndex] = {
                                    partyId: partyId,
                                    upvotedSongs: upvotedPartySongs
                                };
                                setPartyVotes(updatedPartyVotes);
                            }
                        } else {
                            const originalPartyVotes = partyVotes[partyIndex].upvotedSongs;
                            // if downvoting remove if present
                            const songIndex = originalPartyVotes.findIndex(upvoteTrack => upvoteTrack.uri === song.uri);
                            if (songIndex !== -1) {
                                console.log('Song is present at index', songIndex, ', removing.');
                                // if present remove
                                const updatedUpvotes = originalPartyVotes.slice();
                                updatedUpvotes.splice(songIndex, 1);
                                console.log('updated upvotes:', updatedUpvotes, ', original: ', originalPartyVotes);
                                const updatedPartyVotes = partyVotes.slice();
                                updatedPartyVotes[partyIndex] = {
                                    partyId: partyId,
                                    upvotedSongs: updatedUpvotes
                                };
                                setPartyVotes(updatedPartyVotes);
                            }
                        }
                    }
                },
                hasUserUpvotedSong: function (partyId: string, song: SongInfo) {
                    const partyVotes = this.parties.find(partyVotes => partyVotes.partyId === partyId);
                    if (!partyVotes) {
                        console.log(`There is no party with the id ${partyId} in partyVotes context.
                        Therefore there are no liked songs for that party.`);
                        // there are no upvoted songs for the party
                        return false;
                    } else {
                        const val = partyVotes.upvotedSongs
                        .some(songVote => songVote.uri === song.uri);
                        console.log('party votes:', partyVotes, '. Checking if there is a uri:', song.uri, val);
                        return val;
                    }
                }
            }
         }>
        {props.children}
      </PartyVotesContext.Provider>
    );
  };