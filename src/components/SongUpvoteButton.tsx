import React from "react";
import { Checkbox } from "@material-ui/core";
import { FavoriteBorder, Favorite } from "@material-ui/icons";
import { upvoteTrack, downvoteTrack, VoteTrackCallbacks } from "../scripts";
import FormContolLabel from '@material-ui/core/FormControlLabel'
import { PartyVotesContext } from "../common/partyVotesContext";
import { QueuedSongInfo } from "../common/interfaces";

// component to display a song upvote button, will 
// register upvotes with the back-end on press

interface Props {
    // the song which is being upvoted or downvoted
    songInfo: QueuedSongInfo;
    // the id of the party
    partyId: string;
}

export const SongUpvoteButton = (props: Props) => {
    const { votes, uri } = props.songInfo as QueuedSongInfo;
    const { partyId, songInfo } = props;

    const partyVotesContext = React.useContext(PartyVotesContext);

    const initiallyLiked = React.useCallback(() => {
        return partyVotesContext.hasUserUpvotedSong(partyId, songInfo);
    }, [partyId, songInfo, partyVotesContext]);

    const [liked, setLiked] = React.useState(initiallyLiked());

    React.useEffect(() => {
        setLiked(initiallyLiked)
    }, [initiallyLiked]);

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
        <FormContolLabel
                    style={{float: 'right'}}    
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
    );
}