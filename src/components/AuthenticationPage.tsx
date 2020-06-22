import React, { useEffect } from 'react';
import { Redirect } from "react-router-dom";

import { getNewAccessToken } from '../scripts';
import { setSpotifyAuthCookies } from '../scripts';

export function AuthenticationPage() {
    const [navigateToHomepage, setNavigateToHomepage] = React.useState(false);
    const [navigateToPartyPage, setNavigateToPartyPage] = React.useState(false);

    const renderRedirectToHomepage = () => {
        if (navigateToHomepage) {
            return <Redirect to='/' />;
        }
    }

    const renderRedirectToPartyPage = () => {
        if (navigateToPartyPage) {
            return <Redirect to='/party'/>;
        }
    }

    function handleAuthError() {
        // TODO: display message before redirecting to home
        setNavigateToHomepage(true);
    }

    function handleAuthSuccess(accessToken: string, refreshSeconds: number, refreshToken: string) {
        setSpotifyAuthCookies(accessToken, refreshSeconds, refreshToken);
        setNavigateToPartyPage(true);
    }

    useEffect(() => {
        const urlSearchParams = new URLSearchParams(window.location.search);
        if (urlSearchParams.has('code')) {
            // have got a spotify authentication code, need to get access token
            const authorizationCode = urlSearchParams.get('code') as string;
            getNewAccessToken(authorizationCode, {
                handleNewAccessToken: handleAuthSuccess,
                handleAccessTokenFetchFailure: handleAuthError
            });
        } else {
            // don't have auth code.
            handleAuthError();
        }
    });

    return (
        <div>
            {renderRedirectToHomepage()}
            {renderRedirectToPartyPage()}
            <h1>Authentication</h1> 
        </div>
    );
}