import * as React from 'react';
import CSS from 'csstype';
import mui_config from '../mui_config';
import {Content} from 'mui-layout';

interface Props {
    contentBody: React.ReactNode;
    footer: React.ReactNode;
    footerHeight: number;
}

const headerHeight = mui_config.initialAdjustmentHeight;

export const StickyFooter = (props: Props) => {
    const footerHeight = `${props.footerHeight}px`;
    const footerStyle: CSS.Properties = {
        height: footerHeight,
        background: 'grey',
        gridColumn: '1 / span 1',
        gridRow: '2 / span 1',
        backgroundColor: '#121212',
        border: '1px solid #030303',
        color: 'white'
    };
    
    const contentStyle: CSS.Properties = {
        // height: contentHeight,
        gridColumn: '1 / span 1',
        gridRow: '1 / span 1',
        overflowY: 'scroll',
        padding: '20px',
        backgroundImage: 'linear-gradient(to bottom, rgb(60, 60, 60), #121212)',
        color: 'white'
    }

    const outerDivStyle: CSS.Properties = {
        height: `calc(100vh - ${headerHeight}px)`,
        display: 'grid',
        gridGap: '0px 0px',
        gridTemplateColumns: 'auto',
        gridTemplateRows: `auto ${footerHeight}`,

    };

    return (
        <Content style={outerDivStyle}>
            <div style={contentStyle}>
                {props.contentBody}
            </div>
            <div style={footerStyle}>
                {props.footer}
            </div>
        </Content>
    );
}