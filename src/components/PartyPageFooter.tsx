import React, { CSSProperties } from 'react';
import { QueuedSongInfo, SongInfo } from '../common/interfaces';
import { ThemeProvider, Button } from '@material-ui/core';
import { buttonTheme } from '../common/themes';
import { CentredSongDisplay } from './CentredSongDisplay';

interface Props {
    partyStarted: boolean;
    partySongs: QueuedSongInfo[];
    onStartParty: () => void;
    currentTrack: SongInfo | undefined;
}

const centredStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%'
};

export const PartyPageFooter = (props: Props) => {
    const { partyStarted, partySongs, onStartParty, currentTrack } = props;

    const readyToStartParty = React.useCallback(() => {
        return partySongs.length >= 2;
    }, [partySongs]);

    if (partyStarted) {
        //TODO: fill with currently playing and next up
        if (currentTrack) {
            return (
                <div style={{marginTop: '10px'}}>
                    <CentredSongDisplay song={currentTrack}></CentredSongDisplay>
                </div>
                
            );
        } else {
            return <h2> Please resync </h2>; 
        }
        
    } else {
        // TODO: hosting as state.
        
        const hosting = true;
        if (hosting) {
            if (readyToStartParty()) {
                return (
                    <div style={centredStyle}>
                        <ThemeProvider theme={buttonTheme}>
                            <Button 
                                onClick={onStartParty} 
                                variant="contained"
                                color="primary"
                                // className={drawerStyles.button}
                            > 
                            Start Party
                            </Button>
                        </ThemeProvider>
                    </div>
                );
            } else {
                return (
                    <div style={centredStyle}>
                        You must add at least 2 songs to start the party!
                    </div>
                );
            }
        } else {
            return (
                <div style={centredStyle}>
                    Waiting for Host to Start ...Device
                </div>
            );
        }
    }
}