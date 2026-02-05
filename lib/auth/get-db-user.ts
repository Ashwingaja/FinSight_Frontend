import { auth, currentUser } from '@clerk/nextjs/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function getDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  await connectDB();

  let user = await User.findOne({ clerkUserId: userId });
  if (user) return user;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId) ??
    clerkUser.emailAddresses[0];

  const email = primaryEmail?.emailAddress || `${userId}@users.clerk`;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    clerkUser.username ||
    email;

  user = await User.create({
    clerkUserId: userId,
    email,
    name,
    image: clerkUser.imageUrl,
  });

  return user;
}
