import * as React from 'react';

import  {SongInfo} from './index';

interface Props {
    songs: SongInfo[]
}

export const SearchResults = (props: Props) => {
    return (
        <ul>
            {props.songs.map((song) => {
                return <li key={song.uri}>{song.name}</li>
            })}
        </ul>
    );
}