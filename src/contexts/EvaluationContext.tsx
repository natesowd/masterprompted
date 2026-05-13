
import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

type Severity = "error" | "warning" | "info" | "success";

const SEVERITY_RANK: Record<Severity, number> = { error: 3, warning: 2, info: 1, success: 0 };

interface EvaluationContextType {
    activeEvaluationFactors: Set<string>;
    factorSeverities: Map<string, Severity>;
    registerFactor: (factor: string, severity?: Severity) => void;
    deregisterFactor: (factor: string, severity?: Severity) => void;
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
    const [factorCounts, setFactorCounts] = useState<Map<string, number>>(new Map());
    const [severityCounts, setSeverityCounts] = useState<Map<string, Map<Severity, number>>>(new Map());
    const [panelOpenSignal, setPanelOpenSignal] = useState<number>(0);

    const registerFactor = useCallback((factor: string, severity: Severity = "error") => {
        setFactorCounts((prev) => {
            const newMap = new Map(prev);
            newMap.set(factor, (newMap.get(factor) || 0) + 1);
            return newMap;
        });
        setSeverityCounts((prev) => {
            const newMap = new Map(prev);
            const inner = new Map(newMap.get(factor) || []);
            inner.set(severity, (inner.get(severity) || 0) + 1);
            newMap.set(factor, inner);
            return newMap;
        });
        setPanelOpenSignal(Date.now());
    }, []);

    const deregisterFactor = useCallback((factor: string, severity: Severity = "error") => {
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
        setSeverityCounts((prev) => {
            const newMap = new Map(prev);
            const inner = new Map(newMap.get(factor) || []);
            const c = inner.get(severity) || 0;
            if (c > 1) inner.set(severity, c - 1);
            else inner.delete(severity);
            if (inner.size === 0) newMap.delete(factor);
            else newMap.set(factor, inner);
            return newMap;
        });
    }, []);

    const toggleFactor = useCallback((_factor: string) => {}, []);

    const activeEvaluationFactors = useMemo(() => new Set(factorCounts.keys()), [factorCounts]);

    const factorSeverities = useMemo(() => {
        const result = new Map<string, Severity>();
        severityCounts.forEach((inner, factor) => {
            let worst: Severity = "success";
            inner.forEach((_count, sev) => {
                if (SEVERITY_RANK[sev] > SEVERITY_RANK[worst]) worst = sev;
            });
            result.set(factor, worst);
        });
        return result;
    }, [severityCounts]);

    return (
        <EvaluationContext.Provider value={{ activeEvaluationFactors, factorSeverities, registerFactor, deregisterFactor, toggleFactor, panelOpenSignal }}>
            {children}
        </EvaluationContext.Provider>
    );
};
