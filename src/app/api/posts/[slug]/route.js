import { NextResponse } from "next/server";
import prisma from "@/utils/connect";
import { getAuthSession } from "@/utils/auth";

// GET single post
export const GET = async (req, { params }) => {
  const { slug } = params;

  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { user: true },
    });

    return new NextResponse(JSON.stringify(post, { status: 200 }));
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
};

// UPDATE post
export const PUT = async (req, { params }) => {
  const { slug } = params;
  const session = await getAuthSession();
  
  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Not Authenticated!" }, { status: 401 })
    );
  }

  try {
    const body = await req.json();
    const { title, desc, img } = body;

    // Get the existing post to check ownership
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      include: { user: true },
    });

    // Check if post exists
    if (!existingPost) {
      return new NextResponse(
        JSON.stringify({ message: "Post not found!" }, { status: 404 })
      );
    }

    // Check if the current user is the owner of the post
    if (existingPost.user.email !== session.user.email) {
      return new NextResponse(
        JSON.stringify({ message: "Not authorized!" }, { status: 403 })
      );
    }

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { slug },
      data: {
        title,
        desc,
        img,
      },
    });

    return new NextResponse(
      JSON.stringify(updatedPost, { status: 200 })
    );
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
};

// DELETE post
export const DELETE = async (req, { params }) => {
  const { slug } = params;
  const session = await getAuthSession();
  
  if (!session) {
    return new NextResponse(
      JSON.stringify({ message: "Not Authenticated!" }, { status: 401 })
    );
  }

  try {
    // Get the existing post to check ownership
    const existingPost = await prisma.post.findUnique({
      where: { slug },
      include: { user: true },
    });

    // Check if post exists
    if (!existingPost) {
      return new NextResponse(
        JSON.stringify({ message: "Post not found!" }, { status: 404 })
      );
    }

    // Check if the current user is the owner of the post
    if (existingPost.user.email !== session.user.email) {
      return new NextResponse(
        JSON.stringify({ message: "Not authorized!" }, { status: 403 })
      );
    }

    // Delete associated comments first (to avoid foreign key constraint errors)
    await prisma.comment.deleteMany({
      where: { postSlug: slug },
    });

    // Delete the post
    await prisma.post.delete({
      where: { slug },
    });

    return new NextResponse(
      JSON.stringify({ message: "Post deleted successfully" }, { status: 200 })
    );
  } catch (err) {
    console.log(err);
    return new NextResponse(
      JSON.stringify({ message: "Something went wrong!" }, { status: 500 })
    );
  }
};