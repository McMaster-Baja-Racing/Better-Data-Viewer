import '../styles/App.css';
// import useState
import React, { useState } from 'react';
import Chart from './Chart';

function App() {

  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <header className="App-header">
        <p>
        {count}
        </p>
        <Chart/>

        <button onClick={() => {
          console.log("Button was clicked");
          setCount(count + 1);
        }}>Change to Apple</button>
      </header>
    </div>
  );
}

export default App;
