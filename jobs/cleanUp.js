import { prisma } from "../lib/prisma.js";
import { cloudinary } from "../config/cloudinary.js";

export async function cleanUp() {
  try {
    const files = await prisma.file.findMany({
      select: {
        publicId: true,
      },
      where: {
        deletedAt: {
          not: null,
        },
      },
    });

    let filePublicIds;
    if (files.length > 0) {
      filePublicIds = files.map((x) => x.publicId);

      while (filePublicIds.length > 0) {
        const chunk = [];
        while (chunk.length < 100 && filePublicIds.length > 0) {
          chunk.push(filePublicIds.pop());
        }

        const cloudinaryResponse = await cloudinary.api.delete_resources(chunk);
      }
    }

    filePublicIds = files.map((x) => x.publicId);
    await prisma.$transaction(async (tx) => {
      await tx.file.deleteMany({
        where: {
          publicId: {
            in: filePublicIds,
          },
        },
      });

      await tx.folder.deleteMany({
        where: {
          deletedAt: {
            not: null,
          },
        },
      });
    });
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// cleanUp();
