import { prisma } from '../lib/prisma.js';
import { Router } from 'express';
import { isAuthenticated, isAdmin } from '../middlewares/auth.js'; // Assuming you have this middleware for authentication

const eventRouter = Router();

// Get all events
eventRouter.get('/', async (req, res) => {
    try {
        const events = await prisma.event.findMany({});
        return res.status(200).json({ data: events });
    } catch (err) {
        return res.status(500).send({ error: { message: 'Internal Server Error.' } });
    }
});

// Get a single event by ID
eventRouter.get('/:eventId', async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await prisma.event.findFirst({ where: { id: eventId } });
        if (!event) {
            return res.status(404).send({ error: { message: 'Event does not exist.' } });
        }
        return res.status(200).json({ data: event });
    } catch (err) {
        return res.status(500).send({ error: { message: 'Internal Server Error.' } });
    }
});

// Create a new event (Admins only)
eventRouter.post('/create', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { title, description, image, lastUpdated } = req.body;

        if (!title || !description || !image || !lastUpdated) {
            return res.status(400).send({ error: { message: 'All fields are required.' } });
        }
        const newEvent = await prisma.event.create({
            data: {
                title,
                description,
                image,
                lastUpdated,
            },
        });

        return res.status(201).json({ data: newEvent });
    } catch (err) {
        return res.status(500).send({ error: { message: 'Internal Server Error.' } });
    }
});

// Update an event by ID
eventRouter.put('/:eventId', isAuthenticated, async (req, res) => {
    try {
        const { eventId } = req.params;
        const { title, description, image, lastUpdated } = req.body;

        const existingEvent = await prisma.event.findFirst({ where: { id: eventId } });
        if (!existingEvent) {
            return res.status(404).send({ error: { message: 'Event does not exist.' } });
        }

        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                title: title || existingEvent.title,
                description: description || existingEvent.description,
                image: image || existingEvent.image,
                lastUpdated: lastUpdated || existingEvent.lastUpdated,
            },
        });

        return res.status(200).json({ data: updatedEvent });
    } catch (err) {
        return res.status(500).send({ error: { message: 'Internal Server Error.' } });
    }
});

// Delete an event by ID (Admins only)
eventRouter.delete('/:eventId', isAuthenticated, isAdmin, async (req, res) => {
    try {
        const { eventId } = req.params;

        const existingEvent = await prisma.event.findFirst({ where: { id: eventId } });
        if (!existingEvent) {
            return res.status(404).send({ error: { message: 'Event does not exist.' } });
        }

        await prisma.event.delete({ where: { id: eventId } });
        return res.status(200).send({ message: 'Event deleted successfully.' });
    } catch (err) {
        return res.status(500).send({ error: { message: 'Internal Server Error.' } });
    }
});

export { eventRouter };
