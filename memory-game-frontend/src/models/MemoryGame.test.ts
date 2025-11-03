import { MemoryGame } from "./MemoryGame.ts";

import 'mocha';
import { assert } from 'chai';

describe('MemoryGame Init State Tests',() => {
    const initGame = new MemoryGame({cards: [
            {count:2,consecutiveErrorsAllowed:0},
            {count:2,consecutiveErrorsAllowed:0},
            {count:2,consecutiveErrorsAllowed:0},
            {count:2,consecutiveErrorsAllowed:0},
        ],penalizeOnNullCards: false});
    

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

});



