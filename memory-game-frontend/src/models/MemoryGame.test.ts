import { MemoryGame, type MemoryGameCard, type MemoryGameBlueprint } from "./MemoryGame.ts";

import 'mocha';
import { assert } from 'chai';

const initGameBlueprint: MemoryGameBlueprint = {cards: [
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
    {count:2,consecutiveErrorsAllowed:0,penalizeType: 'current'},
],penalizeOnNullCards: false};

const initGame = new MemoryGame(initGameBlueprint);

describe('MemoryGame Init State Tests',() => {
    it('Should create a game state with all cards having different positions',() => {
        const game = initGame;

        assert.strictEqual(
            [ ...new Set(game.getCardsPositions()) ].toSorted().toString() , 
            game.getCardsPositions().toSorted().toString(),
            'All cards positions should be distinct'
        );
    });

    it('Should create a game state with expected grid size or order',() => {
        const game = initGame;

        assert.strictEqual(
            game.getGridOrder(), 
            9,
            'Grid order should be #9'
        );
    });

    it('Should create a game state with expected total cards count',() => {
        const game = initGame;

        assert.strictEqual(
            game.getTotalCardsCount(), 
            8,
            'Total cards count should be #8'
        );
    });

    it('Should create a game state with expected total cards count from #getCards',() => {
        const game = initGame;

        assert.strictEqual(
            game.getCards().length, 
            8,
            'getCards.length should be #8'
        );
    });

    it('Should create a game state with expected total cards count from #getCardsPositions',() => {
        const game = initGame;

        assert.strictEqual(
            game.getCardsPositions().length, 
            8,
            'getCardsPositions.length should be #8'
        );
    });

    it('Should create a game state with 0 cards opened when queried from #getBlueprintOfOpenedCards',() => {
        const game = initGame;

        assert.strictEqual(
            game.getBlueprintOfOpenedCards(), 
            null,
            'No cards should be opened at creation'
        );
    });

    it('Should create a game state with 0 cards opened when queried from #isOpenedCard',() => {
        const game = initGame;

        for (const positions of game.getCardsPositions()){
            const [x,y] = MemoryGame.keyToPostion(positions);
            assert.strictEqual(
                game.isOpenedCard(x,y), 
                false,
                'No cards should be opened at creation'
            );
        }
        
    });

    it('Should create a game state with each cards blueprints having 0 cards opened',() => {
        const game = initGame;
        const gameBlueprint = initGameBlueprint;

        for (const cardBlueprint of gameBlueprint.cards){
            assert.strictEqual(
                game.getCountOfOpenedCards(cardBlueprint),
                0,
                'No cards should be opened at creation'
            );
        }
        
    });

});

describe('MemoryGame State Mutation Tests',() => {

    it('Should always guarantee openning a card after init never fails',async () => {
        const game = new MemoryGame(initGameBlueprint);

        const pos1 = MemoryGame.keyToPostion(game.getCardsPositions()[0]);

        game.setEventListeners({openCard: async (x,y)=>console.log('open'),closeCard:  async (x,y)=>console.log('close'),penalized:  async ()=>console.log('pen')});

        await game.openCard(...pos1);

        assert.strictEqual(
            game.isOpenedCard(...pos1) , 
            true,
            'Should open first card'
        );
    });

    it('Should always close an opened card upon a #openCard call',async () => {
        const game = initGame;

        const pos1 = MemoryGame.keyToPostion(game.getCardsPositions()[0])

        await game.openCard(...pos1);
        await game.openCard(...pos1);

        assert.strictEqual(
            game.isOpenedCard(...pos1) , 
            false,
            'Should close first card'
        );
    });


    it('Should always close an opened card upon a #openCard call',async () => {
        const game = initGame;

        const pos1 = MemoryGame.keyToPostion(game.getCardsPositions()[0])

        await game.openCard(...pos1);
        await game.openCard(...pos1);

        assert.strictEqual(
            game.isOpenedCard(...pos1) , 
            false,
            'Should close first card'
        );

        assert.strictEqual(
            game.getBlueprintOfOpenedCards(),
            null,
            'At this point, the grid should be closed'
        );
    });

    it('Should not be able to close an already winning card',async () => {
        const game = initGame;

        const firstTypeCards = game.getCards().filter(card => card.blueprint === initGameBlueprint.cards[0]);

        for (const card of firstTypeCards){
            await game.openCard(...card.position);
            assert.strictEqual(card.visible, true,'The card should open');
        }

        for (const card of firstTypeCards){
            await game.openCard(...card.position);
            assert.strictEqual(card.visible, true,'The winning card should be visible even though it was requested to close');
        }
        
    });

    /*it('Should always close all instances of the current opened card when a wrong card was opened',async () => {
        const game = initGame;

        const pos1 = game.getCards()[0].position;

        const pos2 = game.getCards().find(card => card.blueprint !== game.getCards()[0].blueprint)?.position as [number,number];

        const firstTypeCards = game.getCards().filter(card => card.blueprint === initGameBlueprint.cards[0]);

        for (const card of firstTypeCards){
            game.openCard(...card.position);
        }

        await game.openCard(...pos1);
        await game.openCard(...pos2);

        assert.strictEqual(game.getBlueprintOfOpenedCards(), null,'The grid should be closed');
    });*/

/*
won cards should not be closed,
or what if the could be depending on some level blueprint like
onError do nothing , or close everything or just close failed card, or
close failed + 1,2,3 or more completed cards, ???
*/

/*
Enable opening several types of a card at once to complete them together ??
*/



});

