import React, { CSSProperties } from 'react';
import { QueuedSongInfo } from '../common/interfaces';
import { ThemeProvider, Button } from '@material-ui/core';
import { buttonTheme } from '../common/themes';

interface Props {
    partyStarted: boolean;
    partySongs: QueuedSongInfo[];
    onStartParty: () => void;
}

export const PartyPageFooter = (props: Props) => {
    const { partyStarted, partySongs, onStartParty } = props;

    const readyToStartParty = React.useCallback(() => {
        return partySongs.length >= 2;
    }, [partySongs]);

    if (partyStarted) {
        //TODO: fill with currently playing and next up
        return <h2>TODO: fill with currently playing and next up</h2>;
    } else {
        // TODO: hosting as state.
        const centredStyle: CSSProperties = {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        };
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