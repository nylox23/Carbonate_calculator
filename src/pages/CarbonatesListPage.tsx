import { useEffect, useState, useRef } from 'react';
import { Container, Table, Spinner, Badge, Form, Row, Col, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { fetchCarbonatesList, setCarbonateStatus } from '../slices/carbonateSlice';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../Routes';
import { BreadCrumbs } from '../components/BreadCrumbs';
import { RoleRole } from '../api/Api'; // Enum ролей из кодогенерации
import { Pagination } from 'react-bootstrap';
import { setPage } from '../slices/carbonateSlice';

export const CarbonatesListPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const { user } = useSelector((state: RootState) => state.auth);
    const { list, loading, total, page, limit } = useSelector((state: RootState) => state.carbonateData);

    const isAdmin = user?.role === RoleRole.Admin;

    const getTodayHtml = () => new Date().toISOString().split('T')[0];

    const [dateFrom, setDateFrom] = useState(getTodayHtml());
    const [dateTo, setDateTo] = useState(getTodayHtml());
    const [status, setStatus] = useState(''); // Бэкенд фильтр
    const [creatorFilter, setCreatorFilter] = useState(''); // Фронтенд фильтр

    const filtersRef = useRef({ dateFrom, dateTo, status });
    const paramsRef = useRef({ dateFrom, dateTo, status, page })

    useEffect(() => {
        filtersRef.current = { dateFrom, dateTo, status };
        paramsRef.current = { dateFrom, dateTo, status, page };
    }, [dateFrom, dateTo, status, page]);

useEffect(() => {
    const loadData = () => {
        dispatch(fetchCarbonatesList({
            status: paramsRef.current.status || undefined,
            date_from: paramsRef.current.dateFrom,
            date_to: paramsRef.current.dateTo,
            page: paramsRef.current.page,
            limit: limit
        }));
    };

    loadData();

    const intervalId = setInterval(loadData, 5000);

    return () => clearInterval(intervalId);
}, [dispatch, limit]);

    useEffect(() => {
        dispatch(fetchCarbonatesList({
            status: status || undefined,
            date_from: dateFrom,
            date_to: dateTo,
            page: page,
            limit: limit
        }));
    }, [dispatch, page]);

    const handleSearch = () => {
        dispatch(setPage(1));
        dispatch(fetchCarbonatesList({
            status: status || undefined,
            date_from: dateFrom,
            date_to: dateTo,
            page: 1,
            limit: limit
        }));
    };

    const handlePageChange = (newPage: number) => {
        dispatch(setPage(newPage));
    };

    const totalPages = Math.ceil(total / limit);

    const handleReset = () => {
        const today = getTodayHtml();
        setDateFrom(today);
        setDateTo(today);
        setStatus('');
        setCreatorFilter(''); // Сброс фронтенд фильтра

        dispatch(fetchCarbonatesList({
            date_from: today,
            date_to: today
        }));
    };

    const handleChangeStatus = async (e: React.MouseEvent, id: number, newStatus: string) => {
        e.stopPropagation();
        if (window.confirm(`Вы уверены, что хотите перевести заявку ${id} в статус "${newStatus}"?`)) {
            await dispatch(setCarbonateStatus({ id, status: newStatus }));
            handleSearch();
        }
    };

    const displayedList = list.filter(item => {
        if (!isAdmin) return true;
        if (!creatorFilter) return true;
        return item.creator?.toLowerCase().includes(creatorFilter.toLowerCase());
    });

    const getStatusVariant = (status: string | undefined) => {
        if (!status) return 'secondary';
        const s = status.toLowerCase();
        if (s === 'draft' || s === 'черновик') return 'warning';
        if (s === 'created' || s === 'сформирован') return 'primary';
        if (s === 'finished' || s === 'завершен') return 'success';
        if (s === 'rejected' || s === 'отклонен') return 'danger';
        return 'secondary';
    };

    const getStatusLabel = (status: string | undefined) => {
        if (!status) return 'Неизвестно';
        switch (status) {
            case 'Draft': return 'Черновик';
            case 'Created': return 'Сформирован';
            case 'Finished': return 'Завершен';
            case 'Rejected': return 'Отклонен';
        }
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    return (
        <Container>
            <BreadCrumbs crumbs={[{ label: isAdmin ? "Панель модератора" : "Мои заявки" }]} />

            <h2 className="mb-4">
                {isAdmin ? "Управление заявками" : "История расчетов"}
                {loading && <Spinner animation="border" size="sm" className="ms-3" />}
            </h2>

            <div className="card p-3 mb-4 shadow-sm bg-light">
                <Form>
                    <Row className="g-3 align-items-end">
                        <Col md={isAdmin ? 2 : 3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Дата с</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={isAdmin ? 2 : 3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Дата по</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={isAdmin ? 2 : 3}>
                            <Form.Group>
                                <Form.Label className="fw-bold text-muted small">Статус</Form.Label>
                                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <option value="">Все</option>
                                    <option value="черновик">Черновик</option>
                                    <option value="сформирован">Сформирован</option>
                                    <option value="завершен">Завершен</option>
                                    <option value="отклонен">Отклонен</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {isAdmin && (
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="fw-bold text-muted small">Создатель (Login)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Поиск..."
                                        value={creatorFilter}
                                        onChange={(e) => setCreatorFilter(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        )}

                        <Col md={isAdmin ? 3 : 3}>
                            <div className="d-flex gap-2">
                                <Button variant="primary" className="w-100" onClick={handleSearch}>
                                    Обновить
                                </Button>
                                <Button variant="outline-secondary" onClick={handleReset} title="Сбросить">
                                    ↺
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </div>

            <div className="card shadow-sm">
                <Table hover responsive className="mb-0 align-middle">
                    <thead className="table-light">
                    <tr>
                        <th style={{ width: '5%' }} className="text-center">#</th>
                        <th style={{ width: '20%' }}>Дата</th>
                        {isAdmin && <th style={{ width: '15%' }}>Создатель</th>}
                        <th style={{ width: '15%' }} className="text-center">Масса CaCO3</th>
                        <th style={{ width: '10%' }} className="text-center">Кислот</th>
                        <th style={{ width: isAdmin ? '15%' : '25%' }} className="text-center">Статус</th>
                        {isAdmin && <th style={{ width: '20%' }} className="text-center">Действия</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {displayedList.length === 0 ? (
                        <tr>
                            <td colSpan={isAdmin ? 7 : 5} className="text-center py-5 text-muted">
                                Заявок не найдено
                            </td>
                        </tr>
                    ) : (
                        displayedList.map(c => (
                            <tr
                                key={c.id}
                                onClick={() => navigate(`${ROUTES.CARBONATE_DETAIL}/${c.id}`)}
                                style={{ cursor: 'pointer' }}
                            >
                                <td className="text-center fw-bold text-secondary">{c.id}</td>
                                <td>
                                    {c.date_create
                                        ? new Date(c.date_create).toLocaleDateString('ru-RU', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })
                                        : '-'}
                                </td>
                                {isAdmin && (
                                    <td>
                                        <Badge bg="light" text="dark" className="border">
                                            {c.creator || 'Unknown'}
                                        </Badge>
                                    </td>
                                )}
                                <td className="text-center">
                                    {c.mass ? <span className="fw-bold">{c.mass} г</span> : <span className="text-muted small">-</span>}
                                </td>
                                <td className="text-center">
                                    <Badge bg="info" text="dark" pill>{c.calculated ?? 0}</Badge>
                                </td>
                                <td className="text-center">
                                    <Badge bg={getStatusVariant(c.status)} className="px-3 py-2">
                                        {getStatusLabel(c.status)}
                                    </Badge>
                                </td>

                                {isAdmin && (
                                    <td className="text-center">
                                        {(c.status === 'Created' || c.status === 'сформирован') ? (
                                            <div className="d-flex gap-2 justify-content-center">
                                                <Button
                                                    variant="success"
                                                    size="sm"
                                                    onClick={(e) => handleChangeStatus(e, c.id!, 'завершен')}
                                                    title="Завершить и рассчитать"
                                                >
                                                    ✓
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={(e) => handleChangeStatus(e, c.id!, 'отклонен')}
                                                    title="Отклонить"
                                                >
                                                    ✕
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-muted small">-</span>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </Table>
            </div>
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination>
                        <Pagination.First onClick={() => handlePageChange(1)} disabled={page === 1} />
                        <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 1} />

                        {[...Array(5)].map((_, i) => {
                            const p = page - 2 + i;
                            if (p > 0 && p <= totalPages) {
                                return (
                                    <Pagination.Item
                                        key={p}
                                        active={p === page}
                                        onClick={() => handlePageChange(p)}
                                    >
                                        {p}
                                    </Pagination.Item>
                                );
                            }
                            return null;
                        })}

                        <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages} />
                        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={page === totalPages} />
                    </Pagination>
                </div>
            )}
        </Container>
    );
};