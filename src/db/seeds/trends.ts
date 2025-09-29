import { db } from '@/db';
import { trends, trendTags, trendVelocityPoints, trendRegions, trendPosts, trendDemographics } from '@/db/schema';

async function main() {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const currentISOString = new Date().toISOString();
    
    // Insert main trends
    const sampleTrends = [
        {
            slug: 'silent-walking',
            title: 'Silent Walking',
            volume: 128000,
            velocity: 78,
            sentiment: 'positive',
            createdAt: currentISOString,
            updatedAt: currentISOString,
        },
        {
            slug: 'third-space-cafes',
            title: 'Third-Place Cafes',
            volume: 76000,
            velocity: 52,
            sentiment: 'neutral',
            createdAt: currentISOString,
            updatedAt: currentISOString,
        },
        {
            slug: 'sleep-tourism',
            title: 'Sleep Tourism',
            volume: 54000,
            velocity: 61,
            sentiment: 'positive',
            createdAt: currentISOString,
            updatedAt: currentISOString,
        }
    ];

    const insertedTrends = await db.insert(trends).values(sampleTrends).returning();

    // Insert trend tags
    const trendTagsData = [
        { trendId: insertedTrends[0].id, tag: 'wellness' },
        { trendId: insertedTrends[0].id, tag: 'gen z' },
        { trendId: insertedTrends[0].id, tag: 'tiktok' },
        { trendId: insertedTrends[1].id, tag: 'community' },
        { trendId: insertedTrends[1].id, tag: 'urban living' },
        { trendId: insertedTrends[1].id, tag: 'remote work' },
        { trendId: insertedTrends[2].id, tag: 'wellness' },
        { trendId: insertedTrends[2].id, tag: 'travel' },
        { trendId: insertedTrends[2].id, tag: 'luxury' },
    ];

    await db.insert(trendTags).values(trendTagsData);

    // Insert velocity points for each trend
    const velocityPointsData = [];
    
    // Silent Walking velocity points (around 78 ±20)
    const silentWalkingVelocities = [58, 62, 71, 75, 83, 89, 92, 88, 82, 76, 79, 85];
    for (let i = 0; i < 12; i++) {
        velocityPointsData.push({
            trendId: insertedTrends[0].id,
            periodIndex: i,
            value: silentWalkingVelocities[i]
        });
    }

    // Third-Place Cafes velocity points (around 52 ±20)
    const thirdPlaceCafesVelocities = [35, 42, 48, 55, 59, 61, 58, 54, 49, 46, 51, 56];
    for (let i = 0; i < 12; i++) {
        velocityPointsData.push({
            trendId: insertedTrends[1].id,
            periodIndex: i,
            value: thirdPlaceCafesVelocities[i]
        });
    }

    // Sleep Tourism velocity points (around 61 ±20)
    const sleepTourismVelocities = [43, 48, 52, 58, 65, 69, 72, 68, 63, 59, 64, 67];
    for (let i = 0; i < 12; i++) {
        velocityPointsData.push({
            trendId: insertedTrends[2].id,
            periodIndex: i,
            value: sleepTourismVelocities[i]
        });
    }

    await db.insert(trendVelocityPoints).values(velocityPointsData);

    // Insert regional data
    const regionsData = [
        // Silent Walking regions
        { trendId: insertedTrends[0].id, region: 'United States', interest: 92 },
        { trendId: insertedTrends[0].id, region: 'United Kingdom', interest: 85 },
        { trendId: insertedTrends[0].id, region: 'Canada', interest: 78 },
        { trendId: insertedTrends[0].id, region: 'Australia', interest: 74 },
        { trendId: insertedTrends[0].id, region: 'Germany', interest: 45 },
        { trendId: insertedTrends[0].id, region: 'France', interest: 38 },
        { trendId: insertedTrends[0].id, region: 'Japan', interest: 65 },
        { trendId: insertedTrends[0].id, region: 'Brazil', interest: 52 },

        // Third-Place Cafes regions
        { trendId: insertedTrends[1].id, region: 'United States', interest: 68 },
        { trendId: insertedTrends[1].id, region: 'United Kingdom', interest: 72 },
        { trendId: insertedTrends[1].id, region: 'Canada', interest: 65 },
        { trendId: insertedTrends[1].id, region: 'Australia', interest: 58 },
        { trendId: insertedTrends[1].id, region: 'Germany', interest: 81 },
        { trendId: insertedTrends[1].id, region: 'France', interest: 89 },
        { trendId: insertedTrends[1].id, region: 'Japan', interest: 44 },
        { trendId: insertedTrends[1].id, region: 'Brazil', interest: 35 },

        // Sleep Tourism regions
        { trendId: insertedTrends[2].id, region: 'United States', interest: 76 },
        { trendId: insertedTrends[2].id, region: 'United Kingdom', interest: 69 },
        { trendId: insertedTrends[2].id, region: 'Canada', interest: 62 },
        { trendId: insertedTrends[2].id, region: 'Australia', interest: 71 },
        { trendId: insertedTrends[2].id, region: 'Germany', interest: 58 },
        { trendId: insertedTrends[2].id, region: 'France', interest: 65 },
        { trendId: insertedTrends[2].id, region: 'Japan', interest: 82 },
        { trendId: insertedTrends[2].id, region: 'Brazil', interest: 29 },
    ];

    await db.insert(trendRegions).values(regionsData);

    // Insert demographics data
    const demographicsData = [
        // Silent Walking demographics
        { trendId: insertedTrends[0].id, group: 'age', label: '18-24', value: 35 },
        { trendId: insertedTrends[0].id, group: 'age', label: '25-34', value: 28 },
        { trendId: insertedTrends[0].id, group: 'age', label: '35-44', value: 20 },
        { trendId: insertedTrends[0].id, group: 'age', label: '45-54', value: 12 },
        { trendId: insertedTrends[0].id, group: 'age', label: '55+', value: 5 },
        { trendId: insertedTrends[0].id, group: 'gender', label: 'Female', value: 60 },
        { trendId: insertedTrends[0].id, group: 'gender', label: 'Male', value: 38 },
        { trendId: insertedTrends[0].id, group: 'gender', label: 'Other', value: 2 },

        // Third-Place Cafes demographics
        { trendId: insertedTrends[1].id, group: 'age', label: '18-24', value: 35 },
        { trendId: insertedTrends[1].id, group: 'age', label: '25-34', value: 28 },
        { trendId: insertedTrends[1].id, group: 'age', label: '35-44', value: 20 },
        { trendId: insertedTrends[1].id, group: 'age', label: '45-54', value: 12 },
        { trendId: insertedTrends[1].id, group: 'age', label: '55+', value: 5 },
        { trendId: insertedTrends[1].id, group: 'gender', label: 'Female', value: 60 },
        { trendId: insertedTrends[1].id, group: 'gender', label: 'Male', value: 38 },
        { trendId: insertedTrends[1].id, group: 'gender', label: 'Other', value: 2 },

        // Sleep Tourism demographics
        { trendId: insertedTrends[2].id, group: 'age', label: '18-24', value: 35 },
        { trendId: insertedTrends[2].id, group: 'age', label: '25-34', value: 28 },
        { trendId: insertedTrends[2].id, group: 'age', label: '35-44', value: 20 },
        { trendId: insertedTrends[2].id, group: 'age', label: '45-54', value: 12 },
        { trendId: insertedTrends[2].id, group: 'age', label: '55+', value: 5 },
        { trendId: insertedTrends[2].id, group: 'gender', label: 'Female', value: 60 },
        { trendId: insertedTrends[2].id, group: 'gender', label: 'Male', value: 38 },
        { trendId: insertedTrends[2].id, group: 'gender', label: 'Other', value: 2 },
    ];

    await db.insert(trendDemographics).values(demographicsData);

    // Insert sample posts
    const postsData = [
        // Silent Walking posts
        {
            trendId: insertedTrends[0].id,
            author: '@mindfulmovement',
            content: 'Day 7 of silent walking and I finally understand what everyone was talking about. The mental clarity is unreal ✨ #SilentWalking #Mindfulness',
            sentiment: 'positive',
            postedAt: new Date(currentTimestamp * 1000 - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            trendId: insertedTrends[0].id,
            author: '@zenwalker22',
            content: 'Silent walking hits different when you realize youve been overstimulating yourself with constant audio input',
            sentiment: 'positive',
            postedAt: new Date(currentTimestamp * 1000 - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            trendId: insertedTrends[0].id,
            author: '@genwellness',
            content: 'POV: You try silent walking for the first time and suddenly understand why Gen Z is obsessed with it 👁️👄👁️',
            sentiment: 'positive',
            postedAt: new Date(currentTimestamp * 1000 - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            trendId: insertedTrends[0].id,
            author: '@peacefulpaths',
            content: 'Unpopular opinion: Silent walking is just walking. We shouldnt need to give it a trendy name to make it special',
            sentiment: 'neutral',
            postedAt: new Date(currentTimestamp * 1000 - 2 * 24 * 60 * 60 * 1000).toISOString()
        },

        // Third-Place Cafes posts
        {
            trendId: insertedTrends[1].id,
            author: '@coffeeshopworker',
            content: 'Shoutout to cafes that actually embrace being third places instead of rushing you out after 30 minutes ☕',
            sentiment: 'positive',
            postedAt: new Date(currentTimestamp * 1000 - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            trendId: insertedTrends[1].id,
            author: '@urbanplanner_',
            content: 'Third-place cafes are filling the void left by disappearing community centers and public spaces. This is important urban design stuff',
            sentiment: 'neutral',
            postedAt: new Date(currentTimestamp * 1000 - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            trendId: insertedTrends[1].id,
            author: '@remoteworklife',
            content: 'Found my new third place! This cafe actually has good wifi AND doesnt play music loud enough to wake the dead 🙏',
            sentiment: 'positive',
            postedAt: new Date(currentTimestamp * 1000 - 1 * 24 * 60 * 60 * 1000).toISOString()
        },

        // Sleep Tourism posts
        {
            trendId: insertedTrends[2].id,
            author: '@luxurytravel',
            content: 'Just booked a sleep retreat in the Swiss Alps and honestly? Best decision Ive made all year. My cortisol levels are ready 😴',
            sentiment: 'positive',
            postedAt: new Date(currentTimestamp * 1000 - 8 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            trendId: insertedTrends[2].id,
            author: '@sleepexpert',
            content: 'Sleep tourism is brilliant but lets not forget that good sleep shouldnt be a luxury only available on vacation',
            sentiment: 'neutral',
            postedAt: new Date(currentTimestamp * 1000 - 9 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            trendId: insertedTrends[2].id,
            author: '@wellnesswanderer',
            content: 'Update from my sleep tourism trip: I slept 11 hours last night and feel like a completely different person ✨ This is what we needed',
            sentiment: 'positive',
            postedAt: new Date(currentTimestamp * 1000 - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            trendId: insertedTrends[2].id,
            author: '@budget_traveler',
            content: 'Sleep tourism sounds amazing but who has $3000 to spend on sleeping? Make it make sense',
            sentiment: 'negative',
            postedAt: new Date(currentTimestamp * 1000 - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
    ];

    await db.insert(trendPosts).values(postsData);

    console.log('✅ Trends seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});