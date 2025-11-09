import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

import type { useModalState } from '../utils';
import { useContext, useEffect } from 'react';
import AppModelContext from '../context/AppModelContext';
import { useNavigate } from 'react-router-dom';

import './win-modal.css';
import { useLocalStorage } from 'usehooks-ts';
import { produce } from 'immer';
import { localStorageKey } from '../KEYS';

interface WinModalParams{
    state: ReturnType<typeof useModalState>;
    actionsCount: number;
    level?: string;
}

interface GemoPersistStorage{
    records: {ac:number,level:string,isAI: boolean,aiLevel:number}[];
};

function WinModal({state:{show,handleClose},actionsCount:ac,level=''}:WinModalParams){
    const appModel = useContext(AppModelContext);
    const navigate = useNavigate();

    const [ value, setValue ] = useLocalStorage(localStorageKey,{records:[]} as GemoPersistStorage);

    useEffect(() => {
        if (show === false)     return ;

        const nextState = produce(value, draftState => {
            draftState.records.push({ac,level,isAI: appModel?.state.aiMode ?? false,aiLevel: appModel?.state.aiLevel || 0});
        });

        setValue(nextState);

    },[show]);

    return (
        <Modal size='sm' backdrop='static' show={show} onHide={handleClose} centered style={{userSelect: 'none'}}>
            <Modal.Header>
                <Modal.Title className='cool-shake'>Well done !!</Modal.Title>
            </Modal.Header>
            
            <Modal.Body style={{overflow: 'auto',height: '576px'}} className='soft-shake'>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Actions</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            value.records.toSorted((rec1,rec2) => rec1.ac - rec2.ac)
                            .map((rec,i) => 
                                <tr key={i}>
                                    <td>{i+1}</td>
                                    <td>{rec.ac}</td>
                                    <td>{rec.isAI ? `By AI - ${rec.aiLevel*100}%` : 'By Me'}</td>
                                </tr>
                            )
                        }
                    </tbody>
                </Table>
            </Modal.Body>
            
            <Modal.Footer>
                <Button variant="secondary" onClick={e => {
                    handleClose();
                    navigate('/menu/');
                }}>
                    Quit To Menu
                </Button>
                
                <Button variant="primary" onClick={async e => {
                    handleClose();
                    await navigate('/menu/');
                    await navigate('/game/');
                }}>
                    Play Again
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default WinModal;