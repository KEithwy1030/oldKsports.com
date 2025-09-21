// server/services/user.service.js
import { db } from '../db.js';

export const updateUserPoints = (userId, points) => {
    return new Promise((resolve, reject) => {
        const q = "UPDATE users SET points = ? WHERE id = ?";
        db.query(q, [points, userId], (err, data) => {
            if (err) return reject(err);
            if (data.affectedRows === 0) return reject(new Error("User not found"));
            resolve("Points updated successfully");
        });
    });
};
