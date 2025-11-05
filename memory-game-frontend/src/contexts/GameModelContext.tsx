import { createContext } from 'react';
import { MemoryGame } from '../models/MemoryGame.ts';

const GameModelContext = createContext(new MemoryGame({cards:[],penalizeOnNullCards:true}));

export default GameModelContext;
