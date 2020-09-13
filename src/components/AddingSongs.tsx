import React from 'react';
import { Loading } from './Loading';

interface Props {
}
// component to display an adding songs loading icon.
export const AddingSongs = () => {
    return (
        <Loading text={'Adding Songs ...'}/>
    );
};