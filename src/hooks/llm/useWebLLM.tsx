import { useState, useEffect } from 'react';
import { CreateMLCEngine, MLCEngine } from '@mlc-ai/web-llm';
import type { InitProgressReport } from '@mlc-ai/web-llm';

const DEFAULT_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

const useWebLLM = (model: string = DEFAULT_MODEL) => {
    const [engine, setEngine] = useState<MLCEngine | null>(null);
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initEngine = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const engineInstance = await CreateMLCEngine(model, {
                    initProgressCallback: (report: InitProgressReport) => {
                        setProgress(report.progress);
                    },
                });

                setEngine(engineInstance);
            } catch (err: any) {
                console.error('Ошибка инициализации модели:', err);
                setError(`Не удалось загрузить модель ${model}. Ошибка: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        if (!engine) {
            initEngine();
        }

    }, [model]);

    return { engine, progress, error, isLoading };
};

export default useWebLLM;