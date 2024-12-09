'use server';

import { createSessionAdmin } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwrite/config';
import { ID, Query } from 'node-appwrite';
import { parseStringify } from '@/lib/utils';
import { cookies } from 'next/headers';

const getUserByEmail = async (email: string) => {
  const { database } = await createSessionAdmin();

  const result = await database.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal('email', [email])]
  );

  return result.total > 0 ? result.documents[0] : null;
};

const handleError = (error: unknown, message: string) => {
  throw message;
};

export const sendEmailOTP = async (email: string) => {
  const { account } = await createSessionAdmin();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, 'Failed to sent OTP.');
  }
};

export const createAccount = async ({
  fullName,
  email
}: {
  fullName: string;
  email: string;
}) => {
  const existingAccount = await getUserByEmail(email);
  const accountId = await sendEmailOTP(email);

  if (!accountId) {
    throw new Error('Failed to sent OTP.');
  }

  if (!existingAccount) {
    const { database } = await createSessionAdmin();

    await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar:
          'https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes.png',
        accountId
      }
    );
  }
  return parseStringify({ accountId });
};

export const verifySecret = async (userId: string, password: string) => {
  try {
    const { account } = await createSessionAdmin();
    const session = await account.createSession(userId, password);

    console.log(session);
    (await cookies()).set('appwrite-secret', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true
    });
    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, 'Failed to verify secret.');
  }
};