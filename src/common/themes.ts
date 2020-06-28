import { createMuiTheme } from "@material-ui/core";
import { spotifyWhite, spotifyGreen } from "./constants";

export const buttonTheme = createMuiTheme({
    palette: {
        primary: {
            main: spotifyGreen,
            contrastText: spotifyWhite
        },
    },
});