import React from 'react';
import { QueuedSongInfo } from '../common/interfaces';
import { SongDisplayWithIcon } from './SongDisplayWithIcon';
import { SongUpvoteButton } from './SongUpvoteButton';

interface Props {
    songInfo: QueuedSongInfo;
    partyId: string;
}

// displays the song info on the left of a fixed-size div with the specified icon on the right.
export const PartySongInfo = (props: Props) => {
    const { partyId, songInfo } = props;

    const getIcon = React.useCallback(() => {
        return <SongUpvoteButton songInfo={songInfo} partyId={partyId}/>;
    }, [partyId, songInfo]);

    return (
       <SongDisplayWithIcon song={songInfo} getIcon={getIcon}/>
    );
}