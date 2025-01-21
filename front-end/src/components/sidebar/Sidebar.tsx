import './Sidebar.module.scss';
import cx from 'classnames';
import { useState } from 'react';
import bajaLogo from '@assets/baja_logo.svg'
import homeIcon from '@assets/icons/home.svg';

// defines the properties of an item in the sidebar
type SidebarItem = {
    icon: string;
    name: string;
    onClick: () => void;
}

const Sidebar = () => {
    // controls the open or closed state of the sidebar
    const [isOpen, setIsOpen] = useState(false);
    
    // list the items that will be displayed in the sidebar
    const items: SidebarItem[] = [
        {
            icon: homeIcon,
            name: 'Home',
            onClick: () => console.log('Home clicked')
        }
    ]

    const buttonizeItem = (item: SidebarItem, index: number) => {
        return (
            <button key={index} onClick={item.onClick}>
                <img src={item.icon} alt={item.name} />
                <span>{item.name}</span>
            </button>
        )
    }

    return (
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
            <img src={bajaLogo} alt='Baja Logo' />
            {items.map((item, index) => buttonizeItem(item, index))}
        </div>
    )
}