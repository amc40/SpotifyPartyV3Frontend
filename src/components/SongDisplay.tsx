import React from 'react';
import { SongInfo } from '../common/interfaces';
import { Typography } from '@material-ui/core';

interface Props {
    song: SongInfo;
}

export const SongDisplay = (props: Props) => {
    const { song } = props;
    return (
        <>
            <div style={{display: 'flex', alignItems: 'center', gridColumn: '1 span 1', gridRow: '1 span 1'}}>
                <Typography>{song.name}</Typography>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gridColumn: '1 span 1', gridRow: '1 span 1'}}>
                <Typography>{song.artists.join(', ')}</Typography>
            </div>
        </>
    );
}