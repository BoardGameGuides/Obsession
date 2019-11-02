import React, { useEffect, useRef, useCallback, useContext, useState } from 'react';
import { findDOMNode } from 'react-dom';
import { InputGroup, FormControl, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMicrophoneAlt } from '@fortawesome/free-solid-svg-icons';
import { useSpeechRecognition } from './SpeechRecognition';

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
  const [speechTranscript, setSpeechTranscript] = useState('');
  const speech = useSpeechRecognition();

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

  // If the speech transcript changes, update the URI.
  useEffect(() => {
    if (speechTranscript !== speech.transcript) {
      setSpeechTranscript(speech.transcript);
      if (speech.listening) {
        props.onValueChange(speech.transcript);
      }
    }
  }, [speechTranscript, speech.transcript, speech.listening, props]);

  return (
    <InputGroup>
      <InputGroup.Prepend>
        {location.pathname === '/search' ?
          <Button variant="outline-primary"><FontAwesomeIcon icon={faSearch} /></Button> :
          <Button as={Link} to="/search" variant="outline-primary"><FontAwesomeIcon icon={faSearch} /></Button>
        }
      </InputGroup.Prepend>
      <FormControl type="text" value={props.value} onChange={event => props.onValueChange(event.target.value)} placeholder="Search..." ref={formControlRef} />
      {!speech.browserSupportsSpeechRecognition ? null :
        <InputGroup.Append>
          <Button variant="outline-primary" onClick={() => speech.startListening()}><FontAwesomeIcon icon={faMicrophoneAlt} /></Button>
        </InputGroup.Append>
      }
    </InputGroup>
  );
}

export default VoiceSearchBox;
