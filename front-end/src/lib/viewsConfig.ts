export const viewStyles = {
  1: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr',
    gridColumn: ['1']
  },
  2: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: '1fr 1fr',
    gridColumn: ['1', '1']
  },
  3: {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gridColumn: ['1 / 3', '1', '2'] 
  },
  4: {
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gridColumn: ['1', '2', '1', '2']
  },
  5: {
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr', 
    gridTemplateRows: '1fr 1fr',   
    gridColumn: ['1 / 3', '3 / 5', '5 / 7', '1 / 4', '4 / 7'] 
  },
  6: {
    gridTemplateColumns: '1fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gridColumn: ['1', '2', '3', '1', '2', '3']
  }
} as const;

export type ViewCount = 1 | 2 | 3 | 4 | 5 | 6;