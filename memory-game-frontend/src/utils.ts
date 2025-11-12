import { useState, useRef, useEffect, type EffectCallback } from "react";

export async function delay(ms:number) {
    return new Promise((resolve) => {
        if (Math.abs(ms) === Infinity)  return ;

        setTimeout(resolve,ms);
    });
}

export function useModalState(defaultValue:boolean){
    const [ show , setShow ] = useState(defaultValue);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    return { show, setShow, handleClose, handleShow};
}

export function useOnMountUnsafe(effect: EffectCallback) {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      effect()
    }
  }, [])
}

export function useBackButton(handlePopstate: (e: PopStateEvent) => void){
  useOnMountUnsafe(() => {
    window.addEventListener("popstate", handlePopstate);
    console.log('popstate mounted');
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  });

};


/*async function preDecorator<T extends (...p:any)=>any>(func:T,decorator: (...args:Parameters<T>)=>Promise<void>,...args:Parameters<T>){
  await decorator(...args);
  return func(...args);
}*/

function preDecoratorSync<T extends (...p:any)=>any>(func:T,decorator: (...args:Parameters<T>)=>void){
  return (...args:Parameters<T>) => {
    decorator(...args);
    return func(...args);
  }
}