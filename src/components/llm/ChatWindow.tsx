import type { FC } from 'react';
import type { ChatMessage } from '../../LlmTypes';
import Message from './Message';
import { Container } from "react-bootstrap";

interface ChatWindowProps {
    messages: ChatMessage[];
}

const ChatWindow: FC<ChatWindowProps> = ({ messages }) => (
    <Container className="d-flex flex-column p-2" style={{ height: '300px', overflowY: 'auto' }}>
        {messages.filter(msg => msg.role !== 'system').map((msg, idx) => (
            <Message key={idx} msg={msg} />
        ))}
    </Container>
);

export default ChatWindow;