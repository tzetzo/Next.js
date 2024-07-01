"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import type { Topic } from "@prisma/client";
import paths from "@/paths";
import { auth } from "@/auth";
import { db } from "@/db";

const createTopicSchema = z.object({
  name: z
    .string()
    .min(3)
    .regex(/^[a-z-]+$/, {
      message: "Must be lowercase letters or dashes without spaces",
    }),
  description: z.string().min(10),
});

interface CreateTopicProps {
  errors: {
    // errors connected to form fields
    // name & description correspond to the names in the form
    name?: string[];
    description?: string[];
    // errors like user not signed in, DB error
    // we use _ so it doesnt collide with any future field names from the form
    _form?: string[];
  };
}

export async function createTopic(
  formState: CreateTopicProps,
  formData: FormData
): Promise<CreateTopicProps> {
  const result = createTopicSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
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

  let topic: Topic;
  try {
    topic = await db.topic.create({
      data: {
        slug: result.data.name,
        description: result.data.description,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { errors: { _form: [error.message] } };
    } else {
      return { errors: { _form: ["Something went wrong"] } };
    }
  }

  revalidatePath('/');
  redirect(paths.topicShow(topic.slug));
}
