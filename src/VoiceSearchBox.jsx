import React from 'react';
import { InputGroup, FormControl } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

/**
 * @typedef {object} Props
 * @prop {(input: HTMLInputElement) => void} ref
 * @prop {string} value
 * @prop {(value: string) => void} onValueChange
 * 
 * @param {Props} props 
 * @param {any} ref 
 */
function VoiceSearchBox(props, ref) {
  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl type="text" value={props.value} onChange={event => props.onValueChange(event.target.value)} placeholder="Search..." ref={ref} />
    </InputGroup>
  );
}

export default React.forwardRef(VoiceSearchBox);
