import React from 'react';
import SpotifyWebApi from 'spotify-web-api-js';
import { DialogTitle, ListItem, Avatar, ListItemAvatar, ListItemText, List, DialogContentText, DialogContent } from '@material-ui/core';
import { DeviceUnknown, DriveEta, Computer, Tablet, Smartphone, Memory, Tv, SettingsInputComponent, CastConnected, Games } from '@material-ui/icons';
import { Device } from '../common/interfaces';

const refreshDeviceIntervalMs = 500;

interface Props {
    spotify: SpotifyWebApi.SpotifyWebApiJs;
    open: boolean;
    handleClose: () => void;
    handleDeviceSelected: (device: Device) => void;
}



function getIcon(deviceType: string) {
    switch (deviceType) {
        case "Computer":
            return <Computer/>;
        case "Tablet":
            return <Tablet/>;
        case "Smartphone":
            return <Smartphone/>;
        case "TV":
            return <Tv/>;
        case "AVR":
            return <Memory/>;
        case "STB":
            return <Tv/>;
        case "AudioDongle":
            return <SettingsInputComponent/>;
        case "GameConsole":
            return <Games/>;
        case "CastVideo":
            return <CastConnected/>;
        case "CastAudio":
            return <CastConnected/>;
        case "Automobile":
            return <DriveEta/>;
        default:
            return <DeviceUnknown/>;
    }
}

export const GetDevicesDialogBody = (props: Props) => {
    const { spotify, open } = props;

    const [activeDevices, setActiveDevices] = React.useState([] as Device[]);

    React.useEffect(() => {
        console.log('setting up device refresh.');
        if (open) {
            const refreshDevices = setInterval(() => {
                console.log('getting devices');
                spotify.getMyDevices()
                .then((returnedDevices) => {
                    const availableDevices = returnedDevices.devices;
                    console.log('Got available devices:', availableDevices);
                    const convertedDevices: Device[] = availableDevices.map((device) => {
                        return {
                            id: device.id as string,
                            name: device.name as string,
                            icon: getIcon(device.type)
                        };
                    });
                    setActiveDevices(convertedDevices);
                });
            }, refreshDeviceIntervalMs);
            return  () => {
                console.log('Clearing devices');
                clearInterval(refreshDevices)
            };
        }  
        
    }, [spotify, open]);

    function handleDeviceSelected(device: Device) {
        console.log(`Selected device: ${device}`);
        props.handleDeviceSelected(device);
    }

    const title = 'Select a Device';
    const hasDeviceInstruction = "If you would like to use another device please open Spotify on that device.";
    const noDevicesInstruction = "It looks like you don't have the Spotify App open anywhere. Please open Spotify on the device you would like to start the party on.";
    
    let body;
    if (activeDevices.length > 0) {
        // if there is some active device, diplay it.
        body = (
            <>
                <DialogContent>
                    <DialogContentText id="choose-device-description">
                        {hasDeviceInstruction}
                    </DialogContentText>
                </DialogContent>
                <List>
                    {
                        activeDevices.map((device) => {
                            return (
                            <ListItem button onClick={() => handleDeviceSelected(device)} key={device.id}>
                                <ListItemAvatar>
                                    <Avatar>
                                        {device.icon}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={device.name}/>
                            </ListItem>);

                        })
                    }
                </List>
            </>
        );
    } else {
        // if there is no active device then display a message asking the user to open the spotify app.
        body = (
            <DialogContent>
                <DialogContentText id="open-device-description">
                    {noDevicesInstruction}
                </DialogContentText>
            </DialogContent>
        );
    }

    return (
        <>
            <DialogTitle id="select-device-title">{title}</DialogTitle>
            {body}
        </>
    );
}