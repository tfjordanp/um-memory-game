import './App.css';

import { type MemoryGameBlueprint } from './models/MemoryGame';

import Menu from './pages/menu';

import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useState } from 'react';
import AppModelContext from './context/AppModelContext';
import GamePage from './pages/game-page';

/*
const blueprint:MemoryGameBlueprint =  {cards: [
    {count:3,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:3,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:3,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:3,consecutiveErrorsAllowed:0,penalizeType: 'current'},
],penalizeOnNullCards: true};
*/

const blueprint:MemoryGameBlueprint =  {cards: [
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
],penalizeOnNullCards: true};

const colors = [
  'red',
  'green',
  'blue',
  'violet',
  'brown',
  'orange'
]

interface AppModel{
  audioEnabled: boolean;
  aiMode: boolean;
};



function App() {
  const [ state , setState ] = useState<AppModel>({
    audioEnabled: false,
    aiMode: false,
  });

  return (
    <AppModelContext.Provider value={{state,setState}}>
      <div style={{width: '100vw',height: '100vh',display: 'flex',justifyContent:'center',userSelect: 'none'}}>
        <div style={{width: '100%',height: '100%',maxWidth: '1024px',display: 'flex',justifyContent: 'center',alignItems:'center'}}>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Navigate to='/menu'/>}/>
              <Route path='/menu' element={<Menu />}/>
              <Route path='/game' element={
                <GamePage cardCSSBackgrounds={colors} nullCardCSSBackground='' hiddenCardCSSBackground='black' blueprint={blueprint} />
              }/>
            </Routes>
          </BrowserRouter>
        </div>
      </div>
    </AppModelContext.Provider>
    
    
  );
}

export default App;
export { type AppModel };