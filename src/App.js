import { useState } from 'react';
import './App.css';

const lastDay = 17;
const restaurants = [
  { name: 'Spondi', code: 252 },
  { name: 'Sense', code: 646 },
  { name: 'Zillers', code: 652 },
  { name: 'CTC', code: 618 },
  { name: 'Ovio', code: 242, isEarly: true },
];

function App() {
  const [slots, setSlots] = useState({});
  const [diners, setDiners] = useState(0);
  const [code, setCode] = useState();
  const [searching, setSearching] = useState(false);
  const [finished, setFinished] = useState(false);
  var today = new Date().getUTCDate();

  const url = (restaurant, day, people, isEarly) => `https://ireserve.i-host.gr/IReserve/SearchAvailability/${restaurant}/2022-04-${day}%20${isEarly ? '15' : '19'}:00/${people}/DINEATHENS/`;

  const requestBatch = async (restaurant, people, isEarly) => {
    setSlots({});
    setSearching(true);
    setFinished(false);
    const req = async (day, people) => fetch(url(restaurant, day, people, isEarly), { mode: 'cors' })
      .then((res) => res.json())
      .then(data => (data?.slots || [])?.length > 0 &&
        setSlots(old => ({ ...old, [day]: data?.slots })))
      .catch((e) => console.warn(e.message));

    for (let i = today + 1; i <= lastDay; i++) {
      console.log(`>> restaurant:${restaurant}, day:${i}`);
      await req(i, people);
    }
    setSearching(false);
    setFinished(true);
  };

  const handleRunBatch = (name, people) => async () => {
    console.log(`>> batch for restaurant:${name} for ${people}`);
    setCode(name);
    const isEarly = (restaurants.find(r => r.code === name) || {}).isEarly || false;
    await requestBatch(name, people, isEarly);
  }

  const handleDiners = (num) => () => setDiners(num);

  return (
    <div className='container'>
      <div className='diners'>
        Diners:
        <div className={`button ${diners === 2 && 'clicked'}`} onClick={handleDiners(2)}>2</div>/
        <div className={`button ${diners === 4 && 'clicked'}`} onClick={handleDiners(4)}>4</div>
      </div>
      <div className='buttons'>
        {diners > 0 && <div>Restaurants:</div>}
        {diners > 0 && restaurants.map(r =>
          <div key={r.code} className={`button ${code === r.code && 'clicked'}`}
            onClick={handleRunBatch(r.code, diners)}>{r.name}</div>)}
      </div>
      <div className='results'>
        {diners > 0 && Object.keys(slots).length > 0
          ? <div className='title'>Found {Object.keys(slots).length} slots:</div>
          : finished && <div className='title'>No slots found ???</div>}
        {Object.keys(slots).map(k =>
          <div key={k}>
            <div className='date'>{k}/4/22</div>
            {(slots[k] || [])?.map(s => s.time)
              .filter((val, ind, self) => self.indexOf(val) === ind)
              .map(s => <div key={s}> - {s}</div>)}
          </div>)}
      </div>
      {searching && <div className='searching'>Searching..</div>}
    </div>
  );
}

export default App;
