import { useState } from 'react';
import type { FC } from 'react';
import { Card, Button } from "react-bootstrap";
import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import useWebLLM from '../../hooks/llm/useWebLLM';

import ChatWindow from './ChatWindow';
import ModelLoader from './ModelLoader';
import InputArea from './InputArea.tsx';
import type { ChatMessage } from '../../LlmTypes';
import type { Acid } from '../../modules/types';

interface Props {
    acids: Acid[];
}

export const AiAssistant: FC<Props> = ({ acids }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { engine, progress, error, isLoading: modelLoading } = useWebLLM();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const acidsContext = acids.map(a => `${a.Name} (${a.NameExt}): ${a.Info}. M=${a.MolarMass}, H+=${a.Hplus}`).join('\n');
    const systemPrompt = `Ты - химический консультант. Отвечай кратко на русском языке, используя только эти данные:\n${acidsContext}`;

    const handleSend = async () => {
        if (!input.trim() || !engine) return;

        const userMsg: ChatMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMsg];

        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            const chatRequest: ChatCompletionMessageParam[] = [
                { role: "system", content: systemPrompt },
                ...updatedMessages
            ];

            const reply = await engine.chat.completions.create({
                messages: chatRequest,
                temperature: 0.1,
                top_p: 0.9,
                max_tokens: 500,
            });

            const assistantMsg: ChatMessage = {
                role: 'assistant',
                content: reply.choices[0].message.content ?? ''
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error) {
            console.error('Ошибка генерации:', error);
            setMessages(prev => [
                ...prev,
                { role: 'assistant', content: 'Ошибка генерации ответа.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <Button
                style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, borderRadius: '50%', width: '60px', height: '60px' }}
                onClick={() => setIsOpen(true)}
            >
                🤖
            </Button>
        );
    }

    return (
        <Card style={{ position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '500px', zIndex: 1000, display: 'flex', flexDirection: 'column' }} className="shadow">
            <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                <span>AI Помощник</span>
                <Button variant="link" className="text-white p-0 text-decoration-none" onClick={() => setIsOpen(false)}>✕</Button>
            </Card.Header>

            <Card.Body className="p-0 d-flex flex-column" style={{ overflow: 'hidden' }}>
                {modelLoading ? (
                    <div className="d-flex align-items-center justify-content-center h-100">
                        <ModelLoader progress={progress} />
                    </div>
                ) : error ? (
                    <div className="p-3 text-danger text-center">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <ChatWindow messages={messages} />
                        </div>
                        <InputArea
                            input={input}
                            loading={loading}
                            onInputChange={setInput}
                            onSend={handleSend}
                        />
                    </>
                )}
            </Card.Body>
        </Card>
    );
};