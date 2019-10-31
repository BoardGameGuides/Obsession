import React, { useCallback, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { InputGroup, FormControl } from 'react-bootstrap';
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
  /** @type {React.MutableRefObject<HTMLInputElement>} */
  const input = useRef(null);

  /** Focus on initial load. */
  useEffect(() => {
    if (input.current !== null) {
      input.current.focus();
    }
  }, [input]);

  // See https://react-bootstrap.github.io/components/forms/#forms
  const formControlRef = useCallback(node => {
    if (node === null) {
      input.current = null;
    } else {
      input.current = /** @type {HTMLInputElement} */ (ReactDOM.findDOMNode(node));
    }
  }, []);

  return (
    <InputGroup>
      <InputGroup.Prepend>
        <InputGroup.Text><FontAwesomeIcon icon={faSearch} /></InputGroup.Text>
      </InputGroup.Prepend>
      <FormControl type="text" value={props.value} onChange={event => props.onValueChange(event.target.value)} placeholder="Search..." ref={formControlRef} />
    </InputGroup>
  );
}

export default VoiceSearchBox;
