import React from 'react';
import { redirectToSpotifyAuth } from '../scripts';

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