import * as React from 'react';

import { addTrackToParty } from '../scripts';
import { SongInfo, QueuedSongInfo } from '../common/interfaces';
import { PartyVotesContext } from '../common/partyVotesContext';
import { SongDisplay } from './SongDisplay';
import { Typography, makeStyles, createStyles, Theme, IconButton, Divider } from '@material-ui/core';
import { spotifyMinorTextGrey, spotifyLightGrey, spotifyGreen } from '../common/constants';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import CheckIcon from '@material-ui/icons/Check';

interface Props {
    songs: SongInfo[];
    partyId: string;
    partySongs: QueuedSongInfo[];
}

const topDivHeight = 26;
const bottomDivHeight = 18;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        resultsContainer: {
            overflow: 'scroll'
        },
        songContainer: {
            display: 'grid',
            gridGap: '0px 0px',
            gridTemplateColumns: '1fr 48px',
            gridTemplateRows: `${topDivHeight}px ${bottomDivHeight}px`,
            fontSize: '10',
            textOverflow: 'ellipsis',
            marginBottom: '7px'
        },
        bottomTextDiv: {
            gridColumn: '1 / span 1', 
            gridRow: '2 / span 1',
            height: bottomDivHeight,
            overflow: 'hidden'
        },
        bottomText: {
            fontSize: '0.8rem',
            textOverflow: 'ellipsis',
            color: spotifyMinorTextGrey,
            maxHeight: bottomDivHeight
        },
        topTextDiv: {
            gridColumn: '1 / span 1', 
            gridRow: '1 / span 1',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
        },
        topText: {
            fontSize: '1rem',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            maxHeight: topDivHeight
        },
        iconDiv: {
            position: 'relative',
            gridRow: '1 / span 2', 
            gridColumn: '2 / span 1'
        },
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

    const { partySongs } = props;

    const partyVotesContext = React.useContext(PartyVotesContext);

    const trackAdded = React.useCallback((track: SongInfo) => {
        // TODO: change display icon
        // upvote the song
        partyVotesContext.updateVote(props.partyId, track, 'upvote');
    }, [partyVotesContext, props.partyId]);

    function handleTrackFailedToAdd(track: SongInfo) {
        // TODO: change display icon, or display toast
    }

    const getIcon = React.useCallback((songToGetIconFor: SongInfo) => {
        const songInParty = partySongs.some((partySong) => partySong.uri === songToGetIconFor.uri);
        console.log(partySongs, ' contains ', songToGetIconFor, songInParty);
        if (songInParty) {
            return (
                <span className={classes.songPresentIconContainer}>
                    <CheckIcon className={classes.songPresentIcon}/>
                </span>
            );
        } else {
            return (
                <IconButton className={classes.addSongIcon} aria-label="add" onClick={() => {
                    addTrackToParty(songToGetIconFor, props.partyId, {
                        handleTrackAddedSuccessfully: trackAdded,
                        handleTrackFailedToAdd
                    })   
                }}>
                    <AddCircleIcon/>
                </IconButton>
            );
        }
    }, [partySongs, classes.addSongIcon, classes.songPresentIcon, props.partyId, trackAdded]);

    return (
        <div>
            {props.songs.length > 0 ? <Divider className={classes.divider}/>: undefined}
            
            {props.songs.map((song) => {
                return (
                    <>
                        <div className={classes.songContainer}>
                            <div className={classes.topText}>
                                <Typography className={classes.topText}>{song.name}</Typography>
                            </div>
                            <div className={classes.bottomText}>
                                <Typography className={classes.bottomText}>{song.artists.join(', ')}</Typography>
                            </div>
                            <div className={classes.iconDiv}>
                                {getIcon(song)}
                            </div>
                        </div>
                        <Divider className={classes.divider}/>
                    </>
                );
            })}
        </div>
    );
}