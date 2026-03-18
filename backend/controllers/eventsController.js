import EventsModel from "../models/eventsModel.js";
import { logAdminAction } from "../utils/auditLogger.js";
import { slugify } from "../utils/slug.js";
class EventsController {
    static async getAll(req, res, next) {
        try {
            const { category } = req.query;
            
            // If category is specified, filter by category
            if (category && (category === 'upcoming' || category === 'past')) {
                const events = await EventsModel.getByCategory(category);
                return res.json(events);
            }
            
            // Otherwise return all events
            const events = await EventsModel.getAll();
            res.json(events);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const slugOrId = req.params.slug;
            const event = Number.isFinite(Number(slugOrId))
                ? await EventsModel.getById(slugOrId)
                : await EventsModel.getBySlug(slugOrId);
            if (event) {
                res.json(event);
            } else {
                res.status(404).json({ message: "Event not found" });
            }
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const { event_name, description, event_date, event_time, venue, organized_by, category, slug, seo_title, seo_description, seo_keywords } = req.body;
            const normalizedSlug = slugify(slug || event_name);

            if (!event_name) {
                return res.status(400).json({ message: "Event name is required." });
            }

            // Validate category if provided
            if (category && category !== 'upcoming' && category !== 'past') {
                return res.status(400).json({ message: "Category must be either 'upcoming' or 'past'." });
            }

            const id = await EventsModel.create({ 
                event_name, 
                slug: normalizedSlug,
                description, 
                event_date, 
                event_time, 
                venue, 
                organized_by,
                category: category || 'upcoming',
                seo_title,
                seo_description,
                seo_keywords,
            }); 
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "EVENT",
                entity_id: id,
                ip: req.ip
            });
            res.status(201).json({ message: "Event created", id });
        } catch (err) {
            if (err?.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ message: "Slug already exists." });
            }
            console.error("Error creating event:", err);
            next(err); 
        }
    }

    static async update(req, res, next) {
        try {
            const { event_name, description, event_date, event_time, venue, organized_by, category, slug, seo_title, seo_description, seo_keywords } = req.body;
            const normalizedSlug = slugify(slug || event_name);

            // Validate category if provided
            if (category && category !== 'upcoming' && category !== 'past') {
                return res.status(400).json({ message: "Category must be either 'upcoming' or 'past'." });
            }

            await EventsModel.update(req.params.id, { 
                event_name, 
                slug: normalizedSlug,
                description, 
                event_date, 
                event_time, 
                venue, 
                organized_by,
                category,
                seo_title,
                seo_description,
                seo_keywords,
            });
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "EVENT",
                entity_id: req.params.id,
                ip: req.ip
            });
            res.json({ message: "Event updated" });
        } catch (err) {
            if (err?.code === "ER_DUP_ENTRY") {
                return res.status(409).json({ message: "Slug already exists." });
            }
            console.error("Error updating event:", err);
            next(err);
        }
    }

    static async delete(req, res, next) {
        try {
            await EventsModel.delete(req.params.id);
            res.json({ message: "Event deleted" });
        } catch (err) {
            next(err);
        }
    }
}

export default EventsController;