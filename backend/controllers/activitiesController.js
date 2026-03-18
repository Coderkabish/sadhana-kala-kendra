import ActivitiesModel from "../models/activitiesModel.js";
import { logAdminAction } from "../utils/auditLogger.js";

class ActivitiesController {
    static async getAll(req, res, next) {
        try {
            const activities = await ActivitiesModel.getAll();
            res.json(activities);
        } catch (err) {
            next(err);
        }
    }

    static async getById(req, res, next) {
        try {
            const activity = await ActivitiesModel.getById(req.params.id);
            if (!activity) {
                return res.status(404).json({ message: "Activity not found" });
            }
            res.json(activity);
        } catch (err) {
            next(err);
        }
    }

    static async create(req, res, next) {
        try {
            const { title, description, video_url } = req.body;

            if (!title || !video_url) {
                return res.status(400).json({ message: "Title and video URL are required." });
            }

            const id = await ActivitiesModel.create({ title, description, video_url });
            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "CREATE",
                entity: "ACTIVITY",
                entity_id: id,
                ip: req.ip,
            });

            res.status(201).json({ message: "Activity created", id });
        } catch (err) {
            next(err);
        }
    }

    static async update(req, res, next) {
        try {
            const { title, description, video_url } = req.body;
            await ActivitiesModel.update(req.params.id, { title, description, video_url });

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "UPDATE",
                entity: "ACTIVITY",
                entity_id: req.params.id,
                ip: req.ip,
            });

            res.json({ message: "Activity updated" });
        } catch (err) {
            next(err);
        }
    }

    static async delete(req, res, next) {
        try {
            await ActivitiesModel.delete(req.params.id);

            await logAdminAction({
                admin_id: req.admin.admin_id,
                action: "DELETE",
                entity: "ACTIVITY",
                entity_id: req.params.id,
                ip: req.ip,
            });

            res.json({ message: "Activity deleted" });
        } catch (err) {
            next(err);
        }
    }
}

export default ActivitiesController;
