import type { Post } from "@prisma/client";
import { db } from "@/db";

// type alias extends type alias
// manually writing the type of data returned by our query
export type PostWithData = Post & {
  topic: { slug: string };
  user: { name: string | null };
  _count: { comments: number };
};
// OR as alternative if we dont want to write it manually
// export type PostWithData = Awaited<
//   ReturnType<typeof fetchPostsByTopicSlug>
// >[number];

export function fetchPostsByTopicSlug(slug: string): Promise<PostWithData[]> {
  // goes with the first type alias above!!!
  // export function fetchPostsByTopicSlug(slug: string) {
  return db.post.findMany({
    where: {
      topic: { slug },
    },
    include: {
      topic: { select: { slug: true } },
      user: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });
}

export function fetchTopPosts(): Promise<PostWithData[]> {
  return db.post.findMany({
    orderBy: [
      {
        comments: {
          _count: "desc",
        },
      },
    ],
    include: {
      topic: { select: { slug: true } },
      user: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    take: 5,
  });
}

export function fetchPostsBySearchTerm(term: string): Promise<PostWithData[]> {
  return db.post.findMany({
    where: {
      OR: [{ title: { contains: term } }, { content: { contains: term } }],
    },
    include: {
      topic: { select: { slug: true } },
      user: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  });
}
