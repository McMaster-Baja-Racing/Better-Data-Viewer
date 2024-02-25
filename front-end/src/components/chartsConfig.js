// This file specifies the styles for the various number of Graphs that can be displayed on the front-end.
const chartStyles = {
    1: {
        display: 'grid',
        gridTemplateRows: '1fr',
        gridTemplateColumns: '1fr',
        gridColumn: [""]
    },
    2: {
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gridTemplateColumns: '1fr',
        gridColumn: ["", ""]
    },
    3: {
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gridTemplateColumns: '1fr 1fr',
        gridColumn: ["1/3", "", ""]
    },
    4: {
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridColumn: ["1/4", "", "", ""]
    },
    5: {
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
        gridColumn: ["1/4", "4/7", "1/3", "3/5", "5/7"]
    },
    6: {
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridColumn: ["", "", "", "", "", ""]
    },
};

export default chartStyles;