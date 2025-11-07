import type React from "react";

import './menu.css';
import './menu-animated-background.css';
import Marquee from "react-fast-marquee";
import { useNavigate } from "react-router-dom";


function AnimatedBackground({style}:{style?:React.CSSProperties}){
    return (
        <div className="wrapper" style={style}>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
            <div><span className="dot"></span></div>
        </div>
    );
}


import { useModalState } from "../utils";

import 'bootstrap/dist/css/bootstrap.min.css';
import OptionsModal from "../components/options-modal";

function Menu(){
    const rootLayoutStyles:React.CSSProperties = {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: '3rem'

    };
    const layoutStyles:React.CSSProperties = {
        height: '70%',
        width: '95%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: '2rem'
    };

    const buttonStyles:React.CSSProperties = {
        flex: 1,
        width:'100%',
        fontFamily:'monospace',
        fontSize:'2rem',
        borderStyle: 'solid',
        borderColor: 'pink',
        borderWidth: '4px',
        opacity: '0.7',
    };

    const stackStyles: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    };

    const nav = useNavigate();

    const optionsModalState = useModalState(false);

    return (
        <div style={{position: 'relative',top: 0,left: 0,width: '100%',height: '100%',overflow: 'hidden'}}>
            <AnimatedBackground style={stackStyles}/>
            <div style={{...rootLayoutStyles,...stackStyles}}>
                <div style={{fontFamily:'cursive',fontSize: '4rem'}}>GEMÖ</div>
                <div style={layoutStyles}>
                    {
                        [['PLAY','/game'],['AI SIMULATION','/game'],['OPTIONS'],['ABOUT']]
                        .map(
                            ([label,route],i) => 
                                <button key={i} className='menu-button' style={buttonStyles} onClick={e => {
                                    if (label === 'OPTIONS')    optionsModalState.setShow(true);
                                    if (!route)     return ;
                                    nav(route);
                                }}>
                                    {label}
                                </button>
                        )
                    }
                </div>
                <Marquee style={{fontFamily: 'sans-serif'}} pauseOnClick={true}>Written by Tchinda Jordan, Nov 2025</Marquee>
                <OptionsModal {...optionsModalState}/>
            </div>
        </div>
        
    );
}

export default Menu;