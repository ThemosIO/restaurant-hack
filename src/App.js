import { useState } from 'react';
import './App.css';

const lastDay = 17;
const RESTAURANTS = {
  SPONDI: 252,
  SENSE: 646,
  ZILLERS: 652,
};

function App() {
  const [slots, setSlots] = useState({});
  const [searching, setSearching] = useState(false);
  const [finished, setFinished] = useState(false);
  var today = new Date().getUTCDate();

  const url = (restaurant, day) => `https://ireserve.i-host.gr/IReserve/SearchAvailability/${restaurant}/2022-04-${day}%2019:00/4/DINEATHENS/`;

  const requestBatch = async (restaurant) => {
    setSlots({});
    setSearching(true);
    setFinished(false);
    const req = async (day) => fetch(url(restaurant, day), { mode: 'cors' })
      .then((res) => res.json())
      .then(data => (data?.slots || [])?.length > 0 &&
        setSlots(old => ({ ...old, [day]: data?.slots })))
      .catch((e) => console.warn(e.message));

    for (let i = today + 1; i <= lastDay; i++) {
      console.log(`>> restaurant:${restaurant}, day:${i}`);
      await req(i);
    }
    setSearching(false);
    setFinished(true);
  };

  const handleRunBatch = (name) => async () => {
    console.log(`>> batch for restaurant:${name}`);
    await requestBatch(name);
  }

  return (
    <div className='container'>
      <div className='buttons'>
        <div className='button' onClick={handleRunBatch(RESTAURANTS.SPONDI)}>Spondi</div>
        <div className='button' onClick={handleRunBatch(RESTAURANTS.SENSE)}>Sense</div>
        <div className='button' onClick={handleRunBatch(RESTAURANTS.ZILLERS)}>Zillers</div>
      </div>
      <div className='results'>
        {Object.keys(slots).length > 0 && <div className='title'>Found slots:</div>}
        {Object.keys(slots).map(k =>
          <div key={k}>
            <div className='date'>{k}/4/22</div>
            {(slots[k] || [])?.map(s => <div key={s.time}> - {s.time}</div>)}
          </div>)}
      </div>
      {searching && <div className='searching'>Searching..</div>}
      {finished && <div className='finished'>Finished ✓</div>}
    </div>
  );
}

export default App;
