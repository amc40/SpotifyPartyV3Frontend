import React from 'react';
import SpotifyWebApi from 'spotify-web-api-js';

interface Props {
    spotify: SpotifyWebApi.SpotifyWebApiJs;
}
// component to display all the active devices.
export function ActiveDevices(props: Props) {
    const [activeDevices, setActiveDevices] = React.useState([] as string[]);
    const spotify = props.spotify;


    React.useEffect(() => {
        const refreshDevices = setInterval(() => {
            spotify.getMyDevices()
            .then((returnedDevices) => {
                const availableDevices = returnedDevices.devices.filter((device) => device.is_active);
                const strDevices = availableDevices.map((device) => {
                    return device.name;
                })
                setActiveDevices(strDevices);
            });
        }, 1000);
        return clearInterval(refreshDevices);
        
    }, [spotify]);

    return (
        <ul>
            {activeDevices.map((activeDevice) => {
                return <li key={activeDevice}>{activeDevice}</li>
            })}
        </ul>
    );
}