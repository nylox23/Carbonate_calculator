import type { FC } from 'react';
import { Button, Form, InputGroup } from "react-bootstrap";

interface InputAreaProps {
  input: string;
  loading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
}

const InputArea: FC<InputAreaProps> = ({
  input,
  loading,
  onInputChange,
  onSend
}) => (
  <div className="p-2 border-top">
    <InputGroup>
        <Form.Control
          placeholder="Спросите о кислотах..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && onSend()}
        />
        <Button onClick={onSend} disabled={loading || !input.trim()}>
          {loading ? '...' : '➤'}
        </Button>
    </InputGroup>
  </div>
);

export default InputArea;