import { makeStyles, createStyles } from "@material-ui/core"

export const createCustomScrollbars = makeStyles(() =>
        createStyles({
            customScrollbar: {
                overflowY: 'auto',
                '&::-webkit-scrollbar-track': {
                    WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.3)',
                    borderRadius: '10px',
                    backgroundColor: '#A9A9A9'
                },
                '&::-webkit-scrollbar': {
                    width: '12px',
                    backgroundColor: 'rgba(0,0,0,0)'
                },
                '&::-webkit-scrollbar-thumb': {
                    borderRadius: '10px',
                    WebkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,.3)',
                    backgroundColor: '#555'
                }
            }
        })
);
