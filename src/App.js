import { useState } from 'react';
import './App.css';

const lastDay = 17;
const restaurants = [
  { name: 'Spondi', code: 252 },
  { name: 'Sense', code: 646 },
  { name: 'Zillers', code: 652 },
  { name: 'CTC', code: 618 },
];

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
      Find restaurant to dine 4
      <div className='buttons'>
        {restaurants.map(r =>
          <div className='button' onClick={handleRunBatch(r.code)}>{r.name}</div>)}
      </div>
      <div className='results'>
        {Object.keys(slots).length > 0
          ? <div className='title'>Found {Object.keys(slots).length} slots:</div>
          : finished && <div className='title'>No slots found ☹</div>}
        {Object.keys(slots).map(k =>
          <div key={k}>
            <div className='date'>{k}/4/22</div>
            {(slots[k] || [])?.map(s => <div key={s.time}> - {s.time}</div>)}
          </div>)}
      </div>
      {searching && <div className='searching'>Searching..</div>}
    </div>
  );
}

export default App;
