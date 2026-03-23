// Quick test to verify booking stops functionality
const { Database } = require('better-sqlite3');
const path = require('path');

// Connect to the database 
const dbPath = path.join(__dirname, 'apps/server/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/8682a4c3-fcc3-4435-9a31-1b710dd1a673.sqlite');
const db = new Database(dbPath);

console.log('🔍 Testing booking stops functionality...');

// Test 1: Check if booking_stops table exists
try {
  const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='booking_stops'").get();
  console.log('✅ booking_stops table exists:', tableInfo ? 'Yes' : 'No');
} catch (error) {
  console.error('❌ Error checking table:', error.message);
}

// Test 2: Check recent bookings and their stops
try {
  const recentBookings = db.prepare(`
    SELECT 
      b.id, 
      b.originAddress, 
      b.destinationAddress, 
      b.createdAt,
      COUNT(bs.id) as stop_count
    FROM bookings b 
    LEFT JOIN booking_stops bs ON b.id = bs.bookingId 
    GROUP BY b.id 
    ORDER BY b.createdAt DESC 
    LIMIT 5
  `).all();
  
  console.log('\n📋 Recent bookings with stop counts:');
  recentBookings.forEach(booking => {
    console.log(`  • Booking ${booking.id}: ${booking.stop_count} stops`);
    console.log(`    ${booking.originAddress} → ${booking.destinationAddress}`);
  });
} catch (error) {
  console.error('❌ Error fetching bookings:', error.message);
}

// Test 3: Show stops details for bookings that have them
try {
  const stopsDetails = db.prepare(`
    SELECT 
      bs.bookingId,
      bs.stopOrder,
      bs.address,
      bs.waitingTime,
      b.originAddress as booking_origin
    FROM booking_stops bs
    JOIN bookings b ON bs.bookingId = b.id
    ORDER BY bs.bookingId, bs.stopOrder
  `).all();
  
  if (stopsDetails.length > 0) {
    console.log('\n🛑 Detailed stops information:');
    stopsDetails.forEach(stop => {
      console.log(`  • Booking ${stop.bookingId}, Stop ${stop.stopOrder}: ${stop.address}`);
    });
  } else {
    console.log('\n⚠️  No booking stops found in database');
  }
} catch (error) {
  console.error('❌ Error fetching stops details:', error.message);
}

db.close();
console.log('\n✅ Test completed');