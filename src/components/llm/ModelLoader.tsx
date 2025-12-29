import type { FC } from 'react';
import { Container, ProgressBar } from "react-bootstrap";

interface ModelLoaderProps {
    progress: number;
}

const ModelLoader: FC<ModelLoaderProps> = ({ progress }) => (
    <Container className="p-3 text-center">
        <p className="mb-2">Загрузка нейросети: {(progress * 100).toFixed(0)}%</p>
        <ProgressBar now={progress * 100} animated />
        <small className="text-muted">Первая загрузка может занять время (~1.5GB)</small>
    </Container>
);

export default ModelLoader;