import { createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { redirectToSpotifyAuth } from '../scripts';

// home page, currently just a button to redirect to authentication
export function Home() {
    return (
        <body>
            <h1>Home</h1>
            <button onClick={redirectToSpotifyAuth}>
                Authenticate    
            </button>
        </body>
    );
}