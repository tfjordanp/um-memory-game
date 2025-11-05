import { useContext, type JSX } from "react";
import GameModelContext from "../contexts/GameModelContext";

import { type MemoryGameCard, MemoryGame } from '../models/MemoryGame';


interface CardParams{
  style?: React.CSSProperties;
  children: JSX.Element;
  id: string;
  card: MemoryGameCard;
};

function Card({children,style,id,card} : CardParams){
  const [ col , row ]= card.position;
  const defaultStyle: React.CSSProperties = {
    gridColumn: col+1,
    gridRow: row+1,
  };
  return (
    <button tabIndex={row*3 + col} style={Object.assign(defaultStyle,style)} id={id}>
      {children}
    </button>
  );
}

export default Card;