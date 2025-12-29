import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Image, Spinner, Card, ListGroup, Badge } from 'react-bootstrap';
import type { Acid } from '../modules/types';
import { getAcidById, getAcids } from '../modules/api';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { ROUTES, ROUTE_LABELS } from '../Routes';
import defaultImage from '../assets/default_acid.jpg';
import QRCode from "react-qr-code";
import { pipeline } from '@xenova/transformers';
import { cosineSimilarity } from '../utils/math';

interface SimilarAcid extends Acid {
    score: number;
}

export const AcidDetailsPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [acid, setAcid] = useState<Acid | undefined>();
    const [loading, setLoading] = useState(true);

    // Состояния для похожих
    const [similarAcids, setSimilarAcids] = useState<SimilarAcid[]>([]);
    const [calcLoading, setCalcLoading] = useState(false);

    useEffect(() => {
        if (id) {
            setLoading(true);
            setSimilarAcids([]);

            getAcidById(id).then((data) => {
                setAcid(data);
                setLoading(false);
                if (data) calculateSimilarities(data);
            });
        }
    }, [id]);

    const calculateSimilarities = async (current: Acid) => {
        setCalcLoading(true);
        try {
            const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

            const allAcids = await getAcids('');
            const others = allAcids.filter(a => a.ID !== current.ID);

            if (others.length === 0) return;

            const currentText = `${current.Name} ${current.Info}`;
            const currentOut = await extractor(currentText, { pooling: 'mean', normalize: true });

            const scored: SimilarAcid[] = [];

            for (const item of others) {
                const itemText = `${item.Name} ${item.Info}`;
                const itemOut = await extractor(itemText, { pooling: 'mean', normalize: true });

                const score = cosineSimilarity(
                    Array.from(currentOut.data as any),
                    Array.from(itemOut.data as any)
                );
                scored.push({ ...item, score });
            }

            scored.sort((a, b) => b.score - a.score);
            setSimilarAcids(scored.slice(0, 3));

        } catch (e) {
            console.error(e);
        } finally {
            setCalcLoading(false);
        }
    };

    if (loading) return <Container className="mt-5"><Spinner animation="border" /></Container>;
    if (!acid) return <Container className="mt-5">Кислота не найдена</Container>;

    const currentUrl = window.location.href;

    return (
        <Container>
            <BreadCrumbs crumbs={[{ label: ROUTE_LABELS.ACIDS, path: ROUTES.ACIDS }, { label: acid.Name }]} />

            <div className="row">
                <div className="col-md-8">
                    <Card className="mb-4">
                        <Card.Body>
                            <h2>{acid.Name} - {acid.NameExt}</h2>
                            <div className="text-center mb-4">
                                <Image src={acid.Img || defaultImage} fluid rounded style={{ maxHeight: '300px' }} />
                            </div>
                            <Card.Text>{acid.Info}</Card.Text>
                            <div className="fw-bold text-primary">H+: {acid.Hplus} | M: {acid.MolarMass}</div>

                            <div className="mt-4 pt-3 border-top text-center">
                                <div className="p-2 border rounded d-inline-block bg-white">
                                    <QRCode value={currentUrl} size={100} />
                                </div>
                                <div className="small text-muted">Scan to open in App</div>
                            </div>
                        </Card.Body>
                    </Card>
                </div>

                <div className="col-md-4">
                    <Card>
                        <Card.Header>Похожие вещества (AI)</Card.Header>
                        <ListGroup variant="flush">
                            {calcLoading ? (
                                <ListGroup.Item className="text-center"><Spinner size="sm" animation="grow" /></ListGroup.Item>
                            ) : similarAcids.length > 0 ? (
                                similarAcids.map(item => (
                                    <ListGroup.Item key={item.ID} action onClick={() => navigate(`${ROUTES.ACIDS}/${item.ID}`)}>
                                        <div className="d-flex justify-content-between">
                                            <span>{item.Name}</span>
                                            <Badge bg="info">{(item.score * 100).toFixed(0)}%</Badge>
                                        </div>
                                    </ListGroup.Item>
                                ))
                            ) : (
                                <ListGroup.Item>Нет похожих</ListGroup.Item>
                            )}
                        </ListGroup>
                    </Card>
                </div>
            </div>
        </Container>
    );
};