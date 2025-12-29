import type { FC } from 'react';
import type { ChatMessage } from '../../LlmTypes';

interface MessageProps {
    msg: ChatMessage;
}

const Message: FC<MessageProps> = ({ msg }) => (
    <div className={`mb-2 p-2 rounded ${msg.role === 'user' ? 'bg-primary text-white align-self-end' : 'bg-light text-dark align-self-start'}`}
         style={{ maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
        <strong>{msg.role === 'user' ? 'Вы' : 'AI'}: </strong>
        {msg.content}
    </div>
);

export default Message;