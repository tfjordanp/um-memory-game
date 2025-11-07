import { useState } from "react";

export async function delay(ms:number) {
    if (Math.abs(ms) === Infinity)  return ;
    return new Promise((resolve) => {
        setTimeout(resolve,ms);
    });
}

export function useModalState(defaultValue:boolean){
    const [ show , setShow ] = useState(defaultValue);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return { show, setShow, handleClose, handleShow};
}
