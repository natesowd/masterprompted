
import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface EvaluationContextType {
    activeEvaluationFactors: Set<string>;
    registerFactor: (factor: string) => void;
    deregisterFactor: (factor: string) => void;
    toggleFactor: (factor: string) => void;
    panelOpenSignal: number;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

// ...
export const useEvaluation = () => {
    const context = useContext(EvaluationContext);
    if (!context) {
        throw new Error('useEvaluation must be used within EvaluationProvider');
    }
    return context;
};

interface EvaluationProviderProps {
    children: ReactNode;
}

export const EvaluationProvider = ({ children }: EvaluationProviderProps) => {
    // Using a map to track counts of each factor
    const [factorCounts, setFactorCounts] = useState<Map<string, number>>(new Map());
    const [panelOpenSignal, setPanelOpenSignal] = useState<number>(0);

    const registerFactor = useCallback((factor: string) => {
        setFactorCounts((prev) => {
            const newMap = new Map(prev);
            const output = newMap.set(factor, (newMap.get(factor) || 0) + 1);
            return newMap;
        });
        setPanelOpenSignal(Date.now());
    }, []);

    const deregisterFactor = useCallback((factor: string) => {
        setFactorCounts((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(factor) || 0;
            if (current > 1) {
                newMap.set(factor, current - 1);
            } else {
                newMap.delete(factor);
            }
            return newMap;
        });
    }, []);

    const toggleFactor = useCallback((factor: string) => {
        // Placeholder
    }, []);

    // Derived set of active factors
    const activeEvaluationFactors = new Set(factorCounts.keys());

    return (
        <EvaluationContext.Provider value={{ activeEvaluationFactors, registerFactor, deregisterFactor, toggleFactor, panelOpenSignal }}>
            {children}
        </EvaluationContext.Provider>
    );
};
