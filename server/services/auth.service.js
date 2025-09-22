// server/services/auth.service.js
import { getDb } from '../db.js';

export const findUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        const q = "SELECT * FROM users WHERE username = ?";
        getDb().query(q, [username], (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

export const findUserByUsernameOrEmail = (identifier) => {
    return new Promise((resolve, reject) => {
        const q = "SELECT * FROM users WHERE username = ? OR email = ?";
        getDb().query(q, [identifier, identifier], (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

export const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const q = "SELECT * FROM users WHERE email = ?";
        getDb().query(q, [email], (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

export const findUserByResetToken = (resetToken) => {
    return new Promise((resolve, reject) => {
        const q = "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()";
        getDb().query(q, [resetToken], (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

export const createUser = (username, email, passwordHash) => {
    return new Promise((resolve, reject) => {
        const q = "INSERT INTO users(username, email, password) VALUES (?, ?, ?)";
        getDb().query(q, [username, email, passwordHash], (err, data) => {
            if (err) return reject(err);
            resolve("User has been created.");
        });
    });
};

export const createPasswordResetToken = (email, resetToken, expiresAt) => {
    return new Promise((resolve, reject) => {
        const q = "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?";
        getDb().query(q, [resetToken, expiresAt, email], (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};

export const resetPassword = (resetToken, newPasswordHash) => {
    return new Promise((resolve, reject) => {
        const q = "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ?";
        getDb().query(q, [newPasswordHash, resetToken], (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
};