import { delay } from "../utils";
import type { MemoryGame, MemoryGameCard } from "./MemoryGame";
import { difference, sample } from 'lodash';


export async function play(model: MemoryGame,memoryFaculty: number = 0.5,signal?: AbortSignal){
    console.log('PLAY CALLED');
    let nonWinningCards = model.getCards().filter(card => !model.isWinningCard(card.blueprint));
    
    if (nonWinningCards.length === 0)   return ;
    
    let memory: MemoryGameCard[] = [];
    //let penalized = false;

    /*model.setEventListeners({
        penalized: async () => {penalized = true;}
    });*/



    while(!model.hasWonGame() && !signal?.aborted){
        nonWinningCards = model.getCards().filter(card => !model.isWinningCard(card.blueprint));    //length cannot be 0 if model.hasWonGame is not true
        memory = memory.filter(card => !model.isWinningCard(card.blueprint));
        
        const nonOpenedCards = nonWinningCards.filter(card => !card.visible);
        const openedCards = nonWinningCards.filter(card => card.visible);

        if (openedCards.length > 0){
            const blueprintOfOpenedCards = openedCards[0].blueprint;
            const inMemory = memory.filter(card => card.blueprint === blueprintOfOpenedCards);
            
            if (inMemory.length === openedCards.length){        //memory knowledge is already used
                //try a random and nonOpened card
                const list = difference(nonOpenedCards,memory);
                const card = sample(list) as MemoryGameCard;

                await delay(list.length === 1 ? 400 : 1500);
                await model.openCard(...card.position);
                
                if (Math.random() < memoryFaculty){
                    memory.push(card);
                    console.log('Actually memorized');
                }
            }
            else{
                //use all memory knowledge
                for (const card of inMemory){
                    if (!card.visible){
                        await delay(750);
                        await model.openCard(...card.position);
                    }
                }
                if (model.isWinningCard(blueprintOfOpenedCards))    continue;
                //memory knowledge is already used, but still not enough

                //try a random and nonOpened card
                const list = difference(nonOpenedCards,memory);
                const card = sample(list) as MemoryGameCard;

                await delay(list.length === 1 ? 400 : 1500);
                await model.openCard(...card.position);
                
                if (Math.random() < memoryFaculty){
                    memory.push(card);
                    console.log('Actually memorized');
                }
            }
            continue ;
        }

        /// No cards is opened


        let card: MemoryGameCard;
        if (memory.length === 0){
            card = sample(nonOpenedCards) as MemoryGameCard;
            console.log('Empty, selected random card');
            await delay(nonOpenedCards.length === 1 ? 400 : 1500);
        }
        else{
            const toCompleteBlueprint = (sample(memory) as MemoryGameCard).blueprint;
            const cards = memory.filter(card => card.blueprint === toCompleteBlueprint);
            console.log('Not Empty, selected random blueprint to complete',toCompleteBlueprint);
            for (const card of cards){
                await delay(700);
                await model.openCard(...card.position);
                console.log('Opened blueprint card');
            }
            
            if (model.isWinningCard(toCompleteBlueprint)){
                console.log('Blueprint complete');
                continue;
            }

            console.log('On random card, to complete blueprint');
            const list = difference(nonWinningCards,memory);
            card = sample(list) as MemoryGameCard;
            await delay(list.length === 1 ? 400 : 1500);
        }

        //penalized = false;
        await model.openCard(...card.position);
        console.log('Random opened');

        console.log('On memorize');
        if (Math.random() < memoryFaculty){
            memory.push(card);
            console.log('Actually memorized');
        }
        console.log('On memorize complete');
    }
}
