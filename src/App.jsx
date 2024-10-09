import { useState, useRef } from 'react';
import './App.css';
import search from './assets/icons/search.svg';
import mic from './assets/icons/mic.png';
import { useStateContext } from './Context';
import { BackgroundLayout, WeatherCard, MiniCard } from './Components';

function App() {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const { weather, thisLocation, values, place, setPlace } = useStateContext();
  const recognition = useRef(null);

  // Function to initialize speech recognition
  const startListening = () => {
    if (!recognition.current) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.lang = 'en-US';
      recognition.current.interimResults = true;
      recognition.current.maxAlternatives = 1;

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        setRecognizedText(transcript);
      };

      recognition.current.onspeechend = () => {
        setIsListening(false);
        recognition.current.stop();
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    setIsListening(true);
    setRecognizedText(''); // Reset recognized text before starting
    setShowPopup(true); // Show the popup
    recognition.current.start();
  };

  const submitCity = () => {
    setPlace(input);
    setInput('');
  };

  // Popup Component
  const Popup = ({ text, onConfirm, onCancel }) => (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white p-4 rounded shadow-lg text-black'>
        <p>{text ? `Recognized Text: "${text}"` : 'Listening...'}</p>
        <div className='flex justify-end mt-4'>
          <button onClick={onConfirm} className='bg-blue-500 text-white px-4 py-2 rounded mr-2'>Confirm</button>
          <button onClick={onCancel} className='bg-gray-500 text-white px-4 py-2 rounded'>Cancel</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='w-full h-screen text-white px-8'>
      <nav className='w-full p-3 flex justify-between items-center'>
        <h1 className='font-bold tracking-wide text-3xl'>Weather App</h1>
        <div className='bg-white w-[15rem] overflow-hidden shadow-2xl rounded flex items-center p-2 gap-2'>
          <img src={search} alt="search" className='w-[1.5rem] h-[1.5rem]' />
          <input
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                submitCity();
              }
            }}
            type="text"
            placeholder='Search city'
            className='focus:outline-none w-full text-[#212121] text-lg'
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button onClick={startListening}>
            <img src={mic} alt="mic" className='w-[1.5rem] h-[1.5rem]' />
          </button>
        </div>
      </nav>
      <BackgroundLayout></BackgroundLayout>
      <main className='w-full flex flex-wrap gap-8 py-4 px-[10%] items-center justify-center'>
        <WeatherCard
          place={thisLocation}
          windspeed={weather.wspd}
          humidity={weather.humidity}
          temperature={weather.temp}
          heatIndex={weather.heatindex}
          iconString={weather.conditions}
          conditions={weather.conditions}
        />

        <div className='flex justify-center gap-8 flex-wrap w-[60%]'>
          {
            values?.slice(1, 7).map(curr => {
              return (
                <MiniCard
                  key={curr.datetime}
                  time={curr.datetime}
                  temp={curr.temp}
                  iconString={curr.conditions}
                />
              );
            })
          }
        </div>
      </main>

      {/* Popup for showing recognized text */}
      {showPopup && (
        <Popup
          text={recognizedText}
          onConfirm={() => {
            setInput(recognizedText);
            setPlace(recognizedText);
            setShowPopup(false);
          }}
          onCancel={() => {
            setShowPopup(false);
            recognition.current.stop(); // Stop listening if canceled
          }}
        />
      )}
    </div>
  );
}

export default App;
