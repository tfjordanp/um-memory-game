import './App.css';

import { type MemoryGameBlueprint } from './models/MemoryGame';

import Game from './components/game';


const blueprint:MemoryGameBlueprint =  {cards: [
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
],penalizeOnNullCards: true};

function App() {
  return (
    <Game blueprint={blueprint} />
  )
}

export default App
