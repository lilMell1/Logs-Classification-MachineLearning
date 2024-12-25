import React, { useState } from 'react';

// Define Props interface
interface Props {
  title: string;
}

// Define Component
const App: React.FC<Props> = ({ title }) => {
  const [count, setCount] = useState<number>(0);

  return (
    <div>
      <h1>{title}</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
};

export default App;
