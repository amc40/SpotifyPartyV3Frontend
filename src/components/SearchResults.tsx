import * as React from 'react';

import { addTrackToParty } from '../scripts';
import { SongInfo, QueuedSongInfo } from '../common/interfaces';
import { PartyVotesContext } from '../common/partyVotesContext';
import { SongDisplayWithIcon } from './SongDisplayWithIcon';
import { makeStyles, createStyles, Theme, IconButton, Divider } from '@material-ui/core';
import { spotifyGreen, spotifyLightGrey } from '../common/constants';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { SongUpvoteButton } from './SongUpvoteButton';

interface Props {
    songs: SongInfo[];
    partyId: string;
    partySongs: QueuedSongInfo[];
}


const useStyles = makeStyles(() =>
    createStyles({
        addSongIcon: {
            position: 'absolute',
            color: spotifyGreen,
            top: 0,
            right: 0
        },
        songPresentIcon: {
            color: spotifyGreen,
        },
        songPresentIconContainer: {
            padding: 12,
            position: 'absolute',
            top: 0,
            right: 0
        },
        divider: {
            color: spotifyLightGrey
        }
    }),
);

export const SearchResults = (props: Props) => {
    const classes = useStyles();

    const { partySongs, partyId } = props;

    const partyVotesContext = React.useContext(PartyVotesContext);

    const trackAdded = React.useCallback((track: SongInfo) => {
        // TODO: change display icon
        // upvote the song
        partyVotesContext.updateVote(partyId, track, 'upvote');
    }, [partyVotesContext, partyId]);

    function handleTrackFailedToAdd() {
        // TODO: change display icon, or display toast
    }

    const getIcon = React.useCallback((songToGetIconFor: SongInfo) => {
        const songInParty = partySongs.find((partySong) => partySong.uri === songToGetIconFor.uri);
        console.log(partySongs, ' contains ', songToGetIconFor, songInParty);
        if (songInParty) {
            return <SongUpvoteButton songInfo={songInParty} partyId={partyId}/>;
        } else {
            return (
                <IconButton className={classes.addSongIcon} aria-label="add" onClick={() => {
                    addTrackToParty(songToGetIconFor, partyId, {
                        handleTrackAddedSuccessfully: trackAdded,
                        handleTrackFailedToAdd
                    })   
                }}>
                    <AddCircleIcon/>
                </IconButton>
            );
        }
    }, [partySongs, classes.addSongIcon, trackAdded, partyId]);

    return (
        <div>
            {props.songs.length > 0 ? <Divider className={classes.divider}/>: undefined}
            
            {props.songs.map((song) => {
                return (
                    <>
                        <SongDisplayWithIcon song={song} getIcon={getIcon}/>
                        <Divider className={classes.divider}/>
                    </>
                );
            })}
        </div>
    );
}