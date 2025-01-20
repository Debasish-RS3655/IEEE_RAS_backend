import { prisma } from '../lib/prisma';
import { Router } from 'express';

const eventRouter = Router();

eventRouter.get('/', async (req, res) => {
    try {
        const events = await prisma.event.findMany({});
        return res.status(200).json({ data: events });
    }
    catch (err) {
        return res.status(500).send({ error: { message: 'Internal Server Error.' } });
    }
});

eventRouter.get('/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const events = await prisma.event.findFirst({ where: { id: eventId } });
        if (!events) return res.status(401).send({ error: { message: 'Event does not exist.' } });
        return res.status(200).json({ data: events });
    }
    catch (err) {
        return res.status(500).send({ error: { message: 'Internal Server Error.' } });
    }
});

eventRouter.delete('/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
    }
    catch (err) {
        return res.status(500).send({ error: { message: 'Internal Server Error.' } })
    }
});