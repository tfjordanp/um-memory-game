import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { MemoryGame, type MemoryGameBlueprint } from '../models/MemoryGame';

import GameModelContext from '../context/GameModelContext';
import Board from '../components/board';
import Card from '../components/card';

/*import { CountUp } from "https://cdnjs.cloudflare.com/ajax/libs/countup.js/2.6.0/countUp.min.js";
import { Odometer } from "./odometer.min.js";*/

import { delay, useBackButton, useOnMountUnsafe } from '../utils';

import Odometer from 'react-odometerjs';
import './odometer-theme-slot-machine.css';

import './game.css';
import AppModelContext from '../context/AppModelContext';
import { play } from '../models/AIPlayScript';

interface GameParams{
  /*style?: React.CSSProperties;*/
  blueprint: MemoryGameBlueprint;
  
  hiddenCardCSSBackground: string;
  cardCSSBackgrounds: string[];
  nullCardCSSBackground: string;

  signal?: AbortSignal;
};

function Game({blueprint,hiddenCardCSSBackground,cardCSSBackgrounds,signal}:GameParams){
  const gameModel = useMemo(() => new MemoryGame(blueprint),[blueprint]);

  const cardElements = Array.from(
    { length: gameModel.getTotalCardsCount() },
    () => useRef<HTMLButtonElement | null>(null)
  );

  const [ actionsCount, setActionsCount ] = useState(0);

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

  const playShakeAnimation = async (target: HTMLElement | null) => {
    const magnitude = 5;
      await target?.animate([
          { transform: `translateX(${magnitude}px)` }, 
          { transform: `translateX(-${magnitude}px)` },
          { transform: `translateX(${magnitude}px)` }, 
          { transform: `translateX(-${magnitude}px)` },
          { transform: `translateX(${magnitude}px)` }, 
          { transform: `translateX(-${magnitude}px)` },
      ], {
          duration: 300,      // Duration of the animation in milliseconds
          easing: 'ease-in-out' // Easing function for smooth animation
      }).finished;
  }

  const boardElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gameModel.setEventListeners({
        openCard: playCardAnimation,
        closeCard: playCardAnimation,
        penalized: async _ =>{
          await playShakeAnimation(boardElementRef.current);
        },
        beforeOpenCard: async () => {
          if (appModel?.state.aiMode)   return ;
          setActionsCount(actions => actions + 1);
          await refreshGUI();
          /** HAVING UNEXPECTED VISUAL BEHAVIOR ON AI MODE */
        },
        afterOpenCard: async () => {
          if (appModel?.state.aiMode === false)   return ;
          //AI will never make useless openCard calls
          setActionsCount(actions => actions + 1);
          await refreshGUI();
        },
        hasWon: async () => {
          await refreshGUI();   //for game-card-win animation to take effect
          await delay(2000);    //wait its first cycle
          alert('BINGO');
        }
    });
  },[gameModel]);


  const appModel = useContext(AppModelContext);

  useOnMountUnsafe(() => {
    if (appModel?.state.aiMode){
      play(gameModel,appModel.state.aiLevel,signal);
    }
  });

  const boardStyles:React.CSSProperties = {
    width: '400px',
    height: '400px',
    borderStyle: 'double',
    borderWidth: '10px',
    borderRadius: '20px',
    padding: '1rem',
    gap: '1rem',

    /*Glass Effects */
    /* From https://css.glass */
    background: 'rgba(255, 255, 255, 0.13)',
    /*borderRadius: '16px',*/
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(5.3px)',
    //@ts-ignore
    '-webkit-backdrop-filter': 'blur(5.3px)',
  };

  const cardStyles: React.CSSProperties = {
    borderStyle: 'none',
  };

  /*
    highlight winning cards !! -- DONE
  */

  /*
    ISSUE, announces player has won before finishing turning card animation --SOLVED
    By making sure 2 openCards are never active at the same time, i.e in a pure synchronous fashion !!!
    Ensures good functionning.
    Perspectives: enable user to manipulate several cards simultaneously(opening or closing one when another one's animation is still running) + keep correctness
  */

  return (
    <GameModelContext.Provider value={gameModel}>
      
      <div style={{textAlign: 'center',marginBottom: '1rem',userSelect: 'none',fontSize: '2rem'}}>
        {actionsCount <= 9 && <Odometer value={0} format="ddd" />}
        {actionsCount <= 99 && <Odometer value={0} format="ddd" />}
        <Odometer value={actionsCount} format="ddd" />
      </div>

      <Board style={boardStyles} ref={boardElementRef}>
        {
          gameModel.getCards().map((card,i) => {
            const blueprintIndex = blueprint.cards.indexOf(card.blueprint);
            const background = card.visible ? cardCSSBackgrounds[blueprintIndex] : hiddenCardCSSBackground;
            const blueprintWon = gameModel.isWinningCard(card.blueprint);
            const allCardsDisabledP = allCardsDisabled || blueprintWon || appModel?.state.aiMode;

            return (
                <Card 
                    key={i}
                    card={card} 
                    style={{...cardStyles,background,cursor: allCardsDisabledP ? 'not-allowed': 'pointer'}}
                    className={['game-card',blueprintWon ? 'game-card-win': ''].join(' ')}
                    onClick={ allCardsDisabledP
                      ? async e => {
                        await playShakeAnimation((e.target as HTMLButtonElement));
                      }
                      : async _ => {
                        setAllCardsDisabled(true);
                        await refreshGUI();
                        
                        await gameModel.openCard(...card.position);

                        setAllCardsDisabled(false);
                    }}
                    ref={cardElements[i]}
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
