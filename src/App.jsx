import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [jokes, setJokes] = useState([]);

  useEffect(() => {
    const fetchJokes = async () => {
      try {
        const res = await axios.get('/api/jokes');
        setJokes(res.data);
      } catch (error) {
        console.error('Failed to fetch jokes:', error);
      }
    };
    fetchJokes();
  }, []);

  return (
    <>
      <h1>Jokes</h1>
      <p>jokes : {jokes.length}</p>
      {
        jokes.map((joke, index) => (
          <div key={joke.id || index}>
            <h3>{joke.title}</h3>
            <p>{joke.content}</p>
          </div>
        ))
      }
    </>
  );
}

export default App;
