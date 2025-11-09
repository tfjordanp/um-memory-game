
import { useNavigate } from 'react-router-dom';
import Game from '../components/game';
import './game-animated-background.css';

import { useMemo } from 'react';

import music from '../assets/music/music.ogg';
import { useOnMountUnsafe } from '../utils';
import { useAudioPlayer } from 'react-use-audio-player';

function AnimatedBackground({style}:{style?:React.CSSProperties}){
    return (
        <div className='game-background' style={{...style}}/>
    );
}

function GamePage({...gameProps}:Parameters<typeof Game>[0]){
    const stackStyles: React.CSSProperties = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
    };
    const controller = useMemo(() => new AbortController(),[]);
    const navigate = useNavigate();

    const { play, stop } = useAudioPlayer(music,{autoplay:true,loop:true,initialVolume: 0.75,initialRate: 1});

    useOnMountUnsafe(() => {
        play();
        return stop;
    });

    return (
        <div style={{position: 'relative',top: 0,left: 0, width: '100%',height: '100%',overflow:'hidden'}}>
            <AnimatedBackground style={{...stackStyles}}/>
            <div style={{display: 'flex',flexDirection: 'column',justifyContent: 'center',alignItems: 'center', ...stackStyles}}>
                <Game signal={controller.signal} {...gameProps} />
                <button style={{width: '80%',marginTop: '5rem'}} onClick={e => {
                    if (!confirm('Do you really want to quit the party ?\nAll progress shall be lost !!')){
                        navigate('/game/');
                        return ;
                    }
                    
                    controller.abort('reason');
                    navigate('/menu/');
                }}>BACK</button>
            </div>
        </div>
    );
}

export default GamePage;