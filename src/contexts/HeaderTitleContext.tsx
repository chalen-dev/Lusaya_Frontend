import React, { createContext, useContext, useState } from 'react';

interface HeaderTitleContextType {
    title: string;
    setTitle: (title: string) => void;
}

const HeaderTitleContext = createContext<HeaderTitleContextType | undefined>(undefined);

export const HeaderTitleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [title, setTitle] = useState('My App'); // default title

    return (
        <HeaderTitleContext.Provider value={{ title, setTitle }}>
            {children}
        </HeaderTitleContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHeaderTitle = () => {
    const context = useContext(HeaderTitleContext);
    if (!context) {
        throw new Error('useHeaderTitle must be used within a HeaderTitleProvider');
    }
    return context;
};