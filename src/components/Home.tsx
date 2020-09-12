import { createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { redirectToSpotifyAuth } from '../scripts';
// import styled, { keyframes } from 'styled-components';

// const slamKeyframes = keyframes``

// const useStyles = makeStyles(() =>
//     createStyles({
//         slam: {
//             animation: 'slam 1s',
//             animationTimingFunction: 'ease-in',
//             color: '#1DB954',
//             display: 'block',
//             fontFamily: 'Gotham, sans-serif',
//             fontSize: '13em',
//             fontWeight: 900,
//             position: 'relative',
//             textAlign: 'center',
//           }
//     })
// );

export function Home() {
    return (
        <body>
            <h1>Home</h1>
            <button onClick={redirectToSpotifyAuth}>
                Authenticate    
            </button>
            {/* <span class="slam">Spotify</span>
            <div id='main_party_txt' class="slam slam_delayed">Party</div>
            <div class="button_div" id="create_party_div">
                <button type="button" id="create_party_btn" class="create_join_btn" onclick="createPartyBtn()">
                <span class="create_join_span">Create Party</span>
                </button>
                <input type="text" placeholder="Enter Party Name" id="partyNametxt" class="party_name_code_text">
            </div>
            <div class="button_div" id="join_party_div">
                <button type="button" id="join_party_btn" class="create_join_btn" onclick="joinPartyBtn()">
                <span class="create_join_span">Join Party</span>
                </button>
                <input type="text" placeholder="Enter Party Code" id="partyCodetxt" class="party_name_code_text">
            </div> */}
        </body>
    );
}