// seed.ts
import { getDatabase, closeDatabase, initializeSchema } from "./index";
import type { Database } from "bun:sqlite";

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    createdAt: number;
    updatedAt: number;
}

interface Event {
    id: string;
    name: string;
    description: string;
    status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
    startTime: number;
    endTime: number;
    location: string;
    capacity: number;
    hostId: string;
    createdAt: number;
    updatedAt: number;
}

interface Attendance {
    id: string;
    eventId: string;
    patronId: string;
    attended: number;
    checkInTime: number | null;
    checkOutTime: number | null;
}

interface Loyalty {
    id: string;
    patronId: string;
    description: string;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | null;
    points: number | null;
    reward: string | null;
    issuedAt: number;
    expiresAt: number | null;
}

console.log("🌱 Starting database seed...\n");

try {
    const db: Database = getDatabase();
    initializeSchema(db);

    // Check if data already exists
    const existingUsers = db.query("SELECT COUNT(*) as count FROM users").get() as { count: number };

    if (existingUsers.count > 0) {
        console.log(`ℹ️  Database already has ${existingUsers.count} user(s), skipping seed`);
        console.log("✅ Database seed completed (skipped)!");
        process.exit(0);
    }

    // Generate sample data
    console.log("📝 Generating seed data...\n");

    // 1. Create Users (Patrons)
    const userIds: string[] = Array.from({ length: 25 }, () => crypto.randomUUID());
    const firstNames: string[] = [
        'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Chris', 'Lisa', 'James',
        'Maria', 'Robert', 'Emily', 'William', 'Sophia', 'Daniel', 'Olivia', 'Matthew',
        'Isabella', 'Andrew', 'Mia', 'Joseph', 'Charlotte', 'Ryan', 'Amelia', 'Kevin'
    ];
    const lastNames: string[] = [
        'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
        'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
        'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
        'White', 'Harris'
    ];

    const sampleUsers = userIds.map((id: string, index: number) => ({
        id,
        email: `${firstNames[index]?.toLowerCase()}.${lastNames[index]?.toLowerCase()}@example.com`,
        firstName: firstNames[index],
        lastName: lastNames[index],
        phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`,
        createdAt: Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000), // Random time in last 90 days
        updatedAt: Date.now()
    })) as User[];

    console.log("👥 Inserting users...");
    const insertUser = db.query(`
    INSERT INTO users (id, email, firstName, lastName, phone, createdAt, updatedAt)
    VALUES ($id, $email, $firstName, $lastName, $phone, $createdAt, $updatedAt)
  `);

    for (const user of sampleUsers) {
        //@ts-ignore
        insertUser.run(user);
    }
    console.log(`✓ Inserted ${sampleUsers.length} users\n`);

    // 2. Create Events
    const eventNames: string[] = [
        'Summer Music Festival',
        'Tech Conference 2024',
        'Art Gallery Opening',
        'Wine Tasting Evening',
        'Charity Gala',
        'Business Networking Mixer',
        'Holiday Party',
        'Product Launch Event',
        'Community BBQ',
        'Yoga Workshop',
        'Film Screening Night',
        'Cooking Class',
        'Book Club Meeting',
        'Dance Competition',
        'Gaming Tournament'
    ];

    const locations: string[] = [
        'Grand Hotel Ballroom',
        'City Convention Center',
        'Riverside Park',
        'Downtown Art Gallery',
        'Community Center',
        'Beach Club',
        'Rooftop Lounge',
        'Sports Arena',
        'Museum Hall',
        'Local Theatre'
    ];

    const now: number = Date.now();
    const eventIds: string[] = Array.from({ length: 15 }, () => crypto.randomUUID());

    const sampleEvents = eventIds.map((id: string, index: number) => {
        const daysOffset: number = Math.floor(Math.random() * 60) - 30; // Events from 30 days ago to 30 days future
        const startTime: number = now + (daysOffset * 24 * 60 * 60 * 1000);
        const duration: number = (Math.floor(Math.random() * 6) + 2) * 60 * 60 * 1000; // 2-8 hours
        const endTime: number = startTime + duration;

        let status: 'draft' | 'scheduled' | 'ongoing' | 'completed' | 'cancelled' = 'scheduled';
        if (startTime < now - 24 * 60 * 60 * 1000) {
            status = 'completed';
        } else if (startTime < now && endTime > now) {
            status = 'ongoing';
        } else if (Math.random() < 0.1) {
            status = 'cancelled';
        } else if (Math.random() < 0.15) {
            status = 'draft';
        }

        return {
            id,
            name: eventNames[index],
            description: `Join us for an amazing ${eventNames[index]?.toLowerCase()}! This will be an unforgettable experience.`,
            status,
            startTime,
            endTime,
            location: locations[Math.floor(Math.random() * locations.length)],
            capacity: Math.floor(Math.random() * 150) + 50, // 50-200 capacity
            hostId: userIds[Math.floor(Math.random() * Math.min(5, userIds.length))], // First 5 users can be hosts
            createdAt: startTime - (7 * 24 * 60 * 60 * 1000), // Created 7 days before event
            updatedAt: now
        };
    }) as Event[];

    console.log("🎉 Inserting events...");
    const insertEvent = db.query(`
    INSERT INTO events (id, name, description, status, startTime, endTime, location, capacity, hostId, createdAt, updatedAt)
    VALUES ($id, $name, $description, $status, $startTime, $endTime, $location, $capacity, $hostId, $createdAt, $updatedAt)
  `);

    for (const event of sampleEvents) {
        //@ts-ignore
        insertEvent.run(event);
    }
    console.log(`✓ Inserted ${sampleEvents.length} events\n`);

    // 3. Create Attendance Records
    console.log("✓ Inserting attendance records...");
    const insertAttendance = db.query(`
    INSERT INTO attendance (id, eventId, patronId, attended, checkInTime, checkOutTime)
    VALUES ($id, $eventId, $patronId, $attended, $checkInTime, $checkOutTime)
  `);

    let attendanceCount: number = 0;
    for (const event of sampleEvents) {
        // Skip draft and cancelled events
        if (event.status === 'draft' || event.status === 'cancelled') continue;

        // Random number of attendees (40-90% of capacity or all users, whichever is smaller)
        const maxAttendees: number = Math.min(event.capacity, userIds.length);
        const numAttendees: number = Math.floor(maxAttendees * (0.4 + Math.random() * 0.5));

        // Randomly select attendees
        const shuffledUsers: string[] = [...userIds].sort(() => Math.random() - 0.5);
        const attendees: string[] = shuffledUsers.slice(0, numAttendees);

        for (const patronId of attendees) {
            const attended: boolean = event.status === 'completed' ? Math.random() > 0.1 : Math.random() > 0.3; // 90% attended for completed, 70% for ongoing
            let checkInTime: number | null = null;
            let checkOutTime: number | null = null;

            if (attended && event.status === 'completed') {
                checkInTime = event.startTime + Math.floor(Math.random() * 30 * 60 * 1000); // Within 30 min of start
                const remainingTime = event.endTime - checkInTime;
                checkOutTime = checkInTime + Math.floor(Math.random() * remainingTime);
            } else if (attended && event.status === 'ongoing') {
                checkInTime = event.startTime + Math.floor(Math.random() * 30 * 60 * 1000);
                checkOutTime = null; // Still at event
            }

            const attendanceRecord: Attendance = {
                id: crypto.randomUUID(),
                eventId: event.id,
                patronId,
                attended: attended ? 1 : 0,
                checkInTime,
                checkOutTime
            };
            //@ts-ignore
            insertAttendance.run(attendanceRecord);
            attendanceCount++;
        }
    }
    console.log(`✓ Inserted ${attendanceCount} attendance records\n`);

    // 4. Create Loyalty Records
    console.log("🏆 Inserting loyalty records...");
    const rewardTypes: string[] = [
        'Free Event Ticket',
        '20% Discount Voucher',
        'VIP Access Pass',
        'Exclusive Merchandise',
        'Early Bird Registration',
        'Meet & Greet Pass',
        'Premium Seating Upgrade',
        'Complimentary Food & Beverage',
        'Guest Pass',
        'Limited Edition Swag'
    ];

    const insertLoyalty = db.query(`
    INSERT INTO loyalty (id, patronId, description, tier, points, reward, issuedAt, expiresAt)
    VALUES ($id, $patronId, $description, $tier, $points, $reward, $issuedAt, $expiresAt)
  `);

    let loyaltyCount: number = 0;
    for (const userId of userIds) {
        // Calculate user's event attendance
        const userAttendance = db.query(`
      SELECT COUNT(*) as count FROM attendance 
      WHERE patronId = ? AND attended = 1
    `).get(userId) as { count: number };

        const attendedCount: number = userAttendance.count;
        const points: number = attendedCount * 10; // 10 points per event

        // Determine tier based on points
        let tier: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';
        if (points >= 300) {
            tier = 'platinum';
        } else if (points >= 200) {
            tier = 'gold';
        } else if (points >= 100) {
            tier = 'silver';
        }

        // Create loyalty account record
        const issuedAt: number = now - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000); // Within last 60 days
        const loyaltyAccount: Loyalty = {
            id: crypto.randomUUID(),
            patronId: userId,
            description: `Loyalty account - ${tier.charAt(0).toUpperCase() + tier.slice(1)} member`,
            tier,
            points,
            reward: null,
            issuedAt,
            expiresAt: null
        };

        //@ts-ignore
        insertLoyalty.run(loyaltyAccount);
        loyaltyCount++;

        // Add some rewards for active users (those with points > 50)
        if (points > 50 && Math.random() > 0.3) {
            const numRewards: number = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numRewards; i++) {
                const rewardIssuedAt: number = now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
                const rewardExpiresAt: number = rewardIssuedAt + (90 * 24 * 60 * 60 * 1000); // 90 days validity

                const rewardRecord: Loyalty = {
                    id: crypto.randomUUID(),
                    patronId: userId,
                    description: `Reward earned for attending ${Math.floor(Math.random() * 10) + 5} events`,
                    tier: null,
                    points: null,
                    reward: rewardTypes[Math.floor(Math.random() * rewardTypes.length)] || null,
                    issuedAt: rewardIssuedAt,
                    expiresAt: rewardExpiresAt
                };

                //@ts-ignore
                insertLoyalty.run(rewardRecord);
                loyaltyCount++;
            }
        }
    }
    console.log(`✓ Inserted ${loyaltyCount} loyalty records\n`);

    // Summary
    console.log("📊 Seed Summary:");
    console.log(`   Users: ${sampleUsers.length}`);
    console.log(`   Events: ${sampleEvents.length}`);
    console.log(`   Attendance Records: ${attendanceCount}`);
    console.log(`   Loyalty Records: ${loyaltyCount}`);
    console.log("\n✅ Database seed completed successfully!");

} catch (error) {
    console.error("\n❌ Seed failed:", error);
    process.exit(1);
} finally {
    closeDatabase();
}