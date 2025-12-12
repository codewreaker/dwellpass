// ============================================================================
// FILE: src/server/routes/users.ts
// Hono routes for users
// ============================================================================

import { Hono } from "hono";
import { z } from "zod";
import { getDatabase } from "../db";
import { UserSchema } from '../../src/entities/schemas'

const attendance = new Hono();

// Get database and operations
const db = getDatabase();

// Validation schemas
const CreateUserSchema = UserSchema.omit({ createdAt: true, updatedAt: true });
const UpdateUserSchema = CreateUserSchema.partial().omit({ id: true });
    update(id: string, updates: Partial<Omit<UserType, "id" | "createdAt" | "updatedAt">>): UserType | null {
const updateFmt = db.run(
  `UPDATE attendance 
   SET eventId = $eventId, 
   patronId = $patronId, 
   attended = $attended, 
   checkInTime = $checkInTime, 
   checkOutTime = $checkOutTime
   WHERE id = $id`,
  [
    validated.eventId,
    validated.patronId,
    validated.attended,
    validated.checkInTime,
    validated.checkOutTime,
    id
  ]
);

// GET /api/users - Get all users
attendance.get("/",(c) => {
    try {
        const allAttendance = db.query(`SELECT * FROM attendance ORDER BY createdAt DESC`);
        const d = c.json(allAttendance)
        return d;
    } catch (error) {
        console.error("Error fetching users:", error);
        return c.json({ error: "Failed to fetch users" }, 500);
    }
});

// GET /api/users/:id - Get attendance by ID
attendance.get("/:id", (c) => {
    try {
        const id = c.req.param("id");
        const attendance = db.query(`SELECT * FROM attendance WHERE id = ${id}`);

        if (!attendance) {
            return c.json({ error: " Not found" }, 404);
        }

        return c.json(attendance);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return c.json({ error: "Failed to fetch attendance" }, 500);
    }
});

// POST /api/attendance - Create attendance
attendance.post("/", async (c) => {
    try {
        const body = await c.req.json();
        const validated = CreateUserSchema.parse(body);
        //@ts-ignore
        const attendance = attendance.create(validated);
        return c.json(attendance, 201);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: "Validation failed", details: error.issues }, 400);
        }
        console.error("Error creating attendance:", error);
        return c.json({ error: "Failed to create attendance" }, 500);
    }
});

// PUT /api/users/:id - Update attendance
attendance.put("/:id", async (c) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json();
        const validated = UpdateUserSchema.parse(body);
        
        const att = db.run(attendance.update(id, validated))

        if (!att) {
            return c.json({ error: "User not found" }, 404);
        }

        return c.json(att);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return c.json({ error: "Validation failed", details: error.issues }, 400);
        }
        console.error("Error updating attendance:", error);
        return c.json({ error: "Failed to update attendance" }, 500);
    }
});

// DELETE /api/users/:id - Delete attendance
attendance.delete("/:id", (c) => {
    try {
        const id = c.req.param("id");
        const deleted = userOps.delete(id);

        if (!deleted) {
            return c.json({ error: "User not found" }, 404);
        }

        return c.json({ success: true }, 200);
    } catch (error) {
        console.error("Error deleting attendance:", error);
        return c.json({ error: "Failed to delete attendance" }, 500);
    }
});

export default users;