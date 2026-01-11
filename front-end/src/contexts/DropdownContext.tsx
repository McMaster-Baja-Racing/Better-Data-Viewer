import { createContext, useContext, useState, ReactNode } from 'react';

interface DropdownContextProps {
  openDropdownId: string | null;
  setOpenDropdown: (id: string | null) => void;
}

const DropdownContext = createContext<DropdownContextProps | undefined>(undefined);

export const DropdownProvider = ({ children }: { children: ReactNode }) => {
  const [openDropdownId, setOpenDropdown] = useState<string | null>(null);

  return (
    <DropdownContext.Provider value={{ openDropdownId, setOpenDropdown }}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  return context!;
};
