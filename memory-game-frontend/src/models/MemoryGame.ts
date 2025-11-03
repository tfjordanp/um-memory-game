
interface MemoryGameBlueprintCard{
    count: number;
    consecutiveErrorsAllowed: number;
    //position
    //maxopen time
}

interface MemoryGameBlueprint{
    cards: MemoryGameBlueprintCard[];
    penalizeOnNullCards: boolean;   //could be a count like consecutiveErrorsAllowed
}


interface MemoryGameCard{
    blueprint: MemoryGameBlueprintCard;
    visible: boolean;
    position: [number,number];
}

interface MemoryGameEvents{
    closeCard?: (x:number,y:number) => Promise<void>;
    openCard?: (x:number,y:number) => Promise<void>;
    penalized?: (cardBlueprint: MemoryGameBlueprintCard) => Promise<void>
}

class MemoryGame{
    private blueprint: MemoryGameBlueprint;
    private board: Record<string,MemoryGameCard>;
    private errorsCount: number;
    private events: MemoryGameEvents;

    static positionToKey([x,y]:[number,number]):string{
        return [x,y].toString();
    }
    static keyToPostion(key:string):[number,number]{
        const [x,y] = key.split(',').map(Number);
        return [x,y];
    }
    
    constructor(blueprint:typeof this.blueprint){
        this.blueprint = blueprint;
        this.board = {};
        this.errorsCount = 0;
        this.events = {};
        
        for (let i = 0 ; i < blueprint.cards.length; ++i ){
            const cardBlueprint = blueprint.cards[i];

            const newPositionKey = MemoryGame.positionToKey([
                Math.floor(Math.random() * this.getGridOrder()), 
                Math.floor(Math.random() * this.getGridOrder())
            ]);

            if (!this.board[newPositionKey])   this.board[newPositionKey] = {
                blueprint: cardBlueprint,
                visible: false,
                position: MemoryGame.keyToPostion(newPositionKey)
            };
            else    --i;        //Repeat initial position selection !!
        }
    }

    //Getters
    getGridOrder(){
        return Math.ceil(Math.sqrt(this.getTotalCardsCount()))**2;
    }

    getTotalCardsCount(){
        return this.blueprint.cards.map(c => c.count).reduce((acc,val)=>acc+val);
    }

    getCardsPositions(){
        return Object.keys(this.board);
    }

    //Changing Getters
    getBlueprintOfOpenedCards(): MemoryGameBlueprintCard | null{
        return Object.values(this.board).find(card => card.visible)?.blueprint || null;
    }

    isOpenedCard(x:number,y:number):boolean{
        this.boardIndexValidation(x,y);

        const index = [x,y].toString();

        return this.board[index]?.visible || false;
    }


    setEventListeners(events:MemoryGameEvents){
        Object.assign(this.events,events);
        return this;
    }

    //Mutators
    private async closeAllCards(){
        Object.entries(this.board).forEach(async ([index,card]) => {
            card.visible = false;
            //emit
            const [x,y] = index.split(',').map(Number);
            await this.events.closeCard?.(x,y);
        });
        return this;
    }

    async openCard(x:number,y:number){
        this.boardIndexValidation(x,y);

        const index = [x,y].toString();

        const card = this.board[index];

        if (!card){
            if (this.blueprint.penalizeOnNullCards){
                await this.closeAllCards();
            }
            return this;
        }

        const blueprintOfCurrent = this.getBlueprintOfOpenedCards();

        if (blueprintOfCurrent === card.blueprint){
            card.visible = !card.visible;       //Flip !! player intention is to annul open
            if (card.visible){
                await this.events.openCard?.(x,y);
            }
            else{
                await this.events.closeCard?.(x,y);
            }
            return this;
        }

        card.visible = true;
        await this.events.openCard?.(x,y);
        
        if (blueprintOfCurrent === null){
            this.errorsCount = 0;
            return this;
        }

        //if (blueprintOfCurrent !== card.blueprint)
        
        ++this.errorsCount;

        if (this.errorsCount > blueprintOfCurrent.consecutiveErrorsAllowed){
            await this.events.penalized?.(blueprintOfCurrent);
            await this.closeAllCards();
        }

        return this;
    }

    //Events


    private boardIndexValidation(x:number,y:number){
        if (x < 0 && x >= this.getGridOrder()){
            throw Error('x should be in the range [0,gridOrder)');
        } 
        if (y < 0 && y >= this.getGridOrder()){
            throw Error('y should be in the range [0,gridOrder)');
        }
    }
}

export { MemoryGame , type MemoryGameBlueprint, };