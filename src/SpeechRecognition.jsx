import React from 'react';
import SpeechRecognition from 'react-speech-recognition';

export const SpeechRecognitionContext = React.createContext({
  browserSupportsSpeechRecognition: false,
  transcript: '',
  startListening: () => { },
  listening: false
});

function SpeechRecognitionContextProviderComponent(props) {
  return <SpeechRecognitionContext.Provider value={props}>{props.children}</SpeechRecognitionContext.Provider>;
}

export const SpeechRecognitionContextProvider = SpeechRecognition({ autoStart: false, continuous: false })(SpeechRecognitionContextProviderComponent);
