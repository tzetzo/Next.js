"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import type { Post, Topic } from "@prisma/client";
import paths from "@/paths";
import { auth } from "@/auth";
import { db } from "@/db";

const createPostSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
});

interface CreatePostProps {
  errors: {
    // errors connected to form fields
    // title & content correspond to the names in the form
    title?: string[];
    content?: string[];
    // errors like user not signed in, DB error
    // we use _ so it doesnt collide with any future field names from the form
    _form?: string[];
  };
}

export async function createPost(
  topicSlug: string,
  formState: CreatePostProps,
  formData: FormData
): Promise<CreatePostProps> {
  const result = createPostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  });

  if (!result.success) {
    return { errors: result.error?.flatten().fieldErrors };
  }

  const session = await auth();
  if (!session || !session.user) {
    return {
      errors: {
        _form: ["You must be signed in to do this."],
      },
    };
  }

  // When we READ data from the DB we dont use try/catch!!!
  const topic = await db.topic.findFirst({
    where: {
      slug: topicSlug,
    },
  });

  if (!topic) return { errors: { _form: ["Cannot find topic"] } };

  let post: Post;
  try {
    post = await db.post.create({
      data: {
        title: result.data.title,
        content: result.data.content,
        userId: session.user.id,
        topicId: topic.id,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { errors: { _form: [error.message] } };
    } else {
      return { errors: { _form: ["Something went wrong"] } };
    }
  }

  revalidatePath(paths.topicShow(topicSlug));
  redirect(paths.postShow(topicSlug, post.id));
}
