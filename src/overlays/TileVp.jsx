import React from 'react';
import Highlight from './Highlight';

/**
 * 
 * @param {{src: string;}} props 
 */
export default function TileVp(props) {
  return <Highlight src={props.src} highlights={[{ x: 128, y: 131, width: 26, height: 25 }]} />;
}