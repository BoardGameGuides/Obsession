import React, { useEffect, useRef, useCallback } from 'react';
import { findDOMNode } from 'react-dom';
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
  /** @type {React.MutableRefObject<HTMLInputElement>} */
  const input = useRef(null);

  // If navigating to the search page using the search icon button, focus the input box.
  useEffect(() => {
    if (location.pathname === '/search' && props.value === '' && input.current != null) {
      input.current.focus();
    }
  }, [location.pathname, props.value, input]);

  // See https://react-bootstrap.github.io/components/forms/#forms
  const formControlRef = useCallback(node => {
    if (node === null) {
      input.current = null;
    } else {
      input.current = /** @type {HTMLInputElement} */ (findDOMNode(node));
    }
  }, []);

  return (
    <InputGroup>
      <InputGroup.Prepend>
        {location.pathname === '/search' ?
          <Button variant="outline-primary"><FontAwesomeIcon icon={faSearch} /></Button> :
          <Button as={Link} to="/search" variant="outline-primary"><FontAwesomeIcon icon={faSearch} /></Button>
        }
      </InputGroup.Prepend>
      <FormControl type="text" value={props.value} onChange={event => props.onValueChange(event.target.value)} placeholder="Search..." ref={formControlRef} />
    </InputGroup>
  );
}

export default VoiceSearchBox;
