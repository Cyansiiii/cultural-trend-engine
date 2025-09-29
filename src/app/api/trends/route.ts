import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trends, trendTags, trendVelocityPoints, trendRegions, trendPosts, trendDemographics } from '@/db/schema';
import { eq, like, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    // If slug parameter provided, return single trend by slug with full nested data
    if (slug) {
      const trendResult = await db.select()
        .from(trends)
        .where(eq(trends.slug, slug.trim()))
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
        db.select().from(trendTags).where(eq(trendTags.trendId, trend.id)),
        db.select().from(trendVelocityPoints)
          .where(eq(trendVelocityPoints.trendId, trend.id))
          .orderBy(asc(trendVelocityPoints.periodIndex)),
        db.select().from(trendRegions).where(eq(trendRegions.trendId, trend.id)),
        db.select().from(trendPosts).where(eq(trendPosts.trendId, trend.id)),
        db.select().from(trendDemographics).where(eq(trendDemographics.trendId, trend.id))
      ]);

      const completeTrend = {
        ...trend,
        tags: tagsResult,
        velocityPoints: velocityPointsResult,
        regions: regionsResult,
        posts: postsResult,
        demographics: demographicsResult
      };

      return NextResponse.json(completeTrend);
    }

    // Regular list functionality
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Build query for trends
    let query = db.select().from(trends);

    if (search) {
      query = query.where(like(trends.title, `%${search}%`));
    }

    // Apply sorting
    const sortColumn = sort === 'createdAt' ? trends.createdAt :
                      sort === 'updatedAt' ? trends.updatedAt :
                      sort === 'title' ? trends.title :
                      sort === 'volume' ? trends.volume :
                      sort === 'velocity' ? trends.velocity :
                      trends.createdAt;

    query = order === 'asc' ? 
      query.orderBy(asc(sortColumn)) : 
      query.orderBy(desc(sortColumn));

    // Get trends with pagination
    const trendsData = await query.limit(limit).offset(offset);

    // Get tags for all trends
    const trendIds = trendsData.map(trend => trend.id);
    
    if (trendIds.length > 0) {
      // Get all tags for the trends
      const allTags = await Promise.all(
        trendIds.map(async (trendId) => {
          const tags = await db.select()
            .from(trendTags)
            .where(eq(trendTags.trendId, trendId));
          return { trendId, tags: tags.map(t => t.tag) };
        })
      );

      // Combine trends with their tags
      const result = trendsData.map(trend => {
        const trendTagData = allTags.find(t => t.trendId === trend.id);
        return {
          id: trend.id,
          slug: trend.slug,
          title: trend.title,
          volume: trend.volume,
          velocity: trend.velocity,
          sentiment: trend.sentiment,
          tags: trendTagData?.tags || []
        };
      });

      return NextResponse.json(result);
    }

    // Return empty result if no trends
    const result = trendsData.map(trend => ({
      id: trend.id,
      slug: trend.slug,
      title: trend.title,
      volume: trend.volume,
      velocity: trend.velocity,
      sentiment: trend.sentiment,
      tags: []
    }));

    return NextResponse.json(result);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const {
      slug,
      title,
      volume,
      velocity,
      sentiment,
      tags = [],
      velocityPoints = [],
      regions = [],
      demographics = [],
      posts = []
    } = requestBody;

    // Validate required fields
    if (!slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_SLUG" 
      }, { status: 400 });
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ 
        error: "Title is required and cannot be empty",
        code: "MISSING_TITLE" 
      }, { status: 400 });
    }

    if (!volume || volume <= 0) {
      return NextResponse.json({ 
        error: "Volume is required and must be a positive integer",
        code: "INVALID_VOLUME" 
      }, { status: 400 });
    }

    if (!velocity || velocity <= 0) {
      return NextResponse.json({ 
        error: "Velocity is required and must be a positive integer",
        code: "INVALID_VELOCITY" 
      }, { status: 400 });
    }

    if (!sentiment || !['positive', 'neutral', 'negative'].includes(sentiment)) {
      return NextResponse.json({ 
        error: "Sentiment is required and must be 'positive', 'neutral', or 'negative'",
        code: "INVALID_SENTIMENT" 
      }, { status: 400 });
    }

    // Validate slug format (URL-safe)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json({ 
        error: "Slug must be URL-safe format (lowercase letters, numbers, and hyphens only)",
        code: "INVALID_SLUG_FORMAT" 
      }, { status: 400 });
    }

    // Check for duplicate slug
    const existingTrend = await db.select()
      .from(trends)
      .where(eq(trends.slug, slug))
      .limit(1);

    if (existingTrend.length > 0) {
      return NextResponse.json({ 
        error: "Slug already exists",
        code: "DUPLICATE_SLUG" 
      }, { status: 400 });
    }

    // Validate tags array
    if (tags.length > 0) {
      for (const tag of tags) {
        if (!tag || typeof tag !== 'string' || tag.trim() === '') {
          return NextResponse.json({ 
            error: "All tags must be non-empty strings",
            code: "INVALID_TAGS" 
          }, { status: 400 });
        }
      }
    }

    // Validate velocity points
    if (velocityPoints.length > 0) {
      for (const point of velocityPoints) {
        if (!point.hasOwnProperty('periodIndex') || !point.hasOwnProperty('value')) {
          return NextResponse.json({ 
            error: "Velocity points must have periodIndex and value properties",
            code: "INVALID_VELOCITY_POINTS" 
          }, { status: 400 });
        }
        if (point.periodIndex < 0 || point.periodIndex > 11) {
          return NextResponse.json({ 
            error: "Velocity point periodIndex must be between 0 and 11",
            code: "INVALID_PERIOD_INDEX" 
          }, { status: 400 });
        }
        if (typeof point.value !== 'number') {
          return NextResponse.json({ 
            error: "Velocity point value must be an integer",
            code: "INVALID_VELOCITY_VALUE" 
          }, { status: 400 });
        }
      }
    }

    // Validate regions
    if (regions.length > 0) {
      for (const region of regions) {
        if (!region.region || typeof region.region !== 'string') {
          return NextResponse.json({ 
            error: "Region must have a valid region string",
            code: "INVALID_REGION" 
          }, { status: 400 });
        }
        if (typeof region.interest !== 'number' || region.interest < 0 || region.interest > 100) {
          return NextResponse.json({ 
            error: "Region interest must be a number between 0 and 100",
            code: "INVALID_REGION_INTEREST" 
          }, { status: 400 });
        }
      }
    }

    // Validate demographics
    if (demographics.length > 0) {
      for (const demo of demographics) {
        if (!['age', 'gender'].includes(demo.group)) {
          return NextResponse.json({ 
            error: "Demographics group must be 'age' or 'gender'",
            code: "INVALID_DEMO_GROUP" 
          }, { status: 400 });
        }
        if (!demo.label || typeof demo.label !== 'string') {
          return NextResponse.json({ 
            error: "Demographics label must be a non-empty string",
            code: "INVALID_DEMO_LABEL" 
          }, { status: 400 });
        }
        if (typeof demo.value !== 'number' || demo.value < 0 || demo.value > 100) {
          return NextResponse.json({ 
            error: "Demographics value must be a number between 0 and 100",
            code: "INVALID_DEMO_VALUE" 
          }, { status: 400 });
        }
      }
    }

    // Validate posts
    if (posts.length > 0) {
      for (const post of posts) {
        if (!post.author || typeof post.author !== 'string') {
          return NextResponse.json({ 
            error: "Post author must be a non-empty string",
            code: "INVALID_POST_AUTHOR" 
          }, { status: 400 });
        }
        if (!post.content || typeof post.content !== 'string') {
          return NextResponse.json({ 
            error: "Post content must be a non-empty string",
            code: "INVALID_POST_CONTENT" 
          }, { status: 400 });
        }
        if (!['positive', 'neutral', 'negative'].includes(post.sentiment)) {
          return NextResponse.json({ 
            error: "Post sentiment must be 'positive', 'neutral', or 'negative'",
            code: "INVALID_POST_SENTIMENT" 
          }, { status: 400 });
        }
        if (!post.postedAt) {
          return NextResponse.json({ 
            error: "Post postedAt timestamp is required",
            code: "INVALID_POST_DATE" 
          }, { status: 400 });
        }
      }
    }

    // Create trend with nested data in transaction
    const now = new Date().toISOString();

    // Insert main trend record
    const newTrend = await db.insert(trends)
      .values({
        slug: slug.trim(),
        title: title.trim(),
        volume,
        velocity,
        sentiment,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    const trendId = newTrend[0].id;

    // Insert related data
    const insertPromises = [];

    // Insert tags
    if (tags.length > 0) {
      const tagInserts = tags.map((tag: string) => ({
        trendId,
        tag: tag.trim()
      }));
      insertPromises.push(db.insert(trendTags).values(tagInserts));
    }

    // Insert velocity points
    if (velocityPoints.length > 0) {
      const velocityInserts = velocityPoints.map((point: any) => ({
        trendId,
        periodIndex: point.periodIndex,
        value: point.value
      }));
      insertPromises.push(db.insert(trendVelocityPoints).values(velocityInserts));
    }

    // Insert regions
    if (regions.length > 0) {
      const regionInserts = regions.map((region: any) => ({
        trendId,
        region: region.region,
        interest: region.interest
      }));
      insertPromises.push(db.insert(trendRegions).values(regionInserts));
    }

    // Insert demographics
    if (demographics.length > 0) {
      const demoInserts = demographics.map((demo: any) => ({
        trendId,
        group: demo.group,
        label: demo.label,
        value: demo.value
      }));
      insertPromises.push(db.insert(trendDemographics).values(demoInserts));
    }

    // Insert posts
    if (posts.length > 0) {
      const postInserts = posts.map((post: any) => ({
        trendId,
        author: post.author,
        content: post.content,
        sentiment: post.sentiment,
        postedAt: post.postedAt
      }));
      insertPromises.push(db.insert(trendPosts).values(postInserts));
    }

    // Execute all inserts
    await Promise.all(insertPromises);

    // Fetch the complete trend with all nested data
    const [createdTags, createdVelocityPoints, createdRegions, createdDemographics, createdPosts] = await Promise.all([
      db.select().from(trendTags).where(eq(trendTags.trendId, trendId)),
      db.select().from(trendVelocityPoints).where(eq(trendVelocityPoints.trendId, trendId)),
      db.select().from(trendRegions).where(eq(trendRegions.trendId, trendId)),
      db.select().from(trendDemographics).where(eq(trendDemographics.trendId, trendId)),
      db.select().from(trendPosts).where(eq(trendPosts.trendId, trendId))
    ]);

    const result = {
      ...newTrend[0],
      tags: createdTags.map(t => t.tag),
      velocityPoints: createdVelocityPoints,
      regions: createdRegions,
      demographics: createdDemographics,
      posts: createdPosts
    };

    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error,
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}