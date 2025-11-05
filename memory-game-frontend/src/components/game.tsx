import { useMemo } from 'react';
import { MemoryGame, type MemoryGameBlueprint } from '../models/MemoryGame';

import GameModelContext from '../contexts/GameModelContext';
import Board from '../components/board';
import Card from '../components/card';

interface GameParams{
  /*style?: React.CSSProperties;*/
  blueprint: MemoryGameBlueprint;
};

function Game({blueprint}:GameParams){
  const gameModel = useMemo(() => new MemoryGame(blueprint),[]);

  return (
    <GameModelContext.Provider value={gameModel}>
      <Board>
        {
          gameModel.getCards().map((card,i) => 
            <Card id={i+''} card={card}><span>{blueprint.cards.indexOf(card.blueprint)+1}</span></Card>
          )
        }
      </Board>
    </GameModelContext.Provider>
  )
}

export default Game;
