import React from 'react';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

/**
 * @typedef {object} Props
 * @prop {string} value
 * @prop {(value: string) => void} onValueChange
 * 
 * @param {Props} props 
 */
function VoiceSearchBox(props) {
  const location = useLocation();

  return (
    <InputGroup>
      <InputGroup.Prepend>
        {location.pathname === '/search' ?
          <Button variant="outline-primary"><FontAwesomeIcon icon={faSearch} /></Button> :
          <Button as={Link} to="/search" variant="outline-primary"><FontAwesomeIcon icon={faSearch} /></Button>
        }
      </InputGroup.Prepend>
      <FormControl type="text" value={props.value} onChange={event => props.onValueChange(event.target.value)} placeholder="Search..." />
    </InputGroup>
  );
}

export default VoiceSearchBox;
