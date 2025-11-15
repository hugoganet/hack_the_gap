/**
 * Test script to verify dashboard statistics
 * 
 * This script tests the getDashboardStats function to ensure
 * it correctly fetches user-specific statistics from Supabase.
 * 
 * HOW TO RUN:
 *   pnpm tsx scripts/test-dashboard-stats.ts
 * 
 * WHAT IT DOES:
 *   - Connects to Supabase via Prisma
 *   - Fetches statistics for a test user
 *   - Displays the results in a formatted way
 */

import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma';

async function testDashboardStats() {
  const prisma = new PrismaClient();
  
  try {
    // First, get a user to test with
    const users = await prisma.user.findMany({
      take: 5,
      select: { id: true, email: true },
    });

    if (users.length === 0) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }

    console.log('📊 Testing Dashboard Statistics\n');
    console.log(`Found ${users.length} users. Testing with first user:\n`);

    // Test with the first user
    const testUser = users[0];
    console.log(`👤 User: ${testUser.email}`);
    console.log(`🆔 ID: ${testUser.id}\n`);

    // Get current date and date from last month
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    console.log('⏰ Date Range:');
    console.log(`   Current: ${now.toISOString()}`);
    console.log(`   Last Month: ${lastMonth.toISOString()}\n`);

    // Fetch statistics
    console.log('🔍 Fetching statistics...\n');

    const [
      totalConcepts,
      conceptsLastMonth,
      activeCourses,
      coursesLastMonth,
      totalFlashcards,
      flashcardsLastMonth,
      completedSessions,
      sessionsLastMonth,
    ] = await Promise.all([
      // Total concepts
      prisma.concept.count({
        where: { videoJob: { userId: testUser.id } },
      }),
      prisma.concept.count({
        where: {
          videoJob: { userId: testUser.id },
          createdAt: { lt: lastMonth },
        },
      }),

      // Active courses
      prisma.userCourse.count({
        where: { userId: testUser.id, isActive: true },
      }),
      prisma.userCourse.count({
        where: {
          userId: testUser.id,
          isActive: true,
          createdAt: { lt: lastMonth },
        },
      }),

      // Flashcards
      prisma.flashcard.count({
        where: { userId: testUser.id },
      }),
      prisma.flashcard.count({
        where: {
          userId: testUser.id,
          createdAt: { lt: lastMonth },
        },
      }),

      // Review sessions
      prisma.reviewSession.count({
        where: { userId: testUser.id, status: 'completed' },
      }),
      prisma.reviewSession.count({
        where: {
          userId: testUser.id,
          status: 'completed',
          completedAt: { lt: lastMonth },
        },
      }),
    ]);

    // Calculate changes
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(1));
    };

    const conceptsChange = calculateChange(totalConcepts, conceptsLastMonth);
    const coursesChange = calculateChange(activeCourses, coursesLastMonth);
    const flashcardsChange = calculateChange(totalFlashcards, flashcardsLastMonth);
    const sessionsChange = calculateChange(completedSessions, sessionsLastMonth);

    // Display results
    console.log('📈 DASHBOARD STATISTICS:\n');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│ 🧠 Total Concepts Extracted                             │');
    console.log(`│    Current: ${totalConcepts.toString().padEnd(10)} Previous: ${conceptsLastMonth.toString().padEnd(10)}          │`);
    console.log(`│    Change: ${conceptsChange >= 0 ? '+' : ''}${conceptsChange}% from last month                    │`);
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ 📚 Active Courses                                       │');
    console.log(`│    Current: ${activeCourses.toString().padEnd(10)} Previous: ${coursesLastMonth.toString().padEnd(10)}          │`);
    console.log(`│    Change: ${coursesChange >= 0 ? '+' : ''}${coursesChange}% from last month                    │`);
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ 🎴 Flashcards Created                                   │');
    console.log(`│    Current: ${totalFlashcards.toString().padEnd(10)} Previous: ${flashcardsLastMonth.toString().padEnd(10)}          │`);
    console.log(`│    Change: ${flashcardsChange >= 0 ? '+' : ''}${flashcardsChange}% from last month                    │`);
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ ✅ Review Sessions Completed                            │');
    console.log(`│    Current: ${completedSessions.toString().padEnd(10)} Previous: ${sessionsLastMonth.toString().padEnd(10)}          │`);
    console.log(`│    Change: ${sessionsChange >= 0 ? '+' : ''}${sessionsChange}% from last month                    │`);
    console.log('└─────────────────────────────────────────────────────────┘\n');

    // Summary
    const hasData = totalConcepts > 0 || activeCourses > 0 || totalFlashcards > 0 || completedSessions > 0;
    
    if (hasData) {
      console.log('✅ SUCCESS: Dashboard statistics are working correctly!');
      console.log('   The dashboard will display these numbers for this user.\n');
    } else {
      console.log('⚠️  WARNING: No data found for this user.');
      console.log('   The dashboard will show zeros until data is created.');
      console.log('   To add test data:');
      console.log('   1. Run: make studio (to open Prisma Studio)');
      console.log('   2. Or run: pnpm prisma:seed (to seed database)');
      console.log('   3. Or use the application to create courses/videos/flashcards\n');
    }

    // Test with all users
    console.log('📋 Summary for all users:');
    const allUserStats = await Promise.all(
      users.map(async (user) => {
        const userStats = await Promise.all([
          prisma.concept.count({ where: { videoJob: { userId: user.id } } }),
          prisma.userCourse.count({ where: { userId: user.id, isActive: true } }),
          prisma.flashcard.count({ where: { userId: user.id } }),
          prisma.reviewSession.count({ where: { userId: user.id, status: 'completed' } }),
        ]);

        const [concepts, courses, flashcards, sessions] = userStats;
        const total = concepts + courses + flashcards + sessions;
        
        return { email: user.email, total };
      })
    );

    allUserStats.forEach(({ email, total }) => {
      console.log(`   ${email}: ${total > 0 ? '✅' : '⚠️ '} ${total} total items`);
    });

  } catch (error) {
    console.error('❌ Error testing dashboard statistics:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
void testDashboardStats();
