import React from 'react';
import { CircularProgress, Typography } from '@material-ui/core';
import { CSSProperties } from '@material-ui/core/styles/withStyles';

interface Props {
    text: string;
}

export const Loading = (props: Props) => {
    const { text } =  props;
    const divStyle: CSSProperties = {
        padding: 20,
    }

    return (
    <div style={divStyle}>
        <div style={{display: 'flex', justifyContent: 'center', paddingBottom: 10}}>
            <CircularProgress/>
        </div>
        <div>
            <Typography align={'center'}>{text}</Typography>
        </div>
    </div>
    );
}