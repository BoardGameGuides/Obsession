import React, { useState, useRef, useEffect } from 'react';
//import SpeechRecognition from 'react-speech-recognition';

/** @type {typeof(window.SpeechRecognition)} */
const BrowserSpeechRecognition = window && (window.SpeechRecognition ||
  window['webkitSpeechRecognition'] ||
  window['mozSpeechRecognition'] ||
  window['msSpeechRecognition'] ||
  window['oSpeechRecognition']);

function createRecognition() {
  const result = new BrowserSpeechRecognition();
  result.interimResults = true;
  result.maxAlternatives = 1;
  return result;
}

/**
 * 
 * @param  {...string} transcripts 
 */
function concat(...transcripts) {
  return transcripts.map(x => x.trim()).filter(x => x).join(' ');
}

/**
 * 
 * @param {SpeechRecognitionResultList} speechRecognitionResultList 
 * @param {(x: SpeechRecognitionResult) => boolean} predicate
 */
function getTranscript(speechRecognitionResultList, predicate) {
  const result = /** @type {string[]} */ ([]);
  for (let i = 0; i !== speechRecognitionResultList.length; ++i) {
    if (!predicate(speechRecognitionResultList[i])) {
      continue;
    }
    result.push(speechRecognitionResultList[i][0].transcript);
  }
  return concat(...result);
}

export function useSpeechRecognition() {
  const recognition = useRef(BrowserSpeechRecognition ? createRecognition() : null);
  const browserSupportsSpeechRecognition = recognition.current !== null;
  const [listening, setListening] = useState(false);
  const [final, setFinal] = useState('');
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      return;
    }

    /**
     * 
     * @param {SpeechRecognitionEvent} event 
     */
    function handleResult(event) {
      const additionalFinal = getTranscript(event.results, x => x.isFinal);
      console.log('additionalFinal', additionalFinal);
      setFinal(x => concat(x, additionalFinal));

      const transient = getTranscript(event.results, x => !x.isFinal);
      console.log('transient', transient);
      setTranscript(concat(final, additionalFinal, transient));
    }

    function handleEnd() {
      setListening(false);
    }

    const r = recognition.current;
    r.addEventListener('result', handleResult);
    r.addEventListener('end', handleEnd);
    return () => {
      r.removeEventListener('result', handleResult);
      r.removeEventListener('end', handleEnd);
    }
  }, [browserSupportsSpeechRecognition]);

  return {
    browserSupportsSpeechRecognition,
    transcript,
    startListening: browserSupportsSpeechRecognition ? () => { setListening(true); recognition.current.start(); } : () => { },
    listening
  };
}
