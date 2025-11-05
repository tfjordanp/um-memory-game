import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MemoryGame, type MemoryGameBlueprint } from '../models/MemoryGame';

import GameModelContext from '../contexts/GameModelContext';
import Board from '../components/board';
import Card from '../components/card';

import { delay } from '../utils';

import './game.css';

interface GameParams{
  /*style?: React.CSSProperties;*/
  blueprint: MemoryGameBlueprint;
  
  hiddenCardCSSBackground: string;
  cardCSSBackgrounds: string[];
  nullCardCSSBackground: string;
};

function Game({blueprint,hiddenCardCSSBackground,cardCSSBackgrounds,nullCardCSSBackground}:GameParams){
  const gameModel = useMemo(() => new MemoryGame(blueprint),[blueprint]);

  const cardElements = Array.from(
    { length: gameModel.getTotalCardsCount() },
    () => useRef<HTMLButtonElement | null>(null)
  );

  const [ _ , update ] = useState(false);

  const refreshGUI = useCallback(async () => {
    update(val => !val);
    await delay(0);
  },[]);

  const [ allCardsDisabled, setAllCardsDisabled ] = useState(false);

  const playCardAnimation = async (x:number,y:number) => {
        const card = gameModel.findCard(x,y);

        const blueprintIndex = blueprint.cards.indexOf(card.blueprint);
        const background = card.visible ? cardCSSBackgrounds[blueprintIndex] : hiddenCardCSSBackground;

        const indexInGetCards = gameModel.getCards().findIndex(cardI => card === cardI);
        const element = cardElements[indexInGetCards].current;

        if (!element)   return ;

        
        //console.log(element.style.background);

        await element.animate([
            { transform: 'scaleX(1)' },          // Starting state
            { transform: 'scaleX(0)' },      // Halfway state
        ], {
            duration: 500,      // Duration of the animation in milliseconds
            easing: 'ease-in-out' // Easing function for smooth animation
        }).finished;

        //console.log(element?.style.background);

        element.style.background = background;

        await element.animate([
            { transform: 'scaleX(0)' },          // Starting state
            { transform: 'scaleX(1)' },      // Halfway state
        ], {
            duration: 500,      // Duration of the animation in milliseconds
            easing: 'ease-in-out' // Easing function for smooth animation
        }).finished;
    };

  useEffect(() => {
    gameModel.setEventListeners({
        openCard: playCardAnimation,
        closeCard: playCardAnimation,

    });
  },[gameModel]);

  const boardStyles:React.CSSProperties = {
    width: '400px',
    height: '400px',
    borderStyle: 'double',
    borderWidth: '10px',
    borderRadius: '20px',
    padding: '1rem',
    gap: '1rem',
  };

  const cardStyles: React.CSSProperties = {
    borderStyle: 'none',
  };

  /*
    highlight winning cards !!
  */

    /*
      ISSUE, announces player has won before finishing turning card animation --SOLVED
      By making sure 2 openCards are never active at the same time, i.e in a pure synchronous fashion !!!
      Ensures good function.
      Perspectives: enable user to manipulate several cards simultaneously(opening or closing one when another one's animation is still running) + keep correctness
    */


  return (
    <GameModelContext.Provider value={gameModel}>
      <Board style={boardStyles}>
        {
          gameModel.getCards().map((card,i) => {
            const blueprintIndex = blueprint.cards.indexOf(card.blueprint);
            const background = card.visible ? cardCSSBackgrounds[blueprintIndex] : hiddenCardCSSBackground;

            return (
                <Card 
                    key={i}
                    card={card} 
                    style={{...cardStyles,background,cursor: allCardsDisabled ? 'not-allowed': 'pointer'}}
                    className='game-card'
                    onClick={async e => {
                        setAllCardsDisabled(true);

                        await refreshGUI();

                        await gameModel.openCard(...card.position);
                        //await refreshGUI();

                        console.log('Animations done');

                        if (gameModel.hasWonGame()){
                            alert('BINGO');
                        }

                        setAllCardsDisabled(false);
                    }}
                    ref={cardElements[i]}
                    disabled={allCardsDisabled}
                >
                    <></>
                </Card>
            );
          })
        }
      </Board>
    </GameModelContext.Provider>
  )
}

export default Game;
