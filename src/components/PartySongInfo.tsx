import React from 'react';
import { QueuedSongInfo } from '../common/interfaces';
import FormContolLabel from '@material-ui/core/FormControlLabel'
import Favorite from '@material-ui/icons/Favorite';
import FavoriteBorder from '@material-ui/icons/FavoriteBorder';
import Checkbox from '@material-ui/core/Checkbox';
import { upvoteTrack, VoteTrackCallbacks, downvoteTrack } from '../scripts';
import { PartyVotesContext } from '../common/partyVotesContext';

interface Props {
    songInfo: QueuedSongInfo;
    partyId: string;
}

export const PartySongInfo = (props: Props) => {
    const { name, votes, uri } = props.songInfo as QueuedSongInfo;
    const { partyId } = props;

    const partyVotesContext = React.useContext(PartyVotesContext);

    const partyVotes = partyVotesContext.parties.find(partyVotes => partyVotes.partyId === partyId);

    const initiallyLiked = React.useCallback(() => {
        if (!partyVotes) {
            console.log(`There is no party with the id ${partyId} in partyVotes context.
            Therefore there are no liked songs for that party.`);
            // there are no upvoted songs for the party
            return false;
        } else {
            const val = partyVotes.upvotedSongs
            .some(songVote => songVote.uri === uri);
            console.log('party votes:', partyVotes, '. Checking if there is a uri:', uri, val);
            return val;
        }
    }, [partyId, partyVotes, uri]);

    const [liked, setLiked] = React.useState(initiallyLiked());

    React.useEffect(() => {
        setLiked(initiallyLiked)
    }, [partyVotes, initiallyLiked]);

    function handleFailedUpvote() {
        // TODO: display toast
        setLiked(false);
    }

    function handleFailedDownvote() {
        // TODO: display toast
        setLiked(true);
    }

    function handleSuccessfulUpvote() {
        console.log('Successfully registered upvote');
        partyVotesContext.updateVote(partyId, props.songInfo, 'upvote');
    }

    function handleSuccessfulDownvote() {
        console.log('Successfully registered downvote');
        partyVotesContext.updateVote(partyId, props.songInfo, 'downvote');
    }

    return (
        <div key={uri}>
            <span>{name}</span>
            <span>
                <FormContolLabel
                    control={
                        <Checkbox 
                            checked={liked}
                            icon={<FavoriteBorder/>} 
                            checkedIcon={<Favorite/>} 
                            name={`like_song_${uri}`} 
                            onChange={(event) => {
                                const newLiked = event.target.checked;
                                setLiked(newLiked);
                                if (newLiked) {
                                    // upvote 
                                    const callbacks: VoteTrackCallbacks = {
                                        handleSuccessfulVote: handleSuccessfulUpvote,
                                        handleFailedVote: handleFailedUpvote
                                    }
                                    upvoteTrack(
                                        uri, 
                                        partyId, 
                                        callbacks
                                    );
                                } else {
                                    // downvote
                                    const callbacks: VoteTrackCallbacks = {
                                        handleSuccessfulVote: handleSuccessfulDownvote,
                                        handleFailedVote: handleFailedDownvote
                                    }
                                    downvoteTrack(
                                        uri,
                                        partyId,
                                        callbacks
                                    );
                                }
                            }}
                            />
                    }
                    label={votes}
                    labelPlacement="start"
                />   
            </span>
        </div>
    );
}