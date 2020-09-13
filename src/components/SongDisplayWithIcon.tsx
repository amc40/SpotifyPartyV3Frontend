import React from 'react';
import { SongInfo } from '../common/interfaces';
import { Typography, makeStyles, createStyles } from '@material-ui/core';
import { spotifyMinorTextGrey } from '../common/constants';

// displays the song information on the left, with a given icon on the right
// will fill parent div.

interface Props {
    song: SongInfo;
    getIcon: (song: SongInfo) => JSX.Element | undefined;
}

const topDivHeight = 26;
const bottomDivHeight = 18;

const useStyles = makeStyles(() =>
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
            whiteSpace: 'nowrap',
            overflow: 'hidden',
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
        }
    }),
);

export const SongDisplayWithIcon = (props: Props) => {
    const { song, getIcon } = props;
    const classes = useStyles();

    const getIconCallback = React.useCallback(() => {
        return getIcon(song);
    }, [song, getIcon]);

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
                    {getIconCallback()}
                </div>
            </div>
        </>
    );
}