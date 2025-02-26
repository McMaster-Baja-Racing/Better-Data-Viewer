import styles from './dataSelect.module.scss';
import { Dropdown } from '@components/dropdown/Dropdown';
import { icons } from '@lib/assets';

interface dataSelectProps {
    sources: string[];
    dataTypes: string[];
}

export function dataSelect({ sources, dataTypes }: Readonly<dataSelectProps>) {

};