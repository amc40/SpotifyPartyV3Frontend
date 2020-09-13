import { createStyles, makeStyles, Typography } from "@material-ui/core";
import React from "react";
import { spotifyMinorTextGrey } from "../common/constants";
import { SongInfo } from "../common/interfaces";

// component to display song details centred

interface Props {
    song: SongInfo;
};

const topDivHeight = 26;
const bottomDivHeight = 18;

const useStyles = makeStyles(() =>
    createStyles({
        songContainer: {
            display: 'grid',
            gridGap: '2px 0px',
            gridTemplateColumns: '1fr',
            gridTemplateRows: `${topDivHeight}px ${bottomDivHeight}px`,
            fontSize: '10',
            textOverflow: 'ellipsis',
            textAlign: 'center',
            paddingLeft: '10px',
            paddingRight: '10px'
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
            fontSize: '1.3rem',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            maxHeight: topDivHeight
        }
    })
);

export const CentredSongDisplay = (props: Props) => {
    const { song } = props;
    const classes = useStyles();
    return (
        <>
            <div className={classes.songContainer}>
                <div className={classes.topTextDiv}>
                    <Typography className={classes.topText}>{song.name}</Typography>
                </div>
                <div className={classes.bottomTextDiv}>
                    <Typography className={classes.bottomText}>{song.artists.join(', ')}</Typography>
                </div>
            </div>
        </>
    );
    
};