import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trends, trendTags, trendVelocityPoints, trendRegions, trendPosts, trendDemographics } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const { slug } = params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json({ 
        error: "Valid slug is required",
        code: "INVALID_SLUG" 
      }, { status: 400 });
    }

    const sanitizedSlug = slug.trim();

    // Fetch main trend by slug
    const trendResult = await db.select()
      .from(trends)
      .where(eq(trends.slug, sanitizedSlug))
      .limit(1);

    if (trendResult.length === 0) {
      return NextResponse.json({ 
        error: 'Trend not found',
        code: 'TREND_NOT_FOUND' 
      }, { status: 404 });
    }

    const trend = trendResult[0];

    // Fetch all nested data in parallel
    const [
      tagsResult,
      velocityPointsResult,
      regionsResult,
      postsResult,
      demographicsResult
    ] = await Promise.all([
      // Fetch tags
      db.select()
        .from(trendTags)
        .where(eq(trendTags.trendId, trend.id)),

      // Fetch velocity points sorted by periodIndex
      db.select()
        .from(trendVelocityPoints)
        .where(eq(trendVelocityPoints.trendId, trend.id))
        .orderBy(asc(trendVelocityPoints.periodIndex)),

      // Fetch regions
      db.select()
        .from(trendRegions)
        .where(eq(trendRegions.trendId, trend.id)),

      // Fetch posts
      db.select()
        .from(trendPosts)
        .where(eq(trendPosts.trendId, trend.id)),

      // Fetch demographics
      db.select()
        .from(trendDemographics)
        .where(eq(trendDemographics.trendId, trend.id))
    ]);

    // Build complete trend object with nested data
    const completeTrend = {
      ...trend,
      tags: tagsResult,
      velocityPoints: velocityPointsResult,
      regions: regionsResult,
      posts: postsResult,
      demographics: demographicsResult
    };

    return NextResponse.json(completeTrend);

  } catch (error) {
    console.error('GET trend by slug error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}