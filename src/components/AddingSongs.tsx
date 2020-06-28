import React from 'react';
import { Loading } from './Loading';

interface Props {
}

export const AddingSongs = () => {
    return (
        <Loading text={'Adding Songs ...'}/>
    );
};