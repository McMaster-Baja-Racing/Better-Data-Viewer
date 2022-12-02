import { useState } from 'react';
import { DropdownButton } from './DropdownButton.js';

function Dropdown( props ) {

    const [ display, setDisplay ] = useState( 'none' )

    function handleClick() {

        if ( display == 'none' ) {

            setDisplay( 'block' )

        } else {

            setDisplay( 'none' )

        }

    }

    return (

        <div>

            

            <div style={{display:display}}>

                { props.children }

            </div>

        </div>

    )

}

export { Dropdown }