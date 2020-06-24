import React from 'react';
import { SongInfo, QueuedSongInfo } from '../common/interfaces';


interface Props {
    songInfo: QueuedSongInfo;
}

export const PartySongInfo = (props: Props) => {
    const { name, votes } = props.songInfo;
    return (
        <div>
            <span>{name}</span>
            <span>{votes}</span>
        </div>
    );
}