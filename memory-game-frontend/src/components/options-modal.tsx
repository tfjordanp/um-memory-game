import Modal from 'react-bootstrap/Modal';
import type { useModalState } from '../utils';
import Form from 'react-bootstrap/Form';
import { useContext } from 'react';
import AppModelContext from '../context/AppModelContext';


function OptionsModal({show,handleClose}:ReturnType<typeof useModalState>){
    const appModel = useContext(AppModelContext);
    return (
        <Modal show={show} onHide={handleClose} centered style={{userSelect: 'none'}}>
            <Modal.Header closeButton>
                <Modal.Title>Configuration</Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                <Form.Check // prettier-ignore
                    type="switch"
                >
                    <Form.Check.Input checked={appModel?.state?.audioEnabled} style={{width: '5rem',height: '2.5rem'}} id='audio-switch' onChange={e => appModel?.setState(model => ({...model, audioEnabled: !model?.audioEnabled}))} />
                    <Form.Check.Label style={{fontSize: '2rem',paddingLeft: '5.5rem',paddingRight: '5.5rem'}} htmlFor='audio-switch'>{appModel?.state?.audioEnabled ? "Turn off audio" : "Turn on audio"}</Form.Check.Label>
               </Form.Check> 
            </Modal.Body>
            
            {/*<Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
                
                <Button variant="primary" onClick={handleClose}>
                    Save Changes
                </Button>
            </Modal.Footer>*/}
        </Modal>
    );
}

export default OptionsModal;