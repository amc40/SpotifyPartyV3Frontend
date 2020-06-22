import React from "react";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import { ChevronLeft, MenuRounded, ChevronRight } from "@material-ui/icons";
import { Root, Header, Nav } from "mui-layout";
import { makeStyles } from '@material-ui/styles';
import SpotifyWebApi from 'spotify-web-api-js';
import lodash from "lodash";

import "./styles.css";
import { expressWSAddr } from '../constants';
import { StickyFooter, SongSearch, SongInfo, SearchResults } from "./";
// TODO: move to more appropriate location
import mui_config from '../mui_config';


const spotify = new SpotifyWebApi();
const queryString = window.location.search;
const URLParams = new URLSearchParams(queryString);

const spotifyClientId = '28e66594625340b9a0ef78891d0764ff';
const redirect_uri = 'http://localhost:3000';


if (!URLParams.has('code')) {
  const scopes = 'user-read-private';
  
  window.location.href = 'https://accounts.spotify.com/authorize' +
  '?response_type=code' +
  '&client_id=' + spotifyClientId +
  (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
  '&redirect_uri=' + encodeURIComponent(redirect_uri);
}
const accessCode = URLParams.get('code') as string;

async function refreshAccessToken(refreshToken: string) {
  console.log('refreshing access token with refresh token ' + refreshToken);
  const spotifyTokenData = new URLSearchParams();
  spotifyTokenData.append('refresh_token', refreshToken);
  const rawSpotifyTokenResponse = await fetch(expressWSAddr + '/api/spotify_tokens/refresh?' + spotifyTokenData.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  const tokenResponseContent = await rawSpotifyTokenResponse.json();
  const accessToken = tokenResponseContent.access_token;
  const refreshSeconds = tokenResponseContent.refresh_seconds;
  console.log('refreshed access token');
  spotify.setAccessToken(accessToken);
  // refresh half the interval it expires in in order to ensure that we have the time to perform the request.
  setTimeout(refreshAccessToken, 5000, refreshToken);
}

async function getAccessToken() {
  //TODO: handle errors
  console.log('getting access token');
  const spotifyTokenData = new URLSearchParams();
  spotifyTokenData.append('authorization_code', accessCode);
  const rawSpotifyTokenResponse = await fetch(expressWSAddr + '/api/spotify_tokens/new?' + spotifyTokenData.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  });
  const tokenResponseContent = await rawSpotifyTokenResponse.json();
  const accessToken = tokenResponseContent.access_token;
  const refreshSeconds = tokenResponseContent.refresh_seconds;
  const refreshToken = tokenResponseContent.refresh_token;
  console.log('got access token ' + accessToken);
  spotify.setAccessToken(accessToken);
  console.log('refresh token ' + refreshToken);
  // refresh half the interval it expires in in order to ensure that we have the time to perform the request.
  setTimeout(refreshAccessToken,  5000, refreshToken);
};


getAccessToken();

const theme = createMuiTheme();

async function updateSongs(searchText: string): Promise<SongInfo[]>{
  if (spotify.getAccessToken()) {
    if (searchText === '') {
      console.log('Empty search text.');
      return [];
    } else {
      // if access token has been set 
      const res = await spotify.searchTracks(searchText, {limit: 10});
      const tracks = res.tracks.items.map((trackInfo) => { 
        return {name: trackInfo.name, uri: trackInfo.uri};
      });
      console.log(tracks);
      return tracks;
    }
    
  } else {
    console.log('Not sending as access token has not yet');
    return [];
  }
} 

export function PartyPage() {
  
  const footerContent = <h2>Footer</h2>;

  const useDrawerStyles = makeStyles({
    paper: {
      backgroundColor: '#030303',
      color: 'white',
      border: 'none',
    },
  });


  const drawerStyles =  useDrawerStyles();

  const initialSearchText = 'Search...';

  const [tracks, setTracks] = React.useState([] as SongInfo[]);

  function handleSearch(newSearchText: string) {
    console.log(`New Search Text: ${newSearchText}`);
    updateSongs(newSearchText).then(newSongs => {
      console.log("calling result for", newSearchText);
      setTracks(newSongs);
    });
  }

  const content = <SearchResults songs={tracks}/>;
  return (
    <ThemeProvider theme={theme}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Root config={mui_config}>
          <Header
            renderMenuIcon={(open: boolean) => (open ? <ChevronLeft /> : <MenuRounded />)}
          >
            <SongSearch initialSearchText={initialSearchText} onSearchTextUpdated={lodash.debounce(handleSearch, 500)}/>
          </Header>
          <Nav
            renderIcon={(collapsed: boolean)=>
              collapsed ? <ChevronRight /> : <ChevronLeft />
            }
            classes={drawerStyles}
          >
            Nav
          </Nav>
          <StickyFooter contentBody={content} footerHeight={100} footer={footerContent}/>
          
        </Root>
      </div>
    </ThemeProvider>
  );

