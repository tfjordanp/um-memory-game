
interface MemoryGameCardBlueprint{
    count: number;
    consecutiveErrorsAllowed: number;
    penalizeType: 'all' | 'current';

    //position
    //maxopen time
}

interface MemoryGameBlueprint{
    cards: MemoryGameCardBlueprint[];
    penalizeOnNullCards: boolean;   //could be a count like consecutiveErrorsAllowed
}


interface MemoryGameCardStruct{
    blueprint: MemoryGameCardBlueprint;
    visible: boolean;
    position: [number,number];
}

class MemoryGameCard{
    protected value: MemoryGameCardStruct;

    constructor(value:MemoryGameCardStruct){
        this.value = value;
    }

    get blueprint(){
        return this.value.blueprint;
    }
    get visible(){
        return this.value.visible;
    }
    get position(){
        return this.value.position;
    }

    toId(){
        return MemoryGame.positionToKey(this.position);
    }
}

class MemoryGameCardP extends MemoryGameCard{
    constructor(value:MemoryGameCardStruct){
        super(value);
    }

    get blueprint(){
        return this.value.blueprint;
    }
    get visible(){
        return this.value.visible;
    }
    get position(){
        return this.value.position;
    }

    set blueprint(val:typeof this.value.blueprint){
        this.value.blueprint = val;
    }
    set visible(val:typeof this.value.visible){
        this.value.visible = val;
    }
    set position(val:typeof this.value.position){
        this.value.position = val;
    }
}


interface MemoryGameEvents{
    closeCard?: ((x:number,y:number) => Promise<void>) | null;
    openCard?: ((x:number,y:number) => Promise<void>) | null;
    penalized?: ((cardBlueprint: MemoryGameCardBlueprint) => Promise<void>) | null;
    beforeOpenCard?: () => Promise<void> | null;
    afterOpenCard?: () => Promise<void> | null;
    hasWon?: () => Promise<void> | null;
}

class MemoryGame{
    private blueprint: MemoryGameBlueprint;
    private board: Record<string,MemoryGameCardP>;
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

            for (let j = 0; j < cardBlueprint.count; ++j){
                const newPositionKey = MemoryGame.positionToKey([
                    Math.floor(Math.random() * this.getGridOrder()), 
                    Math.floor(Math.random() * this.getGridOrder())
                ]);

                if (!this.board[newPositionKey])   this.board[newPositionKey] = new MemoryGameCardP({
                    blueprint: cardBlueprint,
                    visible: false,
                    position: MemoryGame.keyToPostion(newPositionKey)
                });
                else    --j;        //Repeat initial position selection !!
            }
        }
    }

    //Getters
    getGridOrder(){
        return Math.ceil(Math.sqrt(this.getTotalCardsCount()));
    }

    getTotalCardsCount(){
        return this.blueprint.cards.map(c => c.count).reduce((acc,val)=>acc+val);
    }

    getCardsPositions(){
        return Object.keys(this.board);
    }

    getCards(){
        return Object.values(this.board) as MemoryGameCard[];
    }

    getNullCardsPositions(){
        let positions:string[] = [];
        for (let i = 0 ; i < this.getGridOrder() ; ++i){
            for (let j = 0 ; j < this.getGridOrder() ; ++j){
                const index = MemoryGame.positionToKey([i,j]);
                if (!this.board[index]){
                    positions.push(index);
                }
            }
        }
        return positions;
    }

    findCard(x:number,y:number): MemoryGameCard{
        return this.board[MemoryGame.positionToKey([x,y])];
    }

    //Changing Getters
    getBlueprintOfOpenedCards(): MemoryGameCardBlueprint | null{
        return Object.values(this.board)
        .filter(card => !this.isWinningCard(card.blueprint))
        .find(card => card.visible)?.blueprint || null;
    }

    isOpenedCard(x:number,y:number):boolean{
        this.boardIndexValidation(x,y);

        const index = MemoryGame.positionToKey([x,y]);

        return this.board[index]?.visible || false;
    }

    getCountOfOpenedCards(cardBlueprint: MemoryGameCardBlueprint){
        return this.getCards()
        .filter(card => card.blueprint === cardBlueprint && card.visible === true).length;
    }

    isWinningCard(cardBlueprint: MemoryGameCardBlueprint){
        return this.getCountOfOpenedCards(cardBlueprint) === cardBlueprint.count;
    }

    hasWonGame():boolean{
        for (const cardBlueprint of this.blueprint.cards){
            if (!this.isWinningCard(cardBlueprint))     return false;
        }
        return true;
    }

    setEventListeners(events:MemoryGameEvents){
        Object.assign(this.events,events);
        return this;
    }

    //Mutators
    private async closeAllCards(){
        await Promise.all(Object.entries(this.board).map(async ([index,card]) => {
            if (card.visible === false)     return ;

            card.visible = false;
            //emit
            const [x,y] = MemoryGame.keyToPostion(index);
            await this.events.closeCard?.(x,y);
        }));
        return this;
    }

    private async closeAllUncompletedCards(){
        const completedCardsBlueprints = 
        this.blueprint.cards
        .filter(cardBlueprint => this.getCountOfOpenedCards(cardBlueprint) === cardBlueprint.count);

        await Promise.all(Object.entries(this.board).map(async ([index,card]) => {
            if (completedCardsBlueprints.includes(card.blueprint))      return ;
            
            if (card.visible === false)     return ;
            
            card.visible = false;
            //emit
            const [x,y] = MemoryGame.keyToPostion(index);
            await this.events.closeCard?.(x,y);
        }));
        return this;
    }

    private async _openCard(x:number,y:number){
        
        this.boardIndexValidation(x,y);

        const index = MemoryGame.positionToKey([x,y]);

        const card = this.board[index];

        if (!card){
            if (this.blueprint.penalizeOnNullCards){
                await this.closeAllCards();
            }
            return this;
        }

        if (this.isWinningCard(card.blueprint)){
            return this;
        }
        else{
            await this.events.beforeOpenCard?.();
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
            if (blueprintOfCurrent.penalizeType === 'all'){
                await this.closeAllCards();
            }
            else{       //current
                await this.closeAllUncompletedCards();
            }
            
        }

        return this;
    }

    async openCard(x:number,y:number){
        const result = await this._openCard(x,y);
        
        if (this.hasWonGame()){
            await this.events.hasWon?.();
        }

        await this.events.afterOpenCard?.();

        return result;
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

export { MemoryGame , type MemoryGameBlueprint, MemoryGameCard, type MemoryGameCardBlueprint };